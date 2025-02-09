import {Router} from "express";
import { enterAttendance } from "../controllers/attendance/enterAttendance.js";
import { getAttendance } from "../controllers/attendance/getAttendence.js";
const router = Router();

router.route("/enterAttendance").post(enterAttendance);
router.route("/getAttendance").get(getAttendance);

export default router
