import {Router} from "express";

const router = Router();

import getBulletin from "../controllers/Bulletin/getBulletin.js";
import createBulletin from "../controllers/Bulletin/createBulletin.js";

router.route("/getBulletin").get(getBulletin);
router.route("/createBulletin").post(createBulletin);

export default router

