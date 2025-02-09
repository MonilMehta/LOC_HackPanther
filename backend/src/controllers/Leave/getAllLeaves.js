import { Leave } from "../../models/leave.models.js";

const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find().populate('officer');
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export { getAllLeaves };