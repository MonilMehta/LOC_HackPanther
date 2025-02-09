import { Case } from "../../models/case.models.js";
import axios from "axios";

const GEOCODING_BASE_URL = "https://geocode.maps.co/search";
const API_KEY = "67a76e6e53b62679976094bqga142b9"; // Replace with your actual API key

const getCaseLocations = async (req, res) => {
  try {
    // Fetch all cases with just the location and caseNo fields
    const cases = await Case.find().select('location caseNo -_id');
    //console.log(cases)
    // Process each case to get coordinates
    const casesWithCoordinates = await Promise.all(
      cases.map(async (case_) => {
        try {
          const address  = case_.location.street;
          //console.log(case_.location.street)
          // Skip if no address
          //console.log(address)
          if (!address) {
            return {
              caseNo: case_.caseNo,
              location: case_.location,
              coordinates: null,
              error: "No address available"
            };
          }

          // Make request to new Geocoding API
          const response = await axios.get(`${GEOCODING_BASE_URL}`, {
            params: {
              q: address,
              api_key: API_KEY
            }
          });

          const data = response.data[0]; // Assuming the first result is the most relevant

          return {
            caseNo: case_.caseNo,
            location: case_.location,
            coordinates: {
              lat: data.lat,
              lon: data.lon
            }
          };

        } catch (error) {
          console.error(`Error geocoding case ${case_.caseNo}:`, error.message);
          return {
            caseNo: case_.caseNo,
            location: case_.location,
            coordinates: null,
            error: "Geocoding failed"
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      data: casesWithCoordinates
    });

  } catch (error) {
    console.error("Error fetching case locations:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching case locations"
    });
  }
};

export { getCaseLocations };