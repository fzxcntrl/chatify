import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  searchUsers,
  sendRequest,
  getIncomingRequests,
  acceptRequest,
  declineRequest,
} from "../controllers/friend.controller.js";

const router = express.Router();

// Required auth for all routes
router.use(protectRoute);

router.get("/search", searchUsers);
router.get("/requests", getIncomingRequests);
router.post("/request/:id", sendRequest);
router.post("/accept/:id", acceptRequest);
router.post("/decline/:id", declineRequest);

export default router;
