import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : import.meta.env.VITE_API_URL;

// 10 Chat Background Colors — the area behind the bubbles
export const CHAT_BACKGROUNDS = {
  default: { name: "Charcoal", color: "#1A1F2E" },
  slate: { name: "Slate", color: "#1E293B" },
  navy: { name: "Navy", color: "#0F172A" },
  forest: { name: "Forest", color: "#14261E" },
  wine: { name: "Wine", color: "#261419" },
  plum: { name: "Plum", color: "#1E1030" },
  ocean: { name: "Ocean", color: "#0C2637" },
  coffee: { name: "Coffee", color: "#1F1610" },
  graphite: { name: "Graphite", color: "#212121" },
  midnight: { name: "Midnight", color: "#0A0E1A" },
};

// 10 Chat Bubble Color Themes (sent/received bubble + text colors)
export const CHAT_THEMES = {
  default: {
    name: "Terracotta",
    sentBg: "#E07A5F",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#E8E6E3",
  },
  ocean: {
    name: "Ocean",
    sentBg: "#0891B2",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#E0F2FE",
  },
  emerald: {
    name: "Emerald",
    sentBg: "#059669",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#D1FAE5",
  },
  lavender: {
    name: "Lavender",
    sentBg: "#7C3AED",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#EDE9FE",
  },
  rose: {
    name: "Rose",
    sentBg: "#E11D48",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#FFE4E6",
  },
  sunset: {
    name: "Sunset",
    sentBg: "#EA580C",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#FED7AA",
  },
  midnight: {
    name: "Midnight",
    sentBg: "#2563EB",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#DBEAFE",
  },
  golden: {
    name: "Golden",
    sentBg: "#B45309",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#FEF3C7",
  },
  crimson: {
    name: "Crimson",
    sentBg: "#9F1239",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#FECDD3",
  },
  steel: {
    name: "Steel",
    sentBg: "#475569",
    sentText: "#FFFFFF",
    receivedBg: "rgba(255,255,255,0.08)",
    receivedText: "#E2E8F0",
  },
};

export const applyTheme = (theme, chatTheme, chatBg) => {
  document.documentElement.setAttribute('data-theme', theme || 'dark');

  // Apply chat bubble colors
  const ct = CHAT_THEMES[chatTheme] || CHAT_THEMES.default;
  document.documentElement.style.setProperty('--bubble-sent', ct.sentBg);
  document.documentElement.style.setProperty('--bubble-sent-text', ct.sentText);
  document.documentElement.style.setProperty('--bubble-received', ct.receivedBg);
  document.documentElement.style.setProperty('--bubble-received-text', ct.receivedText);

  // Apply chat background color
  const bg = CHAT_BACKGROUNDS[chatBg] || CHAT_BACKGROUNDS.default;
  document.documentElement.style.setProperty('--chat-bg', bg.color);

  // Always use animated gradient background for the page
  document.body.style.background = '';
  document.body.className = 'animated-gradient-bg';
};

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isCheckingAuth: true,
  isSigningUp: false,
  isLoggingIn: false,
  socket: null,
  onlineUsers: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      applyTheme(res.data.theme, res.data.chatTheme, res.data.chatBg);
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
      applyTheme('dark', 'default', 'default');
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      applyTheme(res.data.theme, res.data.chatTheme, res.data.chatBg);
      toast.success("Account created successfully!");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Connection failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      applyTheme(res.data.theme, res.data.chatTheme, res.data.chatBg);
      toast.success("Logged in successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Connection failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      applyTheme('dark', 'default', 'default');
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error("Error logging out");
    }
  },

  updateProfile: async (data) => {
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      applyTheme(res.data.theme, res.data.chatTheme, res.data.chatBg);
      toast.success("Preferences updated successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Connection failed");
    }
  },

  changePassword: async (data, setUpdating) => {
    setUpdating(true);
    try {
      await axiosInstance.put("/auth/update-password", data);
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
      return false;
    } finally {
      setUpdating(false);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const socket = io(BASE_URL, { withCredentials: true });
    socket.connect();
    set({ socket });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    import('./useChatStore').then((module) => {
      module.useChatStore.getState().subscribeToLocationRequests();
      module.useChatStore.getState().subscribeToFriendRequests();
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
       get().socket.disconnect();
       import('./useChatStore').then((module) => {
         module.useChatStore.getState().unsubscribeFromLocationRequests();
         module.useChatStore.getState().unsubscribeFromFriendRequests();
       });
    }
  },
}));
