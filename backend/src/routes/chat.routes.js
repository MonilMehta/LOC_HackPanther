import { Router } from "express";
import { sendMessage, getChatById, getChats, markAsRead } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/send-message").post(sendMessage);

// router.route("/delete-message").delete(deleteMessage);

router.route("/chat/:chatId").get(getChatById);

router.route("/get-chats").get(getChats);

router.route("/mark-as-read").post(markAsRead);

export default router;