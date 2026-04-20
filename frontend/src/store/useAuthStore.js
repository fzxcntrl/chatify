import { create } from "zustand";
import {
  API_ORIGIN,
  axiosInstance,
  clearAuthToken,
  isUnauthorizedError,
  setUnauthorizedHandler,
  storeAuthToken,
} from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
export { LOCATION_MARKERS, DEFAULT_LOCATION_MARKER } from "../lib/locationMarkers";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:3000" : API_ORIGIN;

// 10 Chat Background Colors — dark + light variants per entry
export const CHAT_BACKGROUNDS = {
  default:  { name: "Charcoal",  dark: "#1A1F2E", light: "#E8EAED" },
  slate:    { name: "Slate",     dark: "#1E293B", light: "#E2E8F0" },
  navy:     { name: "Navy",      dark: "#0F172A", light: "#DBEAFE" },
  forest:   { name: "Forest",    dark: "#14261E", light: "#DCFCE7" },
  wine:     { name: "Wine",      dark: "#261419", light: "#FCE4EC" },
  plum:     { name: "Plum",      dark: "#1E1030", light: "#EDE9FE" },
  ocean:    { name: "Ocean",     dark: "#0C2637", light: "#E0F2FE" },
  coffee:   { name: "Coffee",    dark: "#1F1610", light: "#EFEBE9" },
  graphite: { name: "Graphite",  dark: "#212121", light: "#E0E0E0" },
  midnight: { name: "Midnight",  dark: "#0A0E1A", light: "#F0F4FF" },
};

// 10 Chat Bubble Themes — dark + light variants for received bubbles
export const CHAT_THEMES = {
  default: {
    name: "Terracotta",
    sentBg: "#E07A5F", sentText: "#FFFFFF",
    dark:  { receivedBg: "#2A2F3E", receivedText: "#E8E6E3" },
    light: { receivedBg: "#FFFFFF", receivedText: "#1E1E1E" },
  },
  ocean: {
    name: "Ocean",
    sentBg: "#0891B2", sentText: "#FFFFFF",
    dark:  { receivedBg: "#1C3644", receivedText: "#E0F2FE" },
    light: { receivedBg: "#FFFFFF", receivedText: "#164E63" },
  },
  emerald: {
    name: "Emerald",
    sentBg: "#059669", sentText: "#FFFFFF",
    dark:  { receivedBg: "#1B3A2D", receivedText: "#D1FAE5" },
    light: { receivedBg: "#FFFFFF", receivedText: "#14532D" },
  },
  lavender: {
    name: "Lavender",
    sentBg: "#7C3AED", sentText: "#FFFFFF",
    dark:  { receivedBg: "#2E1F50", receivedText: "#EDE9FE" },
    light: { receivedBg: "#FFFFFF", receivedText: "#3B0764" },
  },
  rose: {
    name: "Rose",
    sentBg: "#E11D48", sentText: "#FFFFFF",
    dark:  { receivedBg: "#3B1A2A", receivedText: "#FFE4E6" },
    light: { receivedBg: "#FFFFFF", receivedText: "#881337" },
  },
  sunset: {
    name: "Sunset",
    sentBg: "#EA580C", sentText: "#FFFFFF",
    dark:  { receivedBg: "#3A2414", receivedText: "#FED7AA" },
    light: { receivedBg: "#FFFFFF", receivedText: "#7C2D12" },
  },
  midnight: {
    name: "Midnight",
    sentBg: "#2563EB", sentText: "#FFFFFF",
    dark:  { receivedBg: "#1E2B45", receivedText: "#DBEAFE" },
    light: { receivedBg: "#FFFFFF", receivedText: "#1E3A5F" },
  },
  golden: {
    name: "Golden",
    sentBg: "#B45309", sentText: "#FFFFFF",
    dark:  { receivedBg: "#2E2117", receivedText: "#FEF3C7" },
    light: { receivedBg: "#FFFFFF", receivedText: "#78350F" },
  },
  crimson: {
    name: "Crimson",
    sentBg: "#9F1239", sentText: "#FFFFFF",
    dark:  { receivedBg: "#2E1520", receivedText: "#FECDD3" },
    light: { receivedBg: "#FFFFFF", receivedText: "#881337" },
  },
  steel: {
    name: "Steel",
    sentBg: "#475569", sentText: "#FFFFFF",
    dark:  { receivedBg: "#283040", receivedText: "#E2E8F0" },
    light: { receivedBg: "#FFFFFF", receivedText: "#1E293B" },
  },
};

export const applyTheme = (theme, chatTheme, chatBg) => {
  const mode = theme || 'dark';
  const isDark = mode === 'dark';
  document.documentElement.setAttribute('data-theme', mode);

  // Apply chat bubble colors — pick the correct variant for current mode
  const ct = CHAT_THEMES[chatTheme] || CHAT_THEMES.default;
  const variant = isDark ? ct.dark : ct.light;
  document.documentElement.style.setProperty('--bubble-sent', ct.sentBg);
  document.documentElement.style.setProperty('--bubble-sent-text', ct.sentText);
  document.documentElement.style.setProperty('--bubble-received', variant.receivedBg);
  document.documentElement.style.setProperty('--bubble-received-text', variant.receivedText);

  // Apply chat background color — pick dark/light variant
  const bg = CHAT_BACKGROUNDS[chatBg] || CHAT_BACKGROUNDS.default;
  const bgColor = isDark ? bg.dark : bg.light;
  document.documentElement.style.setProperty('--chat-bg', bgColor);

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

  clearAuthState: async () => {
    get().disconnectSocket();
    clearAuthToken();
    set({
      authUser: null,
      isCheckingAuth: false,
      onlineUsers: [],
    });
    applyTheme('dark', 'default', 'default');

    const [{ useChatStore }, { useFriendStore }] = await Promise.all([
      import("./useChatStore"),
      import("./useFriendStore"),
    ]);

    useChatStore.getState().resetChatState();
    useFriendStore.getState().clearFriendState();
  },

  handleUnauthorized: async () => {
    const hadSession = Boolean(get().authUser || get().socket || get().onlineUsers.length);
    await get().clearAuthState();

    if (hadSession) {
      toast.error("Your session expired. Please log in again.");
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      const { token, ...user } = res.data;
      if (token) storeAuthToken(token);
      set({ authUser: user, isCheckingAuth: false });
      applyTheme(user.theme, user.chatTheme, user.chatBg);
      get().connectSocket();
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        await get().clearAuthState();
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      const { token, ...user } = res.data;
      storeAuthToken(token);
      set({ authUser: user });
      applyTheme(user.theme, user.chatTheme, user.chatBg);
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
      const { token, ...user } = res.data;
      storeAuthToken(token);
      set({ authUser: user });
      applyTheme(user.theme, user.chatTheme, user.chatBg);
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
      await get().clearAuthState();
      toast.success("Logged out successfully");
    } catch (error) {
      if (isUnauthorizedError(error)) {
        await get().clearAuthState();
        toast.success("Logged out successfully");
        return;
      }

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
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Connection failed");
      }
    }
  },

  changePassword: async (data, setUpdating) => {
    setUpdating(true);
    try {
      await axiosInstance.put("/auth/update-password", data);
      toast.success("Password changed successfully");
      return true;
    } catch (error) {
      if (!isUnauthorizedError(error)) {
        toast.error(error.response?.data?.message || "Failed to change password");
      }
      return false;
    } finally {
      setUpdating(false);
    }
  },

  connectSocket: () => {
    const { authUser } = get();
    if (!authUser || get().socket?.connected) return;

    const token = localStorage.getItem("chatify-auth-token");
    const socket = io(BASE_URL, {
      withCredentials: true,
      auth: token ? { token } : undefined,
    });
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
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null, onlineUsers: [] });
      import('./useChatStore').then((module) => {
        module.useChatStore.getState().unsubscribeFromMessages();
        module.useChatStore.getState().unsubscribeFromLocationRequests();
        module.useChatStore.getState().unsubscribeFromFriendRequests();
      });
    }
  },
}));

setUnauthorizedHandler(async () => {
  await useAuthStore.getState().handleUnauthorized();
});
