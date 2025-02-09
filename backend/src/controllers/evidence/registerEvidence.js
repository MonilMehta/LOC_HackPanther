import { Evidence } from "../../models/evidence.models.js";
import { Case } from "../../models/case.models.js";

const registerEvidence = async (req, res) => {
  try {
    const { caseId, type, fileUrl, uploadedBy } = req.body;

    // Validate required fields
    if (!caseId || !type || !fileUrl || !uploadedBy) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Validate evidence type
    const validTypes = ["Photo", "Video", "Document"];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid evidence type" });
    }

    // Check if the case exists
    const caseExists = await Case.findById(caseId);
    if (!caseExists) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    // Create new evidence
    const newEvidence = new Evidence({
      caseId,
      type,
      fileUrl,
      uploadedBy,
    });

    // Save evidence to database
    const savedEvidence = await newEvidence.save();

    res.status(201).json({ success: true, message: "Evidence added successfully", data: savedEvidence });
  } catch (error) {
    console.error("Error registering evidence:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {registerEvidence}