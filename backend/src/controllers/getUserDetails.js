import { User } from "../models/user.models.js";

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password -refreshToken") // Exclude sensitive fields
      // Populate the assignedCases inside policeDetails with full case details
      .populate({
        path: "policeDetails.assignedCases",
        select: "-__v", // Exclude __v or any other fields if needed
        // If you need to further populate nested fields within the Case documents, you can add a nested populate option here.
      })
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export { getAllUsers };
