import { Attendance } from "../../models/attendance.models.js";

const getAttendance = async (req, res) => {
    try {
        const attendance = await Attendance.find()
          .populate("officer", "fullname email phone_no"); // Only fetch fullname and email for the officer
    
        res.status(200).json({ success: true, data: attendance });
      } catch (error) {
        console.error("Error fetching leaves:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
      }
};

export { getAttendance };