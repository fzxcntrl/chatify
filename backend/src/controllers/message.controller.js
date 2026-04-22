import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const emitMessageStatusUpdate = ({ receiverId, messageIds, deliveredAt, readAt }) => {
  if (!messageIds.length) return;

  const receiverSocketId = getReceiverSocketId(receiverId);
  if (!receiverSocketId) return;

  io.to(receiverSocketId).emit("message-status-updated", {
    messageIds,
    deliveredAt: deliveredAt ? deliveredAt.toISOString() : null,
    readAt: readAt ? readAt.toISOString() : null,
  });
};

export const getAllContacts = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // Only return established friends!
    const user = await User.findById(loggedInUserId).populate({
      path: "friends",
      select: "-password",
    });
    res.status(200).json(user.friends);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getMessagesByUserId = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: userToChatId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Text or image is required." });
    }
    if (senderId.equals(receiverId)) {
      return res.status(400).json({ message: "Cannot send messages to yourself." });
    }
    const receiverExists = await User.exists({ _id: receiverId });
    if (!receiverExists) {
      return res.status(404).json({ message: "Receiver not found." });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image, {
        folder: "chatify_messages",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      const deliveredAt = new Date();
      newMessage.deliveredAt = deliveredAt;
      await newMessage.save();

      io.to(receiverSocketId).emit("newMessage", newMessage);
      emitMessageStatusUpdate({
        receiverId: senderId.toString(),
        messageIds: [newMessage._id.toString()],
        deliveredAt,
        readAt: null,
      });
    }

    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find({
      $or: [{ senderId: loggedInUserId }, { receiverId: loggedInUserId }],
    }).select("senderId receiverId");

    const chatPartnerIds = [
      ...new Set(
        messages.map((msg) =>
          msg.senderId.toString() === loggedInUserId.toString()
            ? msg.receiverId.toString()
            : msg.senderId.toString()
        )
      ),
    ];

    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    res.status(200).json(chatPartners);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: senderId } = req.params;

    const unreadMessages = await Message.find({
      senderId,
      receiverId: myId,
      readAt: null,
    }).select("_id");

    if (!unreadMessages.length) {
      return res.status(200).json({ messageIds: [] });
    }

    const messageIds = unreadMessages.map((message) => message._id.toString());
    const deliveredAt = new Date();
    const readAt = new Date();

    await Message.updateMany(
      { _id: { $in: unreadMessages.map((message) => message._id) } },
      {
        $set: {
          deliveredAt,
          readAt,
        },
      }
    );

    emitMessageStatusUpdate({
      receiverId: senderId,
      messageIds,
      deliveredAt,
      readAt,
    });

    res.status(200).json({
      messageIds,
      deliveredAt: deliveredAt.toISOString(),
      readAt: readAt.toISOString(),
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;
    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({ message: "Message text is required." });
    }

    const message = await Message.findOne({
      _id: messageId,
      senderId: myId,
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    message.text = text;
    message.editedAt = new Date();
    await message.save();

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message-updated", message);
    }

    res.status(200).json(message);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;

    const message = await Message.findOneAndDelete({
      _id: messageId,
      senderId: myId,
    });

    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    const receiverSocketId = getReceiverSocketId(message.receiverId.toString());
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("message-deleted", { messageId: message._id.toString() });
    }

    res.status(200).json({ message: "Message deleted successfully", messageId: message._id.toString() });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: otherUserId } = req.params;

    if (myId.equals(otherUserId)) {
      return res.status(400).json({ message: "Cannot delete a conversation with yourself." });
    }

    const otherUserExists = await User.exists({ _id: otherUserId });
    if (!otherUserExists) {
      return res.status(404).json({ message: "User not found." });
    }

    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
    });

    const receiverSocketId = getReceiverSocketId(otherUserId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("conversation-deleted", {
        participantId: myId.toString(),
      });
    }

    res.status(200).json({
      message: "Conversation deleted successfully",
      participantId: otherUserId,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
