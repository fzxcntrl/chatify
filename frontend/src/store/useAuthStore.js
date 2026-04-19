import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : import.meta.env.VITE_API_URL;

export const applyTheme = (theme, wallpaper) => {
  document.documentElement.setAttribute('data-theme', theme || 'dark');
  if (wallpaper && wallpaper !== 'none') {
    document.body.className = '';
    document.body.style.background = wallpaper.startsWith('http') || wallpaper.startsWith('data:') ? `url(${wallpaper})` : wallpaper;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    document.body.style.background = '';
    document.body.className = 'animated-gradient-bg';
  }
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
      applyTheme(res.data.theme, res.data.wallpaper);
      get().connectSocket();
    } catch (error) {
      set({ authUser: null });
      applyTheme('dark', 'none');
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      applyTheme(res.data.theme, res.data.wallpaper);
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
      applyTheme(res.data.theme, res.data.wallpaper);
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
      applyTheme('dark', 'none');
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
      applyTheme(res.data.theme, res.data.wallpaper);
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
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
