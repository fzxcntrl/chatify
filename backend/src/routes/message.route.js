import express from "express";
import {
  deleteConversation,
  deleteMessage,
  getAllContacts,
  getChatPartners,
  getMessagesByUserId,
  markMessagesAsRead,
  sendMessage,
  updateMessage,
} from "../controllers/message.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { arcjetProtection } from "../middleware/arcjet.middleware.js";

const router = express.Router();

router.use(arcjetProtection, protectRoute);

router.get("/contacts", getAllContacts);
router.get("/chats", getChatPartners);
router.delete("/conversation/:id", deleteConversation);
router.get("/:id", getMessagesByUserId);
router.patch("/:id", updateMessage);
router.delete("/:id", deleteMessage);
router.post("/read/:id", markMessagesAsRead);
router.post("/send/:id", sendMessage);

export default router;
