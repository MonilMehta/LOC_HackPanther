import { createReport } from "../controllers/report/registerReport.js";
import { Router } from "express";
import { getAllReports } from "../controllers/report/getReport.js";
import { check_report } from "../controllers/report/check_report.js";
const router = Router();

router.route("/registerReport").post(createReport);
router.route("/getReport").get(getAllReports);
router.route("/checkReport").get(check_report);

export default router