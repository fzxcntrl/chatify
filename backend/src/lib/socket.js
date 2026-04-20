import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";
import Message from "../models/Message.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ENV.CLIENT_URL,
    credentials: true,
  },
});

io.use(socketAuthMiddleware);

const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

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
    const senderSocketId = getReceiverSocketId(senderId);
    if (!senderSocketId) return;

    io.to(senderSocketId).emit("message-status-updated", {
      messageIds,
      deliveredAt: deliveredAt.toISOString(),
      readAt: null,
    });
  });
};

io.on("connection", (socket) => {
  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

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
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
