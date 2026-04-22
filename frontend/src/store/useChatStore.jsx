import { create } from "zustand";
import { axiosInstance, isUnauthorizedError } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

const applyMessageStatusUpdate = (messages, messageIds, deliveredAt, readAt) =>
  messages.map((message) =>
    messageIds.includes(message._id)
      ? {
          ...message,
          deliveredAt: readAt ? deliveredAt || message.deliveredAt : deliveredAt ?? message.deliveredAt,
          readAt: readAt ?? message.readAt,
        }
      : message
  );

const upsertChatPartner = (chats, user) => {
  if (!user?._id) return chats;

  const existingIndex = chats.findIndex((chat) => chat._id === user._id);
  if (existingIndex === -1) {
    return [user, ...chats];
  }

  const nextChats = [...chats];
  nextChats[existingIndex] = {
    ...nextChats[existingIndex],
    ...user,
  };
  return nextChats;
};

const replaceMessage = (messages, updatedMessage) =>
  messages.map((message) => (message._id === updatedMessage._id ? updatedMessage : message));

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  showMapTracker: false,
  showSettingsModal: false,
  showEditProfileModal: false,
  imagePreview: null,
  requestCount: 0,
  unreadChatCount: 0,

  setShowMapTracker: (show) => set({ showMapTracker: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),
  setShowEditProfileModal: (show) => set({ showEditProfileModal: show }),
  setImagePreview: (src) => set({ imagePreview: src }),
  resetChatState: () =>
    set({
      allContacts: [],
      chats: [],
      messages: [],
      activeTab: "chats",
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      showMapTracker: false,
      showSettingsModal: false,
      showEditProfileModal: false,
      imagePreview: null,
      requestCount: 0,
      unreadChatCount: 0,
    }),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    window.dispatchEvent(new Event("chatify:sound-preference-changed"));
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => {
    if (tab === "requests") set({ requestCount: 0 });
    set({ activeTab: tab });
  },
  setSelectedUser: (selectedUser) => set({ selectedUser, showMapTracker: false }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Connection failed");
      }
      set({ allContacts: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMyChatPartners: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/chats");
      set({ chats: res.data });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Connection failed");
      }
      set({ chats: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  removeContact: async (contact) => {
    try {
      await axiosInstance.delete(`/friends/contact/${contact._id}`);

      set({
        allContacts: get().allContacts.filter((item) => item._id !== contact._id),
      });

      toast.success(`${contact.fullName} removed from contacts`);
      return true;
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Failed to remove contact");
      }
      return false;
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  markMessagesAsRead: async (userId) => {
    try {
      const res = await axiosInstance.post(`/messages/read/${userId}`);
      const { messageIds = [], deliveredAt = null, readAt = null } = res.data;
      if (!messageIds.length) return;

      set({
        messages: applyMessageStatusUpdate(get().messages, messageIds, deliveredAt, readAt),
      });
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Failed to update message status");
      }
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    const { authUser } = useAuthStore.getState();

    const tempId = `temp-${Date.now()}`;

    const optimisticMessage = {
      _id: tempId,
      senderId: authUser._id,
      receiverId: selectedUser._id,
      text: messageData.text,
      image: messageData.image,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    set({ messages: [...messages, optimisticMessage] });

    try {
      const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
      set({
        messages: get().messages.map((message) => (message._id === tempId ? res.data : message)),
        chats: upsertChatPartner(get().chats, selectedUser),
      });
      return true;
    } catch (error) {
      set({ messages: messages });
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
      return false;
    }
  },

  updateMessage: async (messageId, text) => {
    try {
      const res = await axiosInstance.patch(`/messages/${messageId}`, { text: text.trim() });
      set({
        messages: replaceMessage(get().messages, res.data),
      });
      toast.success("Message updated");
      return true;
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Failed to update message");
      }
      return false;
    }
  },

  deleteMessage: async (messageId) => {
    try {
      await axiosInstance.delete(`/messages/${messageId}`);
      set({
        messages: get().messages.filter((message) => message._id !== messageId),
      });
      toast.success("Message deleted");
      get().getMyChatPartners();
      return true;
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Failed to delete message");
      }
      return false;
    }
  },

  deleteConversation: async (user) => {
    try {
      await axiosInstance.delete(`/messages/conversation/${user._id}`);

      set({
        chats: get().chats.filter((chat) => chat._id !== user._id),
        messages: get().selectedUser?._id === user._id ? [] : get().messages,
      });

      toast.success(`Deleted chat with ${user.fullName}`);
      return true;
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Failed to delete chat");
      }
      return false;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) {
        // Message from someone else — count as unread
        set({ unreadChatCount: get().unreadChatCount + 1 });
        if (get().isSoundEnabled) {
          const notificationSound = new Audio("/sounds/notification.mp3");
          notificationSound.currentTime = 0;
          notificationSound.play().catch(() => {});
        }
        return;
      }

      const currentMessages = get().messages;
      const sender =
        get().allContacts.find((contact) => contact._id === newMessage.senderId) ||
        get().chats.find((chat) => chat._id === newMessage.senderId);

      set({
        messages: [...currentMessages, newMessage],
        chats: sender ? upsertChatPartner(get().chats, sender) : get().chats,
      });
      get().markMessagesAsRead(selectedUser._id);

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {});
      }
    });

    socket.on("message-status-updated", ({ messageIds, deliveredAt, readAt }) => {
      set({
        messages: applyMessageStatusUpdate(get().messages, messageIds, deliveredAt, readAt),
      });
    });

    socket.on("message-updated", (updatedMessage) => {
      if (updatedMessage.senderId !== selectedUser._id) return;

      set({
        messages: replaceMessage(get().messages, updatedMessage),
      });
    });

    socket.on("message-deleted", ({ messageId }) => {
      set({
        messages: get().messages.filter((message) => message._id !== messageId),
      });
      get().getMyChatPartners();
    });

    socket.on("conversation-deleted", ({ participantId, triggeredByOffline }) => {
      const participant =
        get().chats.find((chat) => chat._id === participantId) ||
        get().allContacts.find((contact) => contact._id === participantId);

      set({
        chats: get().chats.filter((chat) => chat._id !== participantId),
        messages: get().selectedUser?._id === participantId ? [] : get().messages,
      });

      if (triggeredByOffline && participant) {
        toast(`${participant.fullName}'s chat disappeared after they went offline.`);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("message-status-updated");
    socket.off("message-updated");
    socket.off("message-deleted");
    socket.off("conversation-deleted");
  },

  subscribeToLocationRequests: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("location-request", ({ senderId }) => {
      // Find who this is from
      const { allContacts, chats } = get();
      const user = allContacts.find(c => c._id === senderId) || chats.find(c => c._id === senderId);
      const name = user ? user.fullName : "Someone";

      toast.custom(
        (t) => (
          <div
            className={`max-w-md w-full bg-[var(--bg-elevated)] shadow-lg rounded-xl pointer-events-auto flex flex-col p-4 border border-[var(--border)] ${
              t.visible ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <div className="flex items-start gap-4">
               <div className="pt-1">
                 <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                     <path d="M12 21C15.5 17 18 13.8 18 10.5A6 6 0 1 0 6 10.5C6 13.8 8.5 17 12 21Z" fill="currentColor" opacity="0.88" />
                     <circle cx="12" cy="10.5" r="2.5" fill="white" />
                   </svg>
                 </div>
               </div>
               <div className="flex-1">
                 <p className="text-sm font-medium text-[var(--text-primary)]">
                   {name} wants to see your location
                 </p>
                 <p className="text-xs text-[var(--text-secondary)] mt-1">
                   They will be able to track your real-time path.
                 </p>
               </div>
            </div>
            <div className="flex gap-2 mt-4 w-full">
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  socket.emit("location-response", { senderId, accepted: false });
                }}
                className="flex-1 py-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Decline
              </button>
              <button
                onClick={() => {
                  toast.dismiss(t.id);
                  socket.emit("location-response", { senderId, accepted: true });
                  // If we accept, open the tracker with this user
                  if (user && get().selectedUser?._id !== senderId) {
                     get().setSelectedUser(user);
                  }
                  get().setShowMapTracker(true);
                }}
                className="flex-1 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs hover:opacity-90 transition-opacity"
              >
                Allow
              </button>
            </div>
          </div>
        ),
        { duration: 15000, position: 'top-center' }
      );
    });

    socket.on("location-response-received", ({ receiverId, accepted }) => {
      const { allContacts, chats } = get();
      const user = allContacts.find(c => c._id === receiverId) || chats.find(c => c._id === receiverId);
      const name = user ? user.fullName : "User";

      if (accepted) {
        toast.success(`${name} shared their location!`);
        get().setShowMapTracker(true);
      } else {
        toast.error(`${name} declined to share location.`);
      }
    });
  },

  unsubscribeFromLocationRequests: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("location-request");
      socket.off("location-response-received");
    }
  },

  subscribeToFriendRequests: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.on("new-friend-request", (request) => {
      // Bump the request count
      set({ requestCount: get().requestCount + 1 });

      // Play notification sound
      if (get().isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {});
      }

      // Show toast
      const name = request.sender?.fullName || "Someone";
      toast.success(`${name} sent you a friend request!`);
    });
  },

  unsubscribeFromFriendRequests: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("new-friend-request");
    }
  },
}));
