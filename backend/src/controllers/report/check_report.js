import { ReportBy } from "../../models/report.models.js";

const check_report =  async (req, res) => {
  try {
    const { id } = req.body;
    // Find the report by ID and update is_checked to true
    const report = await ReportBy.findByIdAndUpdate(
      id,
      { is_checked: true },
      { new: true } // Return the updated document
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    // Return the updated report
    res.status(200).json({
      success: true,
      data: report,
      message: "Report fetched and marked as checked"
    });

  } catch (error) {
    console.error("Error fetching report:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

export { check_report };