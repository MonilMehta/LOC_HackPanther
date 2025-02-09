import { Case } from "../../models/case.models.js";

const getAllCases = async (req, res) => {
  try {
    const cases = await Case.find()
      .populate("assignedOfficers", "-password -refreshToken -__v") // Fetch full officer details but exclude password & tokens
      .populate("reportedBy", "-password -refreshToken -__v") // Fetch citizen details but exclude sensitive fields
      .populate("evidence", "-__v") // Fetch evidence details
      .populate("witnessStatements", "-__v") // Fetch witness statements
      .select("-__v") // Exclude version field

    res.status(200).json({ success: true, data: cases });
  } catch (error) {
    console.error("Error fetching cases:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { getAllCases }
