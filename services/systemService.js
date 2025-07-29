import { apiClient } from "./api.js";

export const systemService = {
  // Analytics Management
  analytics: {
    createAnalytics: async (analyticsData) => {
      const response = await apiClient.post("/analytics", analyticsData);
      return response.data;
    },

    getAllAnalytics: async () => {
      const response = await apiClient.get("/analytics");
      return response.data;
    },

    getAnalyticsById: async (id) => {
      const response = await apiClient.get(`/analytics/${id}`);
      return response.data;
    },

    updateAnalytics: async (id, analyticsData) => {
      const response = await apiClient.put(`/analytics/${id}`, analyticsData);
      return response.data;
    },

    deleteAnalytics: async (id) => {
      const response = await apiClient.delete(`/analytics/${id}`);
      return response.data;
    },

    getSystemAnalytics: async (timeRange = "30d") => {
      const response = await apiClient.get("/analytics/system", {
        params: { timeRange }
      });
      return response.data;
    },

    getUserAnalytics: async (timeRange = "30d") => {
      const response = await apiClient.get("/analytics/users", {
        params: { timeRange }
      });
      return response.data;
    },

    getProductAnalytics: async (timeRange = "30d") => {
      const response = await apiClient.get("/analytics/products", {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesAnalytics: async (timeRange = "30d") => {
      const response = await apiClient.get("/analytics/sales", {
        params: { timeRange }
      });
      return response.data;
    },

    getTrafficAnalytics: async (timeRange = "30d") => {
      const response = await apiClient.get("/analytics/traffic", {
        params: { timeRange }
      });
      return response.data;
    },

    getConversionAnalytics: async (timeRange = "30d") => {
      const response = await apiClient.get("/analytics/conversions", {
        params: { timeRange }
      });
      return response.data;
    },
  },

  // Audit Log Management
  auditLogs: {
    getAllAuditLogs: async (params = {}) => {
      const response = await apiClient.get("/audit-logs", { params });
      return response.data;
    },

    getAuditLogById: async (id) => {
      const response = await apiClient.get(`/audit-logs/${id}`);
      return response.data;
    },

    createAuditLog: async (logData) => {
      const response = await apiClient.post("/audit-logs", logData);
      return response.data;
    },

    deleteAuditLog: async (id) => {
      const response = await apiClient.delete(`/audit-logs/${id}`);
      return response.data;
    },

    getUserAuditLogs: async (userId, params = {}) => {
      const response = await apiClient.get(`/audit-logs/user/${userId}`, { params });
      return response.data;
    },

    getAuditLogsByAction: async (action, params = {}) => {
      const response = await apiClient.get(`/audit-logs/action/${action}`, { params });
      return response.data;
    },

    getAuditLogsByDateRange: async (startDate, endDate, params = {}) => {
      const response = await apiClient.get("/audit-logs/date-range", {
        params: { startDate, endDate, ...params }
      });
      return response.data;
    },

    exportAuditLogs: async (startDate, endDate, format = "csv") => {
      const response = await apiClient.get("/audit-logs/export", {
        params: { startDate, endDate, format },
        responseType: "blob"
      });
      return response.data;
    },

    clearOldAuditLogs: async (daysToKeep = 90) => {
      const response = await apiClient.delete("/audit-logs/cleanup", {
        params: { daysToKeep }
      });
      return response.data;
    },
  },

  // FAQ Management
  faq: {
    getAllFAQs: async (params = {}) => {
      const response = await apiClient.get("/faq-data", { params });
      return response.data;
    },

    getFAQById: async (id) => {
      const response = await apiClient.get(`/faq-data/${id}`);
      return response.data;
    },

    createFAQ: async (faqData) => {
      const response = await apiClient.post("/faq-data", faqData);
      return response.data;
    },

    updateFAQ: async (id, faqData) => {
      const response = await apiClient.put(`/faq-data/${id}`, faqData);
      return response.data;
    },

    deleteFAQ: async (id) => {
      const response = await apiClient.delete(`/faq-data/${id}`);
      return response.data;
    },

    getFAQsByCategory: async (category, params = {}) => {
      const response = await apiClient.get(`/faq-data/category/${category}`, { params });
      return response.data;
    },

    searchFAQs: async (query, params = {}) => {
      const response = await apiClient.get("/faq-data/search", {
        params: { q: query, ...params }
      });
      return response.data;
    },

    getPopularFAQs: async (limit = 10) => {
      const response = await apiClient.get("/faq-data/popular", {
        params: { limit }
      });
      return response.data;
    },

    toggleFAQStatus: async (id) => {
      const response = await apiClient.patch(`/faq-data/${id}/toggle-status`);
      return response.data;
    },

    reorderFAQs: async (orderData) => {
      const response = await apiClient.put("/faq-data/reorder", orderData);
      return response.data;
    },

    getFAQCategories: async () => {
      const response = await apiClient.get("/faq-data/categories");
      return response.data;
    },

    bulkUpdateFAQs: async (updateData) => {
      const response = await apiClient.patch("/faq-data/bulk-update", updateData);
      return response.data;
    },
  },

  // Notification Management
  notifications: {
    getAllNotifications: async (params = {}) => {
      const response = await apiClient.get("/notifications", { params });
      return response.data;
    },

    getNotificationById: async (id) => {
      const response = await apiClient.get(`/notifications/${id}`);
      return response.data;
    },

    createNotification: async (notificationData) => {
      const response = await apiClient.post("/notifications", notificationData);
      return response.data;
    },

    updateNotification: async (id, notificationData) => {
      const response = await apiClient.put(`/notifications/${id}`, notificationData);
      return response.data;
    },

    deleteNotification: async (id) => {
      const response = await apiClient.delete(`/notifications/${id}`);
      return response.data;
    },

    getUserNotifications: async (userId, params = {}) => {
      const response = await apiClient.get(`/notifications/user/${userId}`, { params });
      return response.data;
    },

    markNotificationAsRead: async (id) => {
      const response = await apiClient.patch(`/notifications/${id}/read`);
      return response.data;
    },

    markNotificationAsUnread: async (id) => {
      const response = await apiClient.patch(`/notifications/${id}/unread`);
      return response.data;
    },

    markAllNotificationsAsRead: async (userId) => {
      const response = await apiClient.patch(`/notifications/user/${userId}/read-all`);
      return response.data;
    },

    deleteUserNotifications: async (userId) => {
      const response = await apiClient.delete(`/notifications/user/${userId}`);
      return response.data;
    },

    getUnreadNotificationsCount: async (userId) => {
      const response = await apiClient.get(`/notifications/user/${userId}/unread-count`);
      return response.data;
    },

    sendBroadcastNotification: async (notificationData) => {
      const response = await apiClient.post("/notifications/broadcast", notificationData);
      return response.data;
    },

    sendNotificationToUsers: async (userIds, notificationData) => {
      const response = await apiClient.post("/notifications/send-to-users", {
        userIds,
        ...notificationData
      });
      return response.data;
    },

    scheduleNotification: async (notificationData, scheduledTime) => {
      const response = await apiClient.post("/notifications/schedule", {
        ...notificationData,
        scheduledTime
      });
      return response.data;
    },

    cancelScheduledNotification: async (id) => {
      const response = await apiClient.delete(`/notifications/scheduled/${id}`);
      return response.data;
    },

    getScheduledNotifications: async (params = {}) => {
      const response = await apiClient.get("/notifications/scheduled", { params });
      return response.data;
    },

    getNotificationSettings: async (userId) => {
      const response = await apiClient.get(`/notifications/settings/${userId}`);
      return response.data;
    },

    updateNotificationSettings: async (userId, settings) => {
      const response = await apiClient.put(`/notifications/settings/${userId}`, settings);
      return response.data;
    },

    sendPushNotification: async (notificationData) => {
      const response = await apiClient.post("/notifications/push", notificationData);
      return response.data;
    },

    sendEmailNotification: async (notificationData) => {
      const response = await apiClient.post("/notifications/email", notificationData);
      return response.data;
    },

    sendSMSNotification: async (notificationData) => {
      const response = await apiClient.post("/notifications/sms", notificationData);
      return response.data;
    },

    getNotificationTemplates: async () => {
      const response = await apiClient.get("/notifications/templates");
      return response.data;
    },

    createNotificationTemplate: async (templateData) => {
      const response = await apiClient.post("/notifications/templates", templateData);
      return response.data;
    },

    updateNotificationTemplate: async (id, templateData) => {
      const response = await apiClient.put(`/notifications/templates/${id}`, templateData);
      return response.data;
    },

    deleteNotificationTemplate: async (id) => {
      const response = await apiClient.delete(`/notifications/templates/${id}`);
      return response.data;
    },
  },

  // Dashboard Analytics
  dashboard: {
    getDashboardStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/dashboard", {
        params: { timeRange }
      });
      return response.data;
    },

    getRevenueStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/dashboard/revenue", {
        params: { timeRange }
      });
      return response.data;
    },

    getOrderStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/dashboard/orders", {
        params: { timeRange }
      });
      return response.data;
    },

    getProductStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/dashboard/products", {
        params: { timeRange }
      });
      return response.data;
    },

    getCustomerStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/dashboard/customers", {
        params: { timeRange }
      });
      return response.data;
    },

    getTopSellingProducts: async (limit = 10, timeRange = "30d") => {
      const response = await apiClient.get("/dashboard/top-products", {
        params: { limit, timeRange }
      });
      return response.data;
    },

    getRecentOrders: async (limit = 10) => {
      const response = await apiClient.get("/dashboard/recent-orders", {
        params: { limit }
      });
      return response.data;
    },

    getRecentCustomers: async (limit = 10) => {
      const response = await apiClient.get("/dashboard/recent-customers", {
        params: { limit }
      });
      return response.data;
    },

    getLowStockAlerts: async (threshold = 10) => {
      const response = await apiClient.get("/dashboard/low-stock", {
        params: { threshold }
      });
      return response.data;
    },

    getSystemHealth: async () => {
      const response = await apiClient.get("/dashboard/system-health");
      return response.data;
    },

    getPerformanceMetrics: async (timeRange = "24h") => {
      const response = await apiClient.get("/dashboard/performance", {
        params: { timeRange }
      });
      return response.data;
    },

    exportDashboardData: async (timeRange = "30d", format = "csv") => {
      const response = await apiClient.get("/dashboard/export", {
        params: { timeRange, format },
        responseType: "blob"
      });
      return response.data;
    },
  },

  // Sales Analytics
  sales: {
    getSalesStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/sales", {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesReport: async (startDate, endDate, groupBy = "day") => {
      const response = await apiClient.get("/sales/report", {
        params: { startDate, endDate, groupBy }
      });
      return response.data;
    },

    getSalesTrends: async (timeRange = "30d") => {
      const response = await apiClient.get("/sales/trends", {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesByCategory: async (timeRange = "30d") => {
      const response = await apiClient.get("/sales/by-category", {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesByProduct: async (timeRange = "30d", limit = 20) => {
      const response = await apiClient.get("/sales/by-product", {
        params: { timeRange, limit }
      });
      return response.data;
    },

    getSalesByRegion: async (timeRange = "30d") => {
      const response = await apiClient.get("/sales/by-region", {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesByPaymentMethod: async (timeRange = "30d") => {
      const response = await apiClient.get("/sales/by-payment-method", {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesConversion: async (timeRange = "30d") => {
      const response = await apiClient.get("/sales/conversion", {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesForecast: async (timeRange = "30d") => {
      const response = await apiClient.get("/sales/forecast", {
        params: { timeRange }
      });
      return response.data;
    },

    exportSalesData: async (startDate, endDate, format = "csv") => {
      const response = await apiClient.get("/sales/export", {
        params: { startDate, endDate, format },
        responseType: "blob"
      });
      return response.data;
    },

    getSalesComparison: async (period1, period2) => {
      const response = await apiClient.get("/sales/comparison", {
        params: { period1, period2 }
      });
      return response.data;
    },

    getSalesGoals: async () => {
      const response = await apiClient.get("/sales/goals");
      return response.data;
    },

    setSalesGoal: async (goalData) => {
      const response = await apiClient.post("/sales/goals", goalData);
      return response.data;
    },

    updateSalesGoal: async (id, goalData) => {
      const response = await apiClient.put(`/sales/goals/${id}`, goalData);
      return response.data;
    },

    deleteSalesGoal: async (id) => {
      const response = await apiClient.delete(`/sales/goals/${id}`);
      return response.data;
    },
  },

  // System Configuration
  configuration: {
    getSystemSettings: async () => {
      const response = await apiClient.get("/system/settings");
      return response.data;
    },

    updateSystemSettings: async (settingsData) => {
      const response = await apiClient.put("/system/settings", settingsData);
      return response.data;
    },

    getEmailSettings: async () => {
      const response = await apiClient.get("/system/email-settings");
      return response.data;
    },

    updateEmailSettings: async (emailSettings) => {
      const response = await apiClient.put("/system/email-settings", emailSettings);
      return response.data;
    },

    testEmailConfiguration: async () => {
      const response = await apiClient.post("/system/test-email");
      return response.data;
    },

    getPaymentSettings: async () => {
      const response = await apiClient.get("/system/payment-settings");
      return response.data;
    },

    updatePaymentSettings: async (paymentSettings) => {
      const response = await apiClient.put("/system/payment-settings", paymentSettings);
      return response.data;
    },

    getShippingSettings: async () => {
      const response = await apiClient.get("/system/shipping-settings");
      return response.data;
    },

    updateShippingSettings: async (shippingSettings) => {
      const response = await apiClient.put("/system/shipping-settings", shippingSettings);
      return response.data;
    },

    getTaxSettings: async () => {
      const response = await apiClient.get("/system/tax-settings");
      return response.data;
    },

    updateTaxSettings: async (taxSettings) => {
      const response = await apiClient.put("/system/tax-settings", taxSettings);
      return response.data;
    },

    getSystemLogs: async (params = {}) => {
      const response = await apiClient.get("/system/logs", { params });
      return response.data;
    },

    clearSystemLogs: async () => {
      const response = await apiClient.delete("/system/logs");
      return response.data;
    },

    backupDatabase: async () => {
      const response = await apiClient.post("/system/backup");
      return response.data;
    },

    restoreDatabase: async (backupFile) => {
      const formData = new FormData();
      formData.append("backup", backupFile);
      const response = await apiClient.post("/system/restore", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },

    getSystemStatus: async () => {
      const response = await apiClient.get("/system/status");
      return response.data;
    },

    optimizeDatabase: async () => {
      const response = await apiClient.post("/system/optimize");
      return response.data;
    },
  },
};

export default systemService;
