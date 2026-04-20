import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";
import { getReceiverSocketId, io } from "../lib/socket.js";


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
          requestId: existingReq ? existingReq._id : null,
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



export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: "Search query is required" });

    const currentUser = await User.findById(req.user._id);


    const users = await User.find({
      username: { $regex: new RegExp(query, "i") },
      _id: { $ne: req.user._id, $nin: currentUser.friends },
    }).select("username fullName profilePic bio");


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
          requestId: existingReq ? existingReq._id : null,
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

      existingReq.status = "pending";
      existingReq.sender = senderId;
      existingReq.receiver = receiverId;
      await existingReq.save();


      const populatedReq = await FriendRequest.findById(existingReq._id).populate("sender", "username fullName profilePic bio");
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new-friend-request", populatedReq);
      }

      return res.status(200).json(existingReq);
    }

    const newRequest = new FriendRequest({ sender: senderId, receiver: receiverId });
    await newRequest.save();


    const populatedReq = await FriendRequest.findById(newRequest._id).populate("sender", "username fullName profilePic bio");
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new-friend-request", populatedReq);
    }

    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error in sendRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


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


    await User.findByIdAndUpdate(req.user._id, { $addToSet: { friends: friendRequest.sender } });
    await User.findByIdAndUpdate(friendRequest.sender, { $addToSet: { friends: req.user._id } });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error in acceptRequest:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


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

export const removeContact = async (req, res) => {
  try {
    const { id: contactId } = req.params;
    const myId = req.user._id;

    if (myId.equals(contactId)) {
      return res.status(400).json({ message: "You cannot remove yourself" });
    }

    const currentUser = await User.findById(myId).select("friends");
    if (!currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFriend = currentUser.friends.some(
      (friendId) => friendId.toString() === contactId
    );

    if (!isFriend) {
      return res.status(404).json({ message: "Contact not found in your friends list" });
    }

    await Promise.all([
      User.findByIdAndUpdate(myId, { $pull: { friends: contactId } }),
      User.findByIdAndUpdate(contactId, { $pull: { friends: myId } }),
      FriendRequest.deleteMany({
        $or: [
          { sender: myId, receiver: contactId },
          { sender: contactId, receiver: myId },
        ],
      }),
    ]);

    res.status(200).json({ message: "Contact removed successfully", contactId });
  } catch (error) {
    console.error("Error in removeContact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


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
