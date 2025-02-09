import { Router } from "express";
import {applyLeave} from "../controllers/Leave/applyLeave.js";
import { getLeaves } from "../controllers/Leave/getLeave.js";
import { getAllLeaves } from "../controllers/Leave/getAllLeaves.js";
import { approveLeave } from "../controllers/Leave/approveLeave.js";

const router = Router();

router.route("/applyLeave").post(applyLeave);
router.route("/getLeave").get(getLeaves);
router.get('/getAllLeaves', getAllLeaves);
router.put('/approveLeave/:leaveId', approveLeave);

export default router


