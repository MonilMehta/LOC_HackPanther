import { Case } from "../../models/case.models.js";

const getOneCase = async (req, res) => {
  try {
    const { caseNo } = req.body;

    // Find the case using caseNo
    const caseData = await Case.findOne({ caseNo })

    // If case is not found
    if (!caseData) {
      return res.status(404).json({ success: false, message: "Case not found" });
    }

    res.status(200).json({ success: true, data: caseData });
  } catch (error) {
    console.error("Error fetching case:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export {getOneCase}
