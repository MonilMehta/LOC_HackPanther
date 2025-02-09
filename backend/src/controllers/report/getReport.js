import { ReportBy } from "../../models/report.models.js";

const getAllReports = async (req, res) => {
  try {
    // Fetch all reports from the database
    const reports = await ReportBy.find();

    // Check if any reports exist
    if (!reports.length) {
      return res.status(404).json({
        success: false,
        message: "No reports found"
      });
    }

    // Return success response with the fetched reports
    res.status(200).json({
      success: true,
      data: reports,
      message: "Reports fetched successfully"
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export { getAllReports };
