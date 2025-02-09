import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Evidence } from "../models/evidence.models.js";
import { Case } from "../models/case.models.js";
import { User } from "../models/user.models.js";

const getAllCases = asyncHandler(async (req, res) => {
  try {
    const cases = await Case.find(
      {},
      "caseNo title status reportedBy createdAt"
    )
      .populate("reportedBy", "name")
      .lean();
    return res.status(200).json(new ApiResponse(200, cases, "Cases fetched"));
  } catch (error) {
    throw new ApiError(400, "Cases not found");
  }
});

const getCaseEvidence = asyncHandler(async (req, res) => {
  try {
    const { caseId } = req.params;

    if (!caseId) {
      throw new ApiError(400, "Case ID is required");
    }

    const evidenceList = await Evidence.find({ caseId })
      .select("type fileUrl uploadedBy")
      .lean();

    if (!evidenceList.length) {
      throw new ApiError(404, "No evidence found for this case");
    }

    const userIds = [
      ...new Set(evidenceList.map((e) => e.uploadedBy.toString())),
    ];

    const users = await User.find({ _id: { $in: userIds } })
      .select("_id fullname email phone_no")
      .lean();

    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    // Add user details to each evidence entry
    const evidenceWithUser = evidenceList.map((e) => ({
      ...e,
      uploadedBy: userMap[e.uploadedBy.toString()] || null, // Assign user details or null if not found
    }));

    return res
      .status(200)
      .json(new ApiResponse(200, evidenceWithUser, "Evidence fetched"));
  } catch (error) {
    throw new ApiError(404, "Evidence not found");
  }
});

const uploadEvidence = asyncHandler(async (req, res) => {
  try {
    const { caseId, type, fileUrl } = req.body;
    const uploadedBy = req.user._id;

    console.log(caseId, type, fileUrl, uploadedBy);
    if (!caseId || !type || !fileUrl) {
      throw new ApiError(400, "Case ID, type, and file URL are required");
    }
    console.log("hii");
    const existingCase = await Case.findById(caseId);
    if (!existingCase) {
      throw new ApiError(404, "Case not found");
    }
    console.log("hiii");

    const validTypes = ["Photo", "Video", "Document"];
    if (!validTypes.includes(type)) {
      throw new ApiError(400, "Invalid evidence type");
    }
    console.log("huhuy");

    const newEvidence = await Evidence.create({
      caseId,
      type,
      fileUrl,
      uploadedBy,
      createdAt: new Date(),
    });
    console.log("huheuis");

    existingCase.evidence.push(newEvidence);
    await existingCase.save();

    return res
      .status(201)
      .json(
        new ApiResponse(201, newEvidence, "Evidence uploaded successfully")
      );
  } catch (error) {
    throw new ApiError(500, "Failed to upload evidence");
  }
});

export { getAllCases, getCaseEvidence, uploadEvidence };
