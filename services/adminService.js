import { apiClient } from "./api.js";

export const adminService = {
  // Admin Authentication
  auth: {
    login: async (credentials) => {
      const response = await apiClient.post("/auth/admin/login", credentials);
      return response.data;
    },

    logout: async () => {
      const response = await apiClient.post("/auth/admin/logout");
      return response.data;
    },

    forgotPassword: async (email) => {
      const response = await apiClient.post("/auth/admin/forgot-password", {
        email,
      });
      return response.data;
    },

    resetPassword: async (token, password) => {
      const response = await apiClient.post("/auth/admin/reset-password", {
        token,
        password,
      });
      return response.data;
    },

    verifyEmail: async (token) => {
      const response = await apiClient.post("/auth/admin/verify-email", {
        token,
      });
      return response.data;
    },

    getProfile: async () => {
      const response = await apiClient.get("/auth/admin/profile");
      return response.data;
    },

    updateProfile: async (profileData) => {
      const response = await apiClient.put("/auth/admin/profile", profileData);
      return response.data;
    },

    changePassword: async (passwordData) => {
      const response = await apiClient.put(
        "/auth/admin/change-password",
        passwordData
      );
      return response.data;
    },
  },

  // Admin Management
  admin: {
    getAllAdmins: async (params = {}) => {
      const response = await apiClient.get("/admin", { params });
      return response.data;
    },

    getAdminById: async (id) => {
      const response = await apiClient.get(`/admin/${id}`);
      return response.data;
    },

    createAdmin: async (adminData) => {
      const response = await apiClient.post("/admin", adminData);
      return response.data;
    },

    updateAdmin: async (id, adminData) => {
      const response = await apiClient.put(`/admin/${id}`, adminData);
      return response.data;
    },

    deleteAdmin: async (id) => {
      const response = await apiClient.delete(`/admin/${id}`);
      return response.data;
    },

    activateAdmin: async (id) => {
      const response = await apiClient.patch(`/admin/${id}/activate`);
      return response.data;
    },

    deactivateAdmin: async (id) => {
      const response = await apiClient.patch(`/admin/${id}/deactivate`);
      return response.data;
    },
  },

  // Super Admin
  superAdmin: {
    getDashboard: async () => {
      const response = await apiClient.get("/super-admin/dashboard");
      return response.data;
    },

    getSystemStats: async () => {
      const response = await apiClient.get("/super-admin/stats");
      return response.data;
    },

    getAllUsers: async (params = {}) => {
      const response = await apiClient.get("/super-admin/users", { params });
      return response.data;
    },

    manageUser: async (userId, action, data = {}) => {
      const response = await apiClient.patch(
        `/super-admin/users/${userId}/${action}`,
        data
      );
      return response.data;
    },

    getSystemLogs: async (params = {}) => {
      const response = await apiClient.get("/super-admin/logs", { params });
      return response.data;
    },

    backupDatabase: async () => {
      const response = await apiClient.post("/super-admin/backup");
      return response.data;
    },

    restoreDatabase: async (backupFile) => {
      const response = await apiClient.post("/super-admin/restore", {
        backupFile,
      });
      return response.data;
    },
  },

  // Brand Management
  brands: {
    getAllBrands: async (params = {}) => {
      const response = await apiClient.get("/brands", { params });
      return response.data;
    },

    getBrandById: async (id) => {
      const response = await apiClient.get(`/brands/${id}`);
      return response.data;
    },

    createBrand: async (brandData) => {
      const response = await apiClient.post("/brands", brandData);
      return response.data;
    },

    updateBrand: async (id, brandData) => {
      const response = await apiClient.put(`/brands/${id}`, brandData);
      return response.data;
    },

    deleteBrand: async (id) => {
      const response = await apiClient.delete(`/brands/${id}`);
      return response.data;
    },

    uploadBrandLogo: async (id, formData) => {
      const response = await apiClient.uploadFile(
        `/brands/${id}/logo`,
        formData
      );
      return response.data;
    },
  },

  // Category Management
  categories: {
    getAllCategories: async (params = {}) => {
      const response = await apiClient.get("/categories", { params });
      return response.data;
    },

    getCategoryById: async (id) => {
      const response = await apiClient.get(`/categories/${id}`);
      return response.data;
    },

    createCategory: async (categoryData) => {
      const response = await apiClient.post("/categories", categoryData);
      return response.data;
    },

    updateCategory: async (id, categoryData) => {
      const response = await apiClient.put(`/categories/${id}`, categoryData);
      return response.data;
    },

    deleteCategory: async (id) => {
      const response = await apiClient.delete(`/categories/${id}`);
      return response.data;
    },

    getCategoryTree: async () => {
      const response = await apiClient.get("/categories/tree");
      return response.data;
    },
  },

  // Content Management
  content: {
    getAllContent: async (params = {}) => {
      const response = await apiClient.get("/content", { params });
      return response.data;
    },

    getContentById: async (id) => {
      const response = await apiClient.get(`/content/${id}`);
      return response.data;
    },

    createContent: async (contentData) => {
      const response = await apiClient.post("/content", contentData);
      return response.data;
    },

    updateContent: async (id, contentData) => {
      const response = await apiClient.put(`/content/${id}`, contentData);
      return response.data;
    },

    deleteContent: async (id) => {
      const response = await apiClient.delete(`/content/${id}`);
      return response.data;
    },

    publishContent: async (id) => {
      const response = await apiClient.patch(`/content/${id}/publish`);
      return response.data;
    },

    unpublishContent: async (id) => {
      const response = await apiClient.patch(`/content/${id}/unpublish`);
      return response.data;
    },
  },

  // Activity Logs
  activity: {
    getAllActivities: async (params = {}) => {
      const response = await apiClient.get("/activity", { params });
      return response.data;
    },

    getActivityById: async (id) => {
      const response = await apiClient.get(`/activity/${id}`);
      return response.data;
    },

    getUserActivities: async (userId, params = {}) => {
      const response = await apiClient.get(`/activity/user/${userId}`, {
        params,
      });
      return response.data;
    },

    deleteActivity: async (id) => {
      const response = await apiClient.delete(`/activity/${id}`);
      return response.data;
    },

    clearAllActivities: async () => {
      const response = await apiClient.delete("/activity/clear");
      return response.data;
    },
  },

  // Banner Management
  banners: {
    getAllBanners: async (params = {}) => {
      const response = await apiClient.get("/banners", { params });
      return response.data;
    },

    getBannerById: async (id) => {
      const response = await apiClient.get(`/banners/${id}`);
      return response.data;
    },

    createBanner: async (bannerData) => {
      const response = await apiClient.post("/banners", bannerData);
      return response.data;
    },

    updateBanner: async (id, bannerData) => {
      const response = await apiClient.put(`/banners/${id}`, bannerData);
      return response.data;
    },

    deleteBanner: async (id) => {
      const response = await apiClient.delete(`/banners/${id}`);
      return response.data;
    },

    uploadBannerImage: async (id, formData) => {
      const response = await apiClient.uploadFile(
        `/banners/${id}/image`,
        formData
      );
      return response.data;
    },

    activateBanner: async (id) => {
      const response = await apiClient.patch(`/banners/${id}/activate`);
      return response.data;
    },

    deactivateBanner: async (id) => {
      const response = await apiClient.patch(`/banners/${id}/deactivate`);
      return response.data;
    },
  },
};

export default adminService;
