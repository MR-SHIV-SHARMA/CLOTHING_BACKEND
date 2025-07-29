import { apiClient } from "./api.js";

export const userService = {
  // User Management
  users: {
    register: async (userData) => {
      const response = await apiClient.post("/users/register", userData);
      return response.data;
    },

    login: async (credentials) => {
      const response = await apiClient.post("/users/login", credentials);
      return response.data;
    },

    logout: async () => {
      const response = await apiClient.post("/users/logout");
      return response.data;
    },

    refreshToken: async () => {
      const response = await apiClient.post("/users/refresh-token");
      return response.data;
    },

    changePassword: async (passwordData) => {
      const response = await apiClient.post("/users/change-password", passwordData);
      return response.data;
    },

    getCurrentUser: async () => {
      const response = await apiClient.post("/users/current-user");
      return response.data;
    },

    updateAccountDetails: async (accountData) => {
      const response = await apiClient.patch("/users/update-account-details", accountData);
      return response.data;
    },

    updateUserAvatar: async (avatarFile) => {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const response = await apiClient.patch("/users/update-user-avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },
  },

  // Address Management
  addresses: {
    createAddress: async (addressData) => {
      const response = await apiClient.post("/addresses", addressData);
      return response.data;
    },

    getAddressById: async (id) => {
      const response = await apiClient.get(`/addresses/address/${id}`);
      return response.data;
    },

    updateAddress: async (id, addressData) => {
      const response = await apiClient.put(`/addresses/address/${id}`, addressData);
      return response.data;
    },

    deleteAddress: async (id) => {
      const response = await apiClient.delete(`/addresses/address/${id}`);
      return response.data;
    },
  },

  // Feedback Management
  feedback: {
    createFeedback: async (feedbackData) => {
      const response = await apiClient.post("/feedback", feedbackData);
      return response.data;
    },

    getAllFeedbacks: async () => {
      const response = await apiClient.get("/feedback");
      return response.data;
    },

    updateFeedback: async (id, feedbackData) => {
      const response = await apiClient.put(`/feedback/${id}`, feedbackData);
      return response.data;
    },

    deleteFeedback: async (id) => {
      const response = await apiClient.delete(`/feedback/${id}`);
      return response.data;
    },
  },

  // OAuth Management
  oauth: {
    googleLogin: async (tokenData) => {
      const response = await apiClient.post("/oauth/google/login", tokenData);
      return response.data;
    },

    facebookLogin: async (tokenData) => {
      const response = await apiClient.post("/oauth/facebook/login", tokenData);
      return response.data;
    },

    getConnectedAccounts: async () => {
      const response = await apiClient.get("/oauth/connected");
      return response.data;
    },

    linkGoogleAccount: async (tokenData) => {
      const response = await apiClient.post("/oauth/google/link", tokenData);
      return response.data;
    },

    linkFacebookAccount: async (tokenData) => {
      const response = await apiClient.post("/oauth/facebook/link", tokenData);
      return response.data;
    },

    unlinkSocialAccount: async (provider) => {
      const response = await apiClient.delete(`/oauth/${provider}/unlink`);
      return response.data;
    },
  },
};

export default userService;
