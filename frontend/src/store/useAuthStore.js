import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : import.meta.env.VITE_API_URL;

// 10 Chat Color Themes — each defines sent/received bubble + text colors
export const CHAT_THEMES = {
  default: {
    name: "Terracotta",
    sentBg: "#E07A5F",
    sentText: "#FFFFFF",
    receivedBg: "#1E2433",
    receivedText: "#E8E6E3",
    preview: ["#E07A5F", "#1E2433"],
  },
  ocean: {
    name: "Ocean",
    sentBg: "#0891B2",
    sentText: "#FFFFFF",
    receivedBg: "#164E63",
    receivedText: "#E0F2FE",
    preview: ["#0891B2", "#164E63"],
  },
  emerald: {
    name: "Emerald",
    sentBg: "#059669",
    sentText: "#FFFFFF",
    receivedBg: "#1B3A2D",
    receivedText: "#D1FAE5",
    preview: ["#059669", "#1B3A2D"],
  },
  lavender: {
    name: "Lavender",
    sentBg: "#7C3AED",
    sentText: "#FFFFFF",
    receivedBg: "#2E1065",
    receivedText: "#EDE9FE",
    preview: ["#7C3AED", "#2E1065"],
  },
  rose: {
    name: "Rose",
    sentBg: "#E11D48",
    sentText: "#FFFFFF",
    receivedBg: "#3B1124",
    receivedText: "#FFE4E6",
    preview: ["#E11D48", "#3B1124"],
  },
  sunset: {
    name: "Sunset",
    sentBg: "#EA580C",
    sentText: "#FFFFFF",
    receivedBg: "#431407",
    receivedText: "#FED7AA",
    preview: ["#EA580C", "#431407"],
  },
  midnight: {
    name: "Midnight",
    sentBg: "#2563EB",
    sentText: "#FFFFFF",
    receivedBg: "#1E293B",
    receivedText: "#DBEAFE",
    preview: ["#2563EB", "#1E293B"],
  },
  golden: {
    name: "Golden",
    sentBg: "#B45309",
    sentText: "#FFFFFF",
    receivedBg: "#292117",
    receivedText: "#FEF3C7",
    preview: ["#B45309", "#292117"],
  },
  crimson: {
    name: "Crimson",
    sentBg: "#9F1239",
    sentText: "#FFFFFF",
    receivedBg: "#1C1017",
    receivedText: "#FECDD3",
    preview: ["#9F1239", "#1C1017"],
  },
  slate: {
    name: "Slate",
    sentBg: "#475569",
    sentText: "#FFFFFF",
    receivedBg: "#1E293B",
    receivedText: "#E2E8F0",
    preview: ["#475569", "#1E293B"],
  },
};

export const applyTheme = (theme, chatTheme) => {
  document.documentElement.setAttribute('data-theme', theme || 'dark');

  // Apply chat color theme
  const ct = CHAT_THEMES[chatTheme] || CHAT_THEMES.default;
  document.documentElement.style.setProperty('--bubble-sent', ct.sentBg);
  document.documentElement.style.setProperty('--bubble-sent-text', ct.sentText);
  document.documentElement.style.setProperty('--bubble-received', ct.receivedBg);
  document.documentElement.style.setProperty('--bubble-received-text', ct.receivedText);

  // Always use animated gradient background
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
      applyTheme(res.data.theme, res.data.chatTheme);
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
      applyTheme('dark', 'default');
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      applyTheme(res.data.theme, res.data.chatTheme);
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
      applyTheme(res.data.theme, res.data.chatTheme);
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
      applyTheme('dark', 'default');
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
      applyTheme(res.data.theme, res.data.chatTheme);
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
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) {
       get().socket.disconnect();
       import('./useChatStore').then((module) => {
         module.useChatStore.getState().unsubscribeFromLocationRequests();
       });
    }
  },
}));
