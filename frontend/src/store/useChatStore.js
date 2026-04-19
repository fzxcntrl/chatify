import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  allContacts: [],
  chats: [],
  messages: [],
  activeTab: "chats",
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isMessagesLoading: false,
  isSoundEnabled: JSON.parse(localStorage.getItem("isSoundEnabled")) === true,
  showMapTracker: false,
  showSettingsModal: false,

  setShowMapTracker: (show) => set({ showMapTracker: show }),
  setShowSettingsModal: (show) => set({ showSettingsModal: show }),

  toggleSound: () => {
    localStorage.setItem("isSoundEnabled", !get().isSoundEnabled);
    set({ isSoundEnabled: !get().isSoundEnabled });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setSelectedUser: (selectedUser) => set({ selectedUser, showMapTracker: false }),

  getAllContacts: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/contacts");
      set({ allContacts: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Connection failed");
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
      toast.error(error.response?.data?.message || "Connection failed");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessagesByUserId: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      set({ isMessagesLoading: false });
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
      set({ messages: messages.concat(res.data) });
    } catch (error) {
      set({ messages: messages });
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  },

  subscribeToMessages: () => {
    const { selectedUser, isSoundEnabled } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      const currentMessages = get().messages;
      set({ messages: [...currentMessages, newMessage] });

      if (isSoundEnabled) {
        const notificationSound = new Audio("/sounds/notification.mp3");
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {});
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
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
}));
