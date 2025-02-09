import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, loginUser, logoutUser, refreshAccessToken, registerUser, updateAccountDetails } from "../controllers/user.controller.js";
import { getAllUsers } from "../controllers/getUserDetails.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getUsersByShift } from "../controllers/getShift.js";
import { updateUserShift } from "../controllers/assignShift.js";

const router = Router();

router.route("/register").post(registerUser);

router.route("/login").post(loginUser);

router.route("/get-user").get(getAllUsers);

router.route("/get-shift").get(getUsersByShift);

router.route("/update-shift").patch(updateUserShift);
// secured routes
router.route("/logout").post(verifyJWT ,logoutUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-details").patch(verifyJWT, updateAccountDetails)

router.route("/get-users").get(verifyJWT, getAllUsers);

export default router