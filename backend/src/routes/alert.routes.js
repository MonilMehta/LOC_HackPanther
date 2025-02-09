import {Router} from "express";
import sendAlert from "../controllers/Alert/sendAlert.js";
import getAlert from "../controllers/Alert/getAlert.js";
const router = Router();

router.route("/sendAlert").post(sendAlert);
router.route("/getAlert").get(getAlert);

export default router

