import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const getVisibleMessagesQuery = (myId, otherUserId = null) => {
  const participantQuery = otherUserId
    ? {
        $or: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      }
    : {
        $or: [{ senderId: myId }, { receiverId: myId }],
      };

  return {
    ...participantQuery,
    hiddenFor: { $nin: [myId] },
  };
};

const toMessageSummary = (message) => ({
  _id: message._id.toString(),
  senderId: message.senderId.toString(),
  receiverId: message.receiverId.toString(),
  text: message.text || "",
  image: message.image || "",
  audio: message.audio || "",
  audioDuration: message.audioDuration || null,
  createdAt: message.createdAt,
});

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

    const messages = await Message.find(getVisibleMessagesQuery(myId, userToChatId)).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio, audioDuration } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!text && !image && !audio) {
      return res.status(400).json({ message: "Text, image, or audio is required." });
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

    let audioUrl;
    if (audio) {
      const uploadResponse = await cloudinary.uploader.upload(audio, {
        folder: "chatify_voice_notes",
        resource_type: "auto",
      });
      audioUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      audio: audioUrl,
      audioDuration: audioUrl ? audioDuration : null,
      fileType: audioUrl ? "audio" : imageUrl ? "image" : undefined,
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
    console.error("sendMessage error:", error?.message || error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChatPartners = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    const messages = await Message.find(getVisibleMessagesQuery(loggedInUserId))
      .sort({ createdAt: -1 })
      .select("senderId receiverId text image createdAt readAt");

    const chatMetaByPartnerId = new Map();
    const myId = loggedInUserId.toString();

    messages.forEach((message) => {
      const senderId = message.senderId.toString();
      const receiverId = message.receiverId.toString();
      const partnerId = senderId === myId ? receiverId : senderId;

      if (!chatMetaByPartnerId.has(partnerId)) {
        chatMetaByPartnerId.set(partnerId, {
          unreadCount: 0,
          lastMessage: toMessageSummary(message),
          lastMessageAt: message.createdAt,
        });
      }

      if (receiverId === myId && senderId === partnerId && !message.readAt) {
        chatMetaByPartnerId.get(partnerId).unreadCount += 1;
      }
    });

    const chatPartnerIds = [...chatMetaByPartnerId.keys()];
    const chatPartners = await User.find({ _id: { $in: chatPartnerIds } }).select("-password");

    const chats = chatPartners
      .map((partner) => {
        const meta = chatMetaByPartnerId.get(partner._id.toString());

        return {
          ...partner.toObject(),
          unreadCount: meta?.unreadCount || 0,
          lastMessage: meta?.lastMessage || null,
          lastMessageAt: meta?.lastMessageAt || null,
        };
      })
      .sort((left, right) => {
        const leftTime = left.lastMessageAt ? new Date(left.lastMessageAt).getTime() : 0;
        const rightTime = right.lastMessageAt ? new Date(right.lastMessageAt).getTime() : 0;
        return rightTime - leftTime;
      });

    res.status(200).json(chats);
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

export const toggleReaction = async (req, res) => {
  try {
    const myId = req.user._id;
    const { id: messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string") {
      return res.status(400).json({ message: "Emoji is required." });
    }

    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    // Check if the user is a participant
    const myIdStr = myId.toString();
    const senderIdStr = message.senderId.toString();
    const receiverIdStr = message.receiverId.toString();
    if (myIdStr !== senderIdStr && myIdStr !== receiverIdStr) {
      return res.status(403).json({ message: "Not authorized to react to this message." });
    }

    const existingIndex = message.reactions.findIndex(
      (r) => r.userId.toString() === myIdStr
    );

    if (existingIndex !== -1) {
      if (message.reactions[existingIndex].emoji === emoji) {
        // Same emoji — toggle off (remove)
        message.reactions.splice(existingIndex, 1);
      } else {
        // Different emoji — replace
        message.reactions[existingIndex].emoji = emoji;
      }
    } else {
      // New reaction
      message.reactions.push({ userId: myId, emoji });
    }

    await message.save();

    const reactionPayload = {
      messageId: message._id.toString(),
      reactions: message.reactions,
    };

    // Emit to both sender and receiver
    const otherUserId = myIdStr === senderIdStr ? receiverIdStr : senderIdStr;
    const otherSocketId = getReceiverSocketId(otherUserId);
    if (otherSocketId) {
      io.to(otherSocketId).emit("reaction-updated", reactionPayload);
    }
    // Also emit to the user who reacted (for multi-tab sync)
    const mySocketId = getReceiverSocketId(myIdStr);
    if (mySocketId) {
      io.to(mySocketId).emit("reaction-updated", reactionPayload);
    }

    res.status(200).json(reactionPayload);
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

    await Message.updateMany(getVisibleMessagesQuery(myId, otherUserId), {
      $addToSet: { hiddenFor: myId },
    });

    res.status(200).json({
      message: "Conversation removed from your profile",
      participantId: otherUserId,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
