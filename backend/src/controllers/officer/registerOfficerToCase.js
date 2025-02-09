import { Case } from "../../models/case.models.js";
import { User } from "../../models/user.models.js";

export const assignOfficerToCase = async (req, res) => {
  try {
    const { caseId, officerId } = req.body;

    // Validate required fields
    if (!caseId || !officerId) {
      return res.status(400).json({ success: false, message: "caseId and officerId are required" });
    }

    // Check if the case exists
    const caseDetails = await Case.findById(caseId);
    if (!caseDetails) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    // Check if the officer exists and has the role "officer"
    const officer = await User.findById(officerId);
    if (!officer) {
      return res.status(404).json({ success: false, message: "Officer not found or invalid role" });
    }

    // Check if the officer is already assigned to the case
    if (caseDetails.assignedOfficers.includes(officerId)) {
      return res.status(400).json({ success: false, message: "Officer already assigned to this case" });
    }

    // Assign the officer to the case
    caseDetails.assignedOfficers.push(officerId);
    await caseDetails.save();

    // Update the officer's assignedCases
    officer.policeDetails.assignedCases.push(caseId);
    await officer.save();

    res.status(200).json({ success: true, message: "Officer assigned successfully", data: caseDetails });
  } catch (error) {
    console.error("Error assigning officer:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
