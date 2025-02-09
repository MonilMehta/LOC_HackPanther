import { Leave } from "../../models/leave.models.js";

const getLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("officer", "fullname email phone_no"); // Only fetch fullname and email for the officer

    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    console.error("Error fetching leaves:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export { getLeaves };
