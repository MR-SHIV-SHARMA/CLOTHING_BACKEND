import { apiClient, tokenUtils } from "./api.js";

export const authService = {
  // User Authentication
  login: async (credentials) => {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data.token) {
      tokenUtils.setToken(response.data.token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await apiClient.post("/auth/register", userData);
    if (response.data.token) {
      tokenUtils.setToken(response.data.token);
    }
    return response.data;
  },

  logout: async () => {
    try {
      await apiClient.post("/auth/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenUtils.removeToken();
    }
  },

  forgotPassword: async (email) => {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token, password) => {
    const response = await apiClient.post("/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await apiClient.post("/auth/verify-email", { token });
    return response.data;
  },

  // Profile Management
  getProfile: async () => {
    const response = await apiClient.get("/auth/profile");
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await apiClient.put("/auth/profile", profileData);
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await apiClient.put("/auth/change-password", passwordData);
    return response.data;
  },

  // Address Management
  getAddresses: async () => {
    const response = await apiClient.get("/auth/addresses");
    return response.data;
  },

  addAddress: async (addressData) => {
    const response = await apiClient.post("/auth/addresses", addressData);
    return response.data;
  },

  updateAddress: async (addressId, addressData) => {
    const response = await apiClient.put(
      `/auth/addresses/${addressId}`,
      addressData
    );
    return response.data;
  },

  deleteAddress: async (addressId) => {
    const response = await apiClient.delete(`/auth/addresses/${addressId}`);
    return response.data;
  },

  // Social Authentication
  socialLogin: async (provider, token) => {
    const response = await apiClient.post("/auth/social-login", {
      provider,
      token,
    });
    if (response.data.token) {
      tokenUtils.setToken(response.data.token);
    }
    return response.data;
  },

  // Two-Factor Authentication
  enableTwoFactor: async () => {
    const response = await apiClient.post("/auth/2fa/enable");
    return response.data;
  },

  disableTwoFactor: async (token) => {
    const response = await apiClient.post("/auth/2fa/disable", { token });
    return response.data;
  },

  verifyTwoFactor: async (token) => {
    const response = await apiClient.post("/auth/2fa/verify", { token });
    return response.data;
  },

  // Utility methods
  getCurrentUser: () => {
    const token = tokenUtils.getToken();
    return tokenUtils.getUserFromToken(token);
  },

  isAuthenticated: () => {
    const token = tokenUtils.getToken();
    return tokenUtils.isTokenValid(token);
  },

  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user?.role || null;
  },

  hasPermission: (requiredRole) => {
    const userRole = authService.getUserRole();
    const roleHierarchy = {
      superadmin: 4,
      admin: 3,
      merchant: 2,
      user: 1,
    };
    return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
  },
};

export default authService;
