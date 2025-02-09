import { Leave } from "../../models/leave.models.js";

const approveLeave = async (req, res) => {
  try {
    const { leaveId } = req.params;
    const leave = await Leave.findById(leaveId);

    if (!leave) {
      return res.status(404).json({ success: false, message: "Leave application not found." });
    }

    leave.status = "approved";
    const updatedLeave = await leave.save();

    res.status(200).json({ success: true, data: updatedLeave, message: "Leave application approved successfully." });
  } catch (error) {
    console.error("Error approving leave:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export { approveLeave };