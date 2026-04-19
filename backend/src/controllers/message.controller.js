import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

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
    let fileType = "image";
    if (image) {
      const isPdf = image.startsWith("data:application/pdf");
      fileType = isPdf ? "pdf" : "image";

      const uploadOptions = {
        folder: "chatify_messages",
      };

      if (isPdf) {
        // Upload as raw with explicit .pdf extension
        uploadOptions.resource_type = "raw";
        uploadOptions.format = "pdf";
      } else {
        uploadOptions.resource_type = "image";
        uploadOptions.transformation = [{ quality: "auto", fetch_format: "auto" }];
      }

      const uploadResponse = await cloudinary.uploader.upload(image, uploadOptions);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
      fileType: fileType === "pdf" ? "pdf" : undefined,
    });

    await newMessage.save();

    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
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

// Proxy file download/preview — avoids CORS issues with Cloudinary raw URLs
export const proxyFile = async (req, res) => {
  try {
    const { url } = req.query;
    const download = req.query.download === "true";

    if (!url || !url.includes("cloudinary.com")) {
      return res.status(400).json({ message: "Invalid file URL" });
    }

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ message: "Failed to fetch file" });
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader("Content-Type", contentType);
    res.setHeader("Content-Length", buffer.length);

    if (download) {
      const filename = req.query.filename || "download";
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    } else {
      // For PDF inline preview
      if (contentType.includes("pdf") || url.toLowerCase().includes(".pdf")) {
        res.setHeader("Content-Type", "application/pdf");
      }
      res.setHeader("Content-Disposition", "inline");
    }

    res.send(buffer);
  } catch (error) {
    console.error("Error in proxyFile:", error);
    res.status(500).json({ message: "Failed to proxy file" });
  }
};
