import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ENV.ALLOWED_ORIGINS,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  const socketIds = userSocketMap[userId];
  if (!socketIds || socketIds.size === 0) return null;
  return userId;
}

const getReceiverSocketIds = (userId) => {
  const socketIds = userSocketMap[userId];
  return socketIds ? [...socketIds] : [];
};

const emitToUser = (userId, event, payload) => {
  if (!getReceiverSocketIds(userId).length) return;
  io.to(userId).emit(event, payload);
};

const markPendingMessagesAsDelivered = async (userId) => {
  const pendingMessages = await Message.find({
    receiverId: userId,
    deliveredAt: null,
  }).select("_id senderId");

  if (!pendingMessages.length) return;

  const deliveredAt = new Date();

  await Message.updateMany(
    { _id: { $in: pendingMessages.map((message) => message._id) } },
    { $set: { deliveredAt } }
  );

  const senderGroups = pendingMessages.reduce((groups, message) => {
    const senderId = message.senderId.toString();
    if (!groups[senderId]) {
      groups[senderId] = [];
    }
    groups[senderId].push(message._id.toString());
    return groups;
  }, {});

  Object.entries(senderGroups).forEach(([senderId, messageIds]) => {
    emitToUser(senderId, "message-status-updated", {
      messageIds,
      deliveredAt: deliveredAt.toISOString(),
      readAt: null,
    });
  });
};

const removeChatsWhenUserGoesOffline = async (userId) => {
  const user = await User.findById(userId).select("disappearingChatsEnabled");
  if (!user?.disappearingChatsEnabled) return;

  const messages = await Message.find({
    $or: [{ senderId: userId }, { receiverId: userId }],
  }).select("senderId receiverId");

  if (!messages.length) return;

  const participantIds = new Set();
  messages.forEach((message) => {
    const senderId = message.senderId.toString();
    const receiverId = message.receiverId.toString();
    const otherUserId = senderId === userId ? receiverId : senderId;
    participantIds.add(otherUserId);
  });

  await Message.deleteMany({
    $or: [{ senderId: userId }, { receiverId: userId }],
  });

  participantIds.forEach((participantId) => {
    emitToUser(participantId, "conversation-deleted", {
      participantId: userId,
      triggeredByOffline: true,
    });
  });
};

io.on("connection", (socket) => {
  const userId = socket.userId;
  socket.join(userId);
  if (!userSocketMap[userId]) {
    userSocketMap[userId] = new Set();
  }
  userSocketMap[userId].add(socket.id);

  io.emit("getOnlineUsers", Object.keys(userSocketMap));
  markPendingMessagesAsDelivered(userId).catch((error) => {
    console.error("Failed to mark delivered messages:", error.message);
  });

  socket.on("send-location", ({ receiverId, latitude, longitude }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
       // Send strictly to the active receiver ID
       io.to(receiverSocketId).emit("receive-location", {
          id: userId,
          latitude,
          longitude
       });
    }
  });

  socket.on("ask-location", ({ receiverId }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("location-request", {
        senderId: userId,
      });
    }
  });

  socket.on("location-response", ({ senderId, accepted }) => {
    const senderSocketId = getReceiverSocketId(senderId);
    if (senderSocketId) {
      io.to(senderSocketId).emit("location-response-received", {
         receiverId: userId,
         accepted,
      });
    }
  });

  socket.on("disconnect", () => {
    const socketIds = userSocketMap[userId];
    if (!socketIds) return;

    socketIds.delete(socket.id);

    if (socketIds.size > 0) {
      return;
    }

    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    removeChatsWhenUserGoesOffline(userId).catch((error) => {
      console.error("Failed to remove disappearing chats:", error.message);
    });
  });
});

export { io, app, server };
