import axios from "axios";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

// Base API configuration
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management utilities
export const tokenUtils = {
  getToken: () => Cookies.get("token"),
  setToken: (token) =>
    Cookies.set("token", token, {
      expires: 7,
      secure: true,
      sameSite: "strict",
    }),
  removeToken: () => Cookies.remove("token"),
  isTokenValid: (token) => {
    if (!token) return false;
    try {
      const decoded = jwtDecode(token);
      return decoded.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },
  getUserFromToken: (token) => {
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = tokenUtils.getToken();
    if (token && tokenUtils.isTokenValid(token)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenUtils.removeToken();
      window.location.href = "/ApplicationUISignIn";
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: (url, params = {}) => api.get(url, { params }),
  post: (url, data = {}) => api.post(url, data),
  put: (url, data = {}) => api.put(url, data),
  patch: (url, data = {}) => api.patch(url, data),
  delete: (url) => api.delete(url),

  // File upload method
  uploadFile: (url, formData) =>
    api.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export default api;
