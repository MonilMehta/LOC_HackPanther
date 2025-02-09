import { Router }  from "express";
import { getAllCases } from "../controllers/case/getAllCaseDetails.js";
import { getOneCase } from "../controllers/case/getOneCase.js";
import { registerCase } from "../controllers/case/registerCase.js";
import { registerEvidence } from "../controllers/evidence/registerEvidence.js";
import { registerWitness } from "../controllers/witness/registerWitness.js";
import { assignOfficerToCase } from "../controllers/officer/registerOfficerToCase.js";
import { getCaseLocations } from "../controllers/case/getCaseLocation.js";

const router = Router();

router.route("/registerCase").post(registerCase);

router.route("/getCase").get(getAllCases);

router.route("/getCaseById").get(getOneCase);

router.route("/registerEvidence").post(registerEvidence);

router.route("/registerWitness").post(registerWitness);

router.route("/assignOfficer").post(assignOfficerToCase);

router.route("/registerEvidence").post(registerEvidence);

router.route("/getCaseLocation").get(getCaseLocations);


export default router

