import { Attendance } from "../../models/attendance.models.js";

const enterAttendance = async (req, res) => {
    try {
        const { officer, status, date, in_time, out_time } = req.body;

        const newAttendance = new Attendance({
            officer,
            status,
            date,
            in_time,
            out_time
        });

        await newAttendance.save();

        return res.status(201).json({ message: "Attendance entered successfully.", newAttendance });
    } catch (error) {
        console.error('Error entering attendance:', error);
        return res.status(500).json({ message: "Error entering attendance.", error: error.message });
    }
}

export { enterAttendance };