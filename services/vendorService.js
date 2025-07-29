import { apiClient } from "./api.js";

export const vendorService = {
  // Vendor Management
  vendors: {
    getAllVendors: async () => {
      const response = await apiClient.get("/vendors");
      return response.data;
    },

    getVendorById: async (id) => {
      const response = await apiClient.get(`/vendors/${id}`);
      return response.data;
    },

    createVendor: async (vendorData) => {
      const response = await apiClient.post("/vendors", vendorData);
      return response.data;
    },

    updateVendor: async (id, vendorData) => {
      const response = await apiClient.put(`/vendors/${id}`, vendorData);
      return response.data;
    },

    deleteVendor: async (id) => {
      const response = await apiClient.delete(`/vendors/${id}`);
      return response.data;
    },

    activateVendor: async (id) => {
      const response = await apiClient.patch(`/vendors/${id}/activate`);
      return response.data;
    },

    deactivateVendor: async (id) => {
      const response = await apiClient.patch(`/vendors/${id}/deactivate`);
      return response.data;
    },

    getVendorStats: async (id) => {
      const response = await apiClient.get(`/vendors/${id}/stats`);
      return response.data;
    },

    getVendorProducts: async (id, params = {}) => {
      const response = await apiClient.get(`/vendors/${id}/products`, { params });
      return response.data;
    },

    getVendorOrders: async (id, params = {}) => {
      const response = await apiClient.get(`/vendors/${id}/orders`, { params });
      return response.data;
    },
  },

  // Merchant Management
  merchants: {
    createMerchant: async (merchantData) => {
      const response = await apiClient.post("/merchants/super-admin/create-merchant", merchantData);
      return response.data;
    },

    getAllMerchants: async () => {
      const response = await apiClient.get("/merchants/super-admin/getAll-merchant");
      return response.data;
    },

    getMerchantById: async (id) => {
      const response = await apiClient.get(`/merchants/super-admin/get-merchant/${id}`);
      return response.data;
    },

    updateMerchant: async (id, merchantData) => {
      const response = await apiClient.patch(`/merchants/super-admin/update-merchant/${id}`, merchantData);
      return response.data;
    },

    deleteMerchant: async (id) => {
      const response = await apiClient.delete(`/merchants/super-admin/delete-merchant/${id}`);
      return response.data;
    },

    approveMerchant: async (id) => {
      const response = await apiClient.patch(`/merchants/super-admin/approve-merchant/${id}`);
      return response.data;
    },

    rejectMerchant: async (id, reason) => {
      const response = await apiClient.patch(`/merchants/super-admin/reject-merchant/${id}`, { reason });
      return response.data;
    },

    suspendMerchant: async (id, reason) => {
      const response = await apiClient.patch(`/merchants/super-admin/suspend-merchant/${id}`, { reason });
      return response.data;
    },

    unsuspendMerchant: async (id) => {
      const response = await apiClient.patch(`/merchants/super-admin/unsuspend-merchant/${id}`);
      return response.data;
    },

    getMerchantDashboard: async (id) => {
      const response = await apiClient.get(`/merchants/${id}/dashboard`);
      return response.data;
    },

    getMerchantSales: async (id, params = {}) => {
      const response = await apiClient.get(`/merchants/${id}/sales`, { params });
      return response.data;
    },

    getMerchantPayouts: async (id, params = {}) => {
      const response = await apiClient.get(`/merchants/${id}/payouts`, { params });
      return response.data;
    },

    requestPayout: async (id, payoutData) => {
      const response = await apiClient.post(`/merchants/${id}/request-payout`, payoutData);
      return response.data;
    },
  },

  // Merchant Brand Management
  merchantBrands: {
    createBrand: async (merchantId, brandData) => {
      const formData = new FormData();
      Object.keys(brandData).forEach(key => {
        if (key === 'logo' && brandData[key] instanceof File) {
          formData.append('logo', brandData[key]);
        } else {
          formData.append(key, brandData[key]);
        }
      });

      const response = await apiClient.post(`/merchants/super-admin/createBrand/${merchantId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },

    updateBrand: async (brandId, brandData) => {
      const formData = new FormData();
      Object.keys(brandData).forEach(key => {
        if (key === 'logo' && brandData[key] instanceof File) {
          formData.append('logo', brandData[key]);
        } else {
          formData.append(key, brandData[key]);
        }
      });

      const response = await apiClient.patch(`/merchants/super-admin/updateBrand/${brandId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },

    deleteBrand: async (brandId) => {
      const response = await apiClient.delete(`/merchants/super-admin/deleteBrand/${brandId}`);
      return response.data;
    },

    getMerchantBrands: async (merchantId) => {
      const response = await apiClient.get(`/merchants/${merchantId}/brands`);
      return response.data;
    },

    getBrandById: async (brandId) => {
      const response = await apiClient.get(`/merchants/brands/${brandId}`);
      return response.data;
    },

    activateBrand: async (brandId) => {
      const response = await apiClient.patch(`/merchants/brands/${brandId}/activate`);
      return response.data;
    },

    deactivateBrand: async (brandId) => {
      const response = await apiClient.patch(`/merchants/brands/${brandId}/deactivate`);
      return response.data;
    },
  },

  // Merchant Product Management
  merchantProducts: {
    createProduct: async (merchantId, productData) => {
      const response = await apiClient.post(`/merchants/${merchantId}/products`, productData);
      return response.data;
    },

    getMerchantProducts: async (merchantId, params = {}) => {
      const response = await apiClient.get(`/merchants/${merchantId}/products`, { params });
      return response.data;
    },

    updateProduct: async (merchantId, productId, productData) => {
      const response = await apiClient.put(`/merchants/${merchantId}/products/${productId}`, productData);
      return response.data;
    },

    deleteProduct: async (merchantId, productId) => {
      const response = await apiClient.delete(`/merchants/${merchantId}/products/${productId}`);
      return response.data;
    },

    toggleProductStatus: async (merchantId, productId) => {
      const response = await apiClient.patch(`/merchants/${merchantId}/products/${productId}/toggle-status`);
      return response.data;
    },

    bulkUpdateProducts: async (merchantId, updateData) => {
      const response = await apiClient.patch(`/merchants/${merchantId}/products/bulk-update`, updateData);
      return response.data;
    },

    uploadProductImages: async (merchantId, productId, imageFiles) => {
      const formData = new FormData();
      imageFiles.forEach((file, index) => {
        formData.append(`images`, file);
      });

      const response = await apiClient.post(`/merchants/${merchantId}/products/${productId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },

    deleteProductImage: async (merchantId, productId, imageId) => {
      const response = await apiClient.delete(`/merchants/${merchantId}/products/${productId}/images/${imageId}`);
      return response.data;
    },
  },

  // Merchant Order Management
  merchantOrders: {
    getMerchantOrders: async (merchantId, params = {}) => {
      const response = await apiClient.get(`/merchants/${merchantId}/orders`, { params });
      return response.data;
    },

    getOrderById: async (merchantId, orderId) => {
      const response = await apiClient.get(`/merchants/${merchantId}/orders/${orderId}`);
      return response.data;
    },

    updateOrderStatus: async (merchantId, orderId, status, notes = "") => {
      const response = await apiClient.patch(`/merchants/${merchantId}/orders/${orderId}/status`, {
        status,
        notes
      });
      return response.data;
    },

    addTrackingInfo: async (merchantId, orderId, trackingData) => {
      const response = await apiClient.post(`/merchants/${merchantId}/orders/${orderId}/tracking`, trackingData);
      return response.data;
    },

    processRefund: async (merchantId, orderId, refundData) => {
      const response = await apiClient.post(`/merchants/${merchantId}/orders/${orderId}/refund`, refundData);
      return response.data;
    },

    generateInvoice: async (merchantId, orderId) => {
      const response = await apiClient.get(`/merchants/${merchantId}/orders/${orderId}/invoice`);
      return response.data;
    },

    downloadInvoice: async (merchantId, orderId) => {
      const response = await apiClient.get(`/merchants/${merchantId}/orders/${orderId}/invoice/download`, {
        responseType: 'blob'
      });
      return response.data;
    },

    getOrderStatistics: async (merchantId, timeRange = "30d") => {
      const response = await apiClient.get(`/merchants/${merchantId}/orders/statistics`, {
        params: { timeRange }
      });
      return response.data;
    },
  },

  // Merchant Inventory Management
  merchantInventory: {
    getInventory: async (merchantId, params = {}) => {
      const response = await apiClient.get(`/merchants/${merchantId}/inventory`, { params });
      return response.data;
    },

    updateInventory: async (merchantId, productId, inventoryData) => {
      const response = await apiClient.put(`/merchants/${merchantId}/inventory/${productId}`, inventoryData);
      return response.data;
    },

    getLowStockProducts: async (merchantId, threshold = 10) => {
      const response = await apiClient.get(`/merchants/${merchantId}/inventory/low-stock`, {
        params: { threshold }
      });
      return response.data;
    },

    getOutOfStockProducts: async (merchantId) => {
      const response = await apiClient.get(`/merchants/${merchantId}/inventory/out-of-stock`);
      return response.data;
    },

    bulkUpdateInventory: async (merchantId, updates) => {
      const response = await apiClient.patch(`/merchants/${merchantId}/inventory/bulk-update`, { updates });
      return response.data;
    },

    getInventoryHistory: async (merchantId, productId, params = {}) => {
      const response = await apiClient.get(`/merchants/${merchantId}/inventory/${productId}/history`, { params });
      return response.data;
    },
  },

  // Merchant Analytics
  merchantAnalytics: {
    getDashboardStats: async (merchantId, timeRange = "30d") => {
      const response = await apiClient.get(`/merchants/${merchantId}/analytics/dashboard`, {
        params: { timeRange }
      });
      return response.data;
    },

    getSalesReport: async (merchantId, startDate, endDate, groupBy = "day") => {
      const response = await apiClient.get(`/merchants/${merchantId}/analytics/sales`, {
        params: { startDate, endDate, groupBy }
      });
      return response.data;
    },

    getTopProducts: async (merchantId, timeRange = "30d", limit = 10) => {
      const response = await apiClient.get(`/merchants/${merchantId}/analytics/top-products`, {
        params: { timeRange, limit }
      });
      return response.data;
    },

    getCustomerAnalytics: async (merchantId, timeRange = "30d") => {
      const response = await apiClient.get(`/merchants/${merchantId}/analytics/customers`, {
        params: { timeRange }
      });
      return response.data;
    },

    getRevenueReport: async (merchantId, startDate, endDate) => {
      const response = await apiClient.get(`/merchants/${merchantId}/analytics/revenue`, {
        params: { startDate, endDate }
      });
      return response.data;
    },

    exportSalesData: async (merchantId, startDate, endDate, format = "csv") => {
      const response = await apiClient.get(`/merchants/${merchantId}/analytics/export`, {
        params: { startDate, endDate, format },
        responseType: 'blob'
      });
      return response.data;
    },
  },

  // Merchant Settings
  merchantSettings: {
    getSettings: async (merchantId) => {
      const response = await apiClient.get(`/merchants/${merchantId}/settings`);
      return response.data;
    },

    updateSettings: async (merchantId, settingsData) => {
      const response = await apiClient.put(`/merchants/${merchantId}/settings`, settingsData);
      return response.data;
    },

    updatePaymentSettings: async (merchantId, paymentData) => {
      const response = await apiClient.put(`/merchants/${merchantId}/settings/payment`, paymentData);
      return response.data;
    },

    updateShippingSettings: async (merchantId, shippingData) => {
      const response = await apiClient.put(`/merchants/${merchantId}/settings/shipping`, shippingData);
      return response.data;
    },

    updateNotificationSettings: async (merchantId, notificationData) => {
      const response = await apiClient.put(`/merchants/${merchantId}/settings/notifications`, notificationData);
      return response.data;
    },

    uploadLogo: async (merchantId, logoFile) => {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await apiClient.post(`/merchants/${merchantId}/settings/logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      return response.data;
    },

    deleteLogo: async (merchantId) => {
      const response = await apiClient.delete(`/merchants/${merchantId}/settings/logo`);
      return response.data;
    },
  },
};

export default vendorService;
