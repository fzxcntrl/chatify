import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

// Get suggested users (non-friends, non-self, random sample)
export const getSuggestions = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    const suggestions = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUser._id, $nin: currentUser.friends },
        },
      },
      { $sample: { size: 15 } },
      {
        $project: {
          username: 1,
          fullName: 1,
          profilePic: 1,
          bio: 1,
        },
      },
    ]);

    // Attach request status for each suggestion
    const suggestionsWithStatus = await Promise.all(
      suggestions.map(async (u) => {
        const existingReq = await FriendRequest.findOne({
          $or: [
            { sender: req.user._id, receiver: u._id },
            { sender: u._id, receiver: req.user._id },
          ],
        });

        return {
          ...u,
          requestStatus: existingReq ? existingReq.status : "none",
          isSender: existingReq ? existingReq.sender.equals(req.user._id) : false,
        };
      })
    );

    res.status(200).json(suggestionsWithStatus);
  } catch (error) {
    console.error("Error in getSuggestions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Search users by username (excluding self and existing friends)
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const currentUser = await User.findById(req.user._id);

    // Find users matching query (case-insensitive) except current user and existing friends
    const users = await User.find({
      username: { $regex: new RegExp(query, "i") },
      _id: { $ne: req.user._id, $nin: currentUser.friends },
    }).select("username fullName profilePic bio");

    // We also need to attach existing FriendRequest status for UI
    const usersWithStatus = await Promise.all(
      users.map(async (u) => {
        const existingReq = await FriendRequest.findOne({
          $or: [
            { sender: req.user._id, receiver: u._id },
            { sender: u._id, receiver: req.user._id },
          ],
        });

        return {
          ...u.toObject(),
          requestStatus: existingReq ? existingReq.status : "none",
          isSender: existingReq ? existingReq.sender.equals(req.user._id) : false,
        };
      })
    );

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("Error in searchUsers:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Send a friend request
export const sendRequest = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send request to yourself" });
    }

    const currentUser = await User.findById(senderId);
    if (currentUser.friends.includes(receiverId)) {
      return res.status(400).json({ message: "Already friends" });
    }

    const existingReq = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingReq) {
      if (existingReq.status === "pending") {
        return res.status(400).json({ message: "Friend request already pending" });
      }
      if (existingReq.status === "accepted") {
        return res.status(400).json({ message: "Already friends" });
      }
      // If declined previously, we could optionally allow re-sending by updating the existing doc
      existingReq.status = "pending";
      existingReq.sender = senderId;
      existingReq.receiver = receiverId;
      await existingReq.save();
      return res.status(200).json(existingReq);
    }

    const newRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error in sendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get pending incoming requests
export const getIncomingRequests = async (req, res) => {
  try {
    const requests = await FriendRequest.find({
      receiver: req.user._id,
      status: "pending",
    }).populate("sender", "username fullName profilePic bio");

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error in getIncomingRequests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Accept friend request
export const acceptRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found or invalid" });
    }

    friendRequest.status = "accepted";
    await friendRequest.save();

    // Add friends to both arrays
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: friendRequest.sender } });
    await User.findByIdAndUpdate(friendRequest.sender, { $addToSet: { friends: req.user._id } });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Decline friend request
export const declineRequest = async (req, res) => {
  try {
    const { id: requestId } = req.params;

    const friendRequest = await FriendRequest.findOne({
      _id: requestId,
      receiver: req.user._id,
      status: "pending",
    });

    if (!friendRequest) {
      return res.status(404).json({ message: "Friend request not found or invalid" });
    }

    friendRequest.status = "declined";
    await friendRequest.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error in declineRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a user's public profile (contact count)
export const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select("username fullName profilePic bio friends");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({
      _id: user._id,
      username: user.username,
      fullName: user.fullName,
      profilePic: user.profilePic,
      bio: user.bio,
      contactCount: user.friends.length,
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get a user's contacts list (public info)
export const getUserContacts = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id).populate({
      path: "friends",
      select: "username fullName profilePic",
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error in getUserContacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
