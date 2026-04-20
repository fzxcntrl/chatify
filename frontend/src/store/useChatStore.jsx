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
        messages: get().messages.map((message) =>
          message._id === tempId ? res.data : message
        ),
      });
    } catch (error) {
      set({ messages: messages });
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
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
      set({ messages: [...currentMessages, newMessage] });
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
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");
    socket.off("message-status-updated");
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
               <div className="pt-1"><div className="w-8 h-8 rounded-full bg-[var(--primary)] flex justify-center items-center text-white text-xs">📍</div></div>
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
