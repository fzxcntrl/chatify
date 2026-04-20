import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  searchUsers,
  getSuggestions,
  sendRequest,
  getIncomingRequests,
  acceptRequest,
  declineRequest,
  removeContact,
  getUserProfile,
  getUserContacts,
} from "../controllers/friend.controller.js";

const router = express.Router();

// Required auth for all routes
router.use(protectRoute);

router.get("/search", searchUsers);
router.get("/suggestions", getSuggestions);
router.get("/requests", getIncomingRequests);
router.get("/profile/:id", getUserProfile);
router.get("/profile/:id/contacts", getUserContacts);
router.post("/request/:id", sendRequest);
router.post("/accept/:id", acceptRequest);
router.post("/decline/:id", declineRequest);
router.delete("/contact/:id", removeContact);

export default router;
