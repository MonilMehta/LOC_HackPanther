import { Case } from "../../models/case.models.js";
import { Witness } from "../../models/witness.models.js";

const registerWitness = async (req, res) => {
  try {
    const { caseId, witnessName, statement, recordedBy } = req.body;

    // Validate required fields
    if (!caseId || !witnessName || !statement) {
      return res.status(400).json({ success: false, message: "caseId, witnessName, and statement are required" });
    }

    // Check if the case exists
    const caseExists = await Case.findById(caseId);
    if (!caseExists) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    // Create new witness statement
    const newWitness = new Witness({
      caseId,
      witnessName,
      statement,
      recordedBy,
    });

    // Save witness statement to database
    const savedWitness = await newWitness.save();

    res.status(201).json({ success: true, message: "Witness statement added successfully", data: savedWitness });
  } catch (error) {
    console.error("Error registering witness:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {registerWitness}

