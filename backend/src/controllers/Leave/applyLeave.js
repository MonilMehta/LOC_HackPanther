import { Leave } from "../../models/leave.models.js";
import { User } from "../../models/user.models.js";

const applyLeave = async (req, res) => {
  try {
    const { officer, type, startDate, endDate, reason } = req.body;
    
    // Validate required fields
    if (!officer || !startDate || !endDate || !reason) {
      return res.status(400).json({ 
        success: false, 
        message: "Officer, start date, end date, and reason are required." 
      });
    }
    
    // Find the officer (user) by ID
    const user = await User.findById(officer);
    if (!user) {
      return res.status(404).json({ success: false, message: "Officer not found." });
    }
    
    // Convert the start and end dates to Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Validate that endDate is not before startDate
    if (end < start) {
      return res.status(400).json({ success: false, message: "End date must be after start date." });
    }
    
    // Calculate the number of days between the start and end dates (inclusive)
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Check if the officer has enough available leave
    if (user.avaliableLeave < diffDays) {
      return res.status(400).json({ 
        success: false, 
        message: "Insufficient leave balance." 
      });
    }
    
    // Update the officer's available and used leave counts
    user.avaliableLeave -= diffDays;
    user.usedLeave += diffDays;
    await user.save();
    
    // Create and save the leave application
    const leaveApplication = new Leave({ officer, type, startDate, endDate, reason });
    const savedLeave = await leaveApplication.save();

    res.status(201).json({ 
      success: true, 
      data: savedLeave, 
      message: "Leave application submitted successfully." 
    });
  } catch (error) {
    console.error("Error applying for leave:", error);
    res.status(500).json({ 
      success: false, 
      message: "Server error", 
      error: error.message 
    });
  }
};

export { applyLeave };
