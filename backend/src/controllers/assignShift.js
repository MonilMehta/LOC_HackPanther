import { User } from "../models/user.models.js";

const updateUserShift = async (req, res) => {
  try {
    const { fullname, shift } = req.body;

    // Validate required fields
    if (!fullname || !shift) {
      return res.status(400).json({
        success: false,
        message: "Both fullname and shift are required.",
      });
    }

    // Allowed shift values
    const allowedShifts = ["Morning", "Evening", "Night"];
    if (!allowedShifts.includes(shift)) {
      return res.status(400).json({
        success: false,
        message: `Invalid shift. Allowed shifts are: ${allowedShifts.join(", ")}`,
      });
    }

    // Find user by fullname
    const user = await User.findOne({ fullname });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with the provided fullname.",
      });
    }

    // Update (or assign) the shift
    user.shift_type = shift;
    await user.save();

    return res.status(200).json({
      success: true,
      data: { fullname: user.fullname, badgeNumber: user.policeDetails.badgeNumber, shift_type: user.shift_type },
      message: "User shift updated successfully.",
    });
  } catch (error) {
    console.error("Error updating user shift:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

export { updateUserShift };
