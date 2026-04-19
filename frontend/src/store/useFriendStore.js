import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
  searchResults: [],
  incomingRequests: [],
  isSearching: false,
  isFetchingRequests: false,

  searchUsers: async (query) => {
    if (!query) {
      set({ searchResults: [] });
      return;
    }
    set({ isSearching: true });
    try {
      const res = await axiosInstance.get(`/friends/search?query=${query}`);
      set({ searchResults: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to search users");
      set({ searchResults: [] });
    } finally {
      set({ isSearching: false });
    }
  },

  getIncomingRequests: async () => {
    set({ isFetchingRequests: true });
    try {
      const res = await axiosInstance.get("/friends/requests");
      set({ incomingRequests: res.data });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch requests");
    } finally {
      set({ isFetchingRequests: false });
    }
  },

  sendFriendRequest: async (receiverId) => {
    try {
      await axiosInstance.post(`/friends/request/${receiverId}`);
      toast.success("Friend request sent");
      
      // Update local search results state
      const { searchResults } = get();
      set({
        searchResults: searchResults.map((user) =>
          user._id === receiverId ? { ...user, requestStatus: "pending", isSender: true } : user
        ),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send request");
    }
  },

  acceptRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/friends/accept/${requestId}`);
      toast.success("Friend request accepted");
      
      // Remove from incoming requests array
      const { incomingRequests } = get();
      set({
        incomingRequests: incomingRequests.filter((req) => req._id !== requestId),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to accept");
    }
  },

  declineRequest: async (requestId) => {
    try {
      await axiosInstance.post(`/friends/decline/${requestId}`);
      toast.success("Friend request declined");
      
      // Remove from incoming requests array
      const { incomingRequests } = get();
      set({
        incomingRequests: incomingRequests.filter((req) => req._id !== requestId),
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to decline");
    }
  },

  clearFriendState: () => {
    set({ searchResults: [], incomingRequests: [] });
  }
}));
