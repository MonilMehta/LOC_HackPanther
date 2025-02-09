import { User } from "../models/user.models.js";

const getUsersByShift = async (req, res) => {
  try {
    const { shift } = req.body; // e.g., "Night", "Morning", "Evening"
    
    // Validate that the shift parameter is provided and is one of the allowed values
    const allowedShifts = ["Morning", "Evening", "Night"];
    if (!shift || !allowedShifts.includes(shift)) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid or missing shift. Allowed shifts: Morning, Evening, Night." 
      });
    }
    
    // Find users with the specified shift type and select only fullname and policeDetails.badgeNumber
    const users = await User.find({ shift_type: shift })
      .select("fullname policeDetails.badgeNumber shift_type");

    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users by shift:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

export { getUsersByShift };
