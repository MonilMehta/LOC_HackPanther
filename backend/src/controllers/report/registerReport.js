import { ReportBy } from "../../models/report.models.js";

const createReport = async (req, res) => {
  try {
    // Destructure the required fields from the request body,
    // including the new 'time' field.
    const {
      title,
      description,
      location, // expected to include street, city, state, pincode
      type_of_crime,
      date, // optional; if not provided, the model defaults to Date.now
      time    // required time field (e.g., "14:30:00" or "2:30 PM")
    } = req.body;

    // Validate required fields
    if (
      !title ||
      !description ||
      !location ||
      !type_of_crime ||
      !date ||
      !time
    ) {
      return res.status(400).json({
        success: false,
        message: "Title, description, location, type of crime, evidence photo URL, and time are required."
      });
    }

    // Create a new report instance
    const newReport = new ReportBy({
      title,
      description,
      location,
      type_of_crime,
      // evidence_photo_url,
      date,  // if omitted, defaults to Date.now
      time   // new required time field
    });

    // Save the report to the database
    const savedReport = await newReport.save();

    // Return success response with the created report data
    res.status(201).json({
      success: true,
      data: savedReport,
      message: "Report created successfully"
    });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export { createReport };
