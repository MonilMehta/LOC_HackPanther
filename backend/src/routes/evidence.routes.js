import { Router } from "express";
import { getAllCases, getCaseEvidence, uploadEvidence } from "../controllers/evidence.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)

router.route("/get-cases").get(getAllCases);

router.route("/get-evidence/:caseId").get(getCaseEvidence);

router.route("/upload-evidence").post(uploadEvidence);

export default router