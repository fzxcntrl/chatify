import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, "");
export const API_ORIGIN = rawApiUrl || window.location.origin;
const API_BASE_URL = `${API_ORIGIN}/api`;
const AUTH_TOKEN_KEY = "chatify-auth-token";

let unauthorizedHandler = null;

export const getStoredAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const storeAuthToken = (token) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    return;
  }

  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

export const setUnauthorizedHandler = (handler) => {
  unauthorizedHandler = handler;
};

export const isUnauthorizedError = (error) =>
  error?.isAuthError === true || error?.response?.status === 401;

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:3000/api" : API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use((config) => {
  const token = getStoredAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error?.response?.status === 401) {
      error.isAuthError = true;
      await unauthorizedHandler?.(error);
    }

    return Promise.reject(error);
  }
);
