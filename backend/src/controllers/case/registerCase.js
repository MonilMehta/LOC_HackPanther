import { Case } from "../../models/case.models.js";
import { User } from "../../models/user.models.js";
import axios from "axios";

const GEOCODING_BASE_URL = "https://geocode.maps.co/search";
const API_KEY = "67a76e6e53b62679976094bqga142b9"; // Replace with your actual API key

// Function to generate the next case number
const generateCaseNumber = async () => {
  const lastCase = await Case.findOne().sort({ caseNo: -1 }); // Get the latest case
  return lastCase ? lastCase.caseNo + 1 : 1; // If no case exists, start from 1
};

// Function to get coordinates from the geocoding API
const getCoordinates = async (address) => {
  try {
    const response = await axios.get(`${GEOCODING_BASE_URL}`, {
      params: {
        q: address,
        api_key: API_KEY,
      },
    });
    const data = response.data[0]; // Assuming the first result is the most relevant
    return { latitude: data.lat, longitude: data.lon };
  } catch (error) {
    console.error("Error fetching coordinates:", error.message);
    return { latitude: null, longitude: null };
  }
};

// Create/Register a New Case
const registerCase = async (req, res) => {
  try {
    const { title, description, reportedBy, assignedOfficers, location, evidence, witnessStatements } = req.body;

    // Validate required fields
    if (!title || !reportedBy) {
      return res.status(400).json({ message: "Title and reportedBy are required." });
    }

    // Generate a unique case number by incrementing the last case number
    const caseNo = await generateCaseNumber();

    // Validate if assigned officers exist
    if (assignedOfficers && assignedOfficers.length > 0) {
      for (const officerId of assignedOfficers) {
        const officer = await User.findById(officerId);
        if (!officer || officer.role !== "officer") {
          return res.status(404).json({ message: `Officer with ID ${officerId} not found or invalid.` });
        }
      }
    }

    // Get coordinates for the location
    const address = `${location.street}, ${location.city}, ${location.state}, ${location.pincode}`;
    const { latitude, longitude } = await getCoordinates(address);

    // Create a new case
    const newCase = new Case({
      caseNo,
      title,
      description,
      status: "Open",
      reportedBy,
      assignedOfficers,
      location: {
        ...location,
        latitude,
        longitude,
      },
      evidence,
      witnessStatements,
    });

    await newCase.save();

    res.status(201).json({
      message: "Case registered successfully",
      case: newCase,
    });
  } catch (error) {
    console.error("Error registering case:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { registerCase };