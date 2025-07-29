import { apiClient } from "./api.js";

export const orderService = {
  // Cart Management
  cart: {
    getCart: async () => {
      const response = await apiClient.get("/cart");
      return response.data;
    },

    addToCart: async (productId, quantity = 1, size = null, color = null) => {
      const response = await apiClient.post("/cart/add", {
        productId,
        quantity,
        size,
        color,
      });
      return response.data;
    },

    updateCartItem: async (itemId, quantity) => {
      const response = await apiClient.put(`/cart/item/${itemId}`, {
        quantity,
      });
      return response.data;
    },

    removeFromCart: async (itemId) => {
      const response = await apiClient.delete(`/cart/item/${itemId}`);
      return response.data;
    },

    clearCart: async () => {
      const response = await apiClient.delete("/cart/clear");
      return response.data;
    },

    applyCoupon: async (couponCode) => {
      const response = await apiClient.post("/cart/coupon", { couponCode });
      return response.data;
    },

    removeCoupon: async () => {
      const response = await apiClient.delete("/cart/coupon");
      return response.data;
    },

    getCartSummary: async () => {
      const response = await apiClient.get("/cart/summary");
      return response.data;
    },

    validateCart: async () => {
      const response = await apiClient.post("/cart/validate");
      return response.data;
    },

    saveForLater: async (itemId) => {
      const response = await apiClient.post(`/cart/item/${itemId}/save-later`);
      return response.data;
    },

    moveToCart: async (itemId) => {
      const response = await apiClient.post(
        `/cart/item/${itemId}/move-to-cart`
      );
      return response.data;
    },

    estimateShipping: async (address) => {
      const response = await apiClient.post("/cart/estimate-shipping", {
        address,
      });
      return response.data;
    },
  },

  // Order Management
  orders: {
    getAllOrders: async (params = {}) => {
      const response = await apiClient.get("/orders", { params });
      return response.data;
    },

    getOrderById: async (id) => {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    },

    createOrder: async (orderData) => {
      const response = await apiClient.post("/orders", orderData);
      return response.data;
    },

    updateOrder: async (id, orderData) => {
      const response = await apiClient.put(`/orders/${id}`, orderData);
      return response.data;
    },

    cancelOrder: async (id, reason) => {
      const response = await apiClient.patch(`/orders/${id}/cancel`, {
        reason,
      });
      return response.data;
    },

    getUserOrders: async (params = {}) => {
      const response = await apiClient.get("/orders/user/my-orders", {
        params,
      });
      return response.data;
    },

    getOrderStatus: async (id) => {
      const response = await apiClient.get(`/orders/${id}/status`);
      return response.data;
    },

    trackOrder: async (trackingNumber) => {
      const response = await apiClient.get(`/orders/track/${trackingNumber}`);
      return response.data;
    },

    getOrderInvoice: async (id) => {
      const response = await apiClient.get(`/orders/${id}/invoice`);
      return response.data;
    },

    downloadInvoice: async (id) => {
      const response = await apiClient.get(`/orders/${id}/invoice/download`, {
        responseType: "blob",
      });
      return response.data;
    },

    requestReturn: async (id, returnData) => {
      const response = await apiClient.post(`/orders/${id}/return`, returnData);
      return response.data;
    },

    requestExchange: async (id, exchangeData) => {
      const response = await apiClient.post(
        `/orders/${id}/exchange`,
        exchangeData
      );
      return response.data;
    },

    reorderItems: async (id, items = null) => {
      const response = await apiClient.post(`/orders/${id}/reorder`, { items });
      return response.data;
    },

    getOrderHistory: async (params = {}) => {
      const response = await apiClient.get("/orders/history", { params });
      return response.data;
    },

    estimateDelivery: async (orderId) => {
      const response = await apiClient.get(
        `/orders/${orderId}/estimate-delivery`
      );
      return response.data;
    },
  },

  // Multi-Merchant Orders
  multiMerchantOrders: {
    createOrderFromCart: async (orderData) => {
      const response = await apiClient.post(
        "/multi-merchant-orders/from-cart",
        orderData
      );
      return response.data;
    },

    getCustomerOrders: async (params = {}) => {
      const response = await apiClient.get("/multi-merchant-orders/customer", {
        params,
      });
      return response.data;
    },

    getOrderDetails: async (orderId) => {
      const response = await apiClient.get(`/multi-merchant-orders/${orderId}`);
      return response.data;
    },

    trackOrder: async (orderNumber) => {
      const response = await apiClient.get(
        `/multi-merchant-orders/track/${orderNumber}`
      );
      return response.data;
    },

    // Merchant-specific methods
    getMerchantOrders: async (params = {}) => {
      const response = await apiClient.get("/multi-merchant-orders/merchant", {
        params,
      });
      return response.data;
    },

    updateSubOrderStatus: async (orderId, subOrderId, status, notes = "") => {
      const response = await apiClient.patch(
        `/multi-merchant-orders/${orderId}/sub-order/${subOrderId}/status`,
        { status, notes }
      );
      return response.data;
    },

    addTrackingInfo: async (orderId, subOrderId, trackingData) => {
      const response = await apiClient.post(
        `/multi-merchant-orders/${orderId}/sub-order/${subOrderId}/tracking`,
        trackingData
      );
      return response.data;
    },

    getMerchantOrderStats: async (timeRange = "30d") => {
      const response = await apiClient.get(
        "/multi-merchant-orders/merchant/stats",
        {
          params: { timeRange },
        }
      );
      return response.data;
    },

    getMerchantDashboard: async () => {
      const response = await apiClient.get(
        "/multi-merchant-orders/merchant/dashboard"
      );
      return response.data;
    },

    // Admin methods
    getAllOrders: async (params = {}) => {
      const response = await apiClient.get("/multi-merchant-orders/admin/all", {
        params,
      });
      return response.data;
    },

    getOrderAnalytics: async (timeRange = "30d") => {
      const response = await apiClient.get(
        "/multi-merchant-orders/admin/analytics",
        {
          params: { timeRange },
        }
      );
      return response.data;
    },
  },

  // Bulk Orders
  bulkOrders: {
    getAllBulkOrders: async (params = {}) => {
      const response = await apiClient.get("/bulk-orders", { params });
      return response.data;
    },

    getBulkOrderById: async (id) => {
      const response = await apiClient.get(`/bulk-orders/${id}`);
      return response.data;
    },

    createBulkOrder: async (bulkOrderData) => {
      const response = await apiClient.post("/bulk-orders", bulkOrderData);
      return response.data;
    },

    updateBulkOrder: async (id, bulkOrderData) => {
      const response = await apiClient.put(`/bulk-orders/${id}`, bulkOrderData);
      return response.data;
    },

    approveBulkOrder: async (id) => {
      const response = await apiClient.patch(`/bulk-orders/${id}/approve`);
      return response.data;
    },

    rejectBulkOrder: async (id, reason) => {
      const response = await apiClient.patch(`/bulk-orders/${id}/reject`, {
        reason,
      });
      return response.data;
    },

    getBulkOrderQuote: async (items) => {
      const response = await apiClient.post("/bulk-orders/quote", { items });
      return response.data;
    },

    uploadBulkOrderFile: async (formData) => {
      const response = await apiClient.uploadFile(
        "/bulk-orders/upload",
        formData
      );
      return response.data;
    },

    downloadBulkOrderTemplate: async () => {
      const response = await apiClient.get("/bulk-orders/template", {
        responseType: "blob",
      });
      return response.data;
    },
  },

  // Shipping Management
  shipping: {
    getAllShippingMethods: async () => {
      const response = await apiClient.get("/shipping/methods");
      return response.data;
    },

    calculateShipping: async (shippingData) => {
      const response = await apiClient.post(
        "/shipping/calculate",
        shippingData
      );
      return response.data;
    },

    trackShipment: async (trackingNumber) => {
      const response = await apiClient.get(`/shipping/track/${trackingNumber}`);
      return response.data;
    },

    getShippingRates: async (address, weight, dimensions) => {
      const response = await apiClient.post("/shipping/rates", {
        address,
        weight,
        dimensions,
      });
      return response.data;
    },

    createShipment: async (shipmentData) => {
      const response = await apiClient.post("/shipping", shipmentData);
      return response.data;
    },

    updateShipment: async (id, shipmentData) => {
      const response = await apiClient.put(`/shipping/${id}`, shipmentData);
      return response.data;
    },

    cancelShipment: async (id) => {
      const response = await apiClient.delete(`/shipping/${id}`);
      return response.data;
    },

    getShippingLabel: async (shipmentId) => {
      const response = await apiClient.get(`/shipping/${shipmentId}/label`, {
        responseType: "blob",
      });
      return response.data;
    },

    schedulePickup: async (pickupData) => {
      const response = await apiClient.post("/shipping/pickup", pickupData);
      return response.data;
    },

    getDeliveryEstimate: async (address, serviceType) => {
      const response = await apiClient.post("/shipping/estimate", {
        address,
        serviceType,
      });
      return response.data;
    },
  },

  // Refund Management
  refunds: {
    getAllRefunds: async (params = {}) => {
      const response = await apiClient.get("/refunds", { params });
      return response.data;
    },

    getRefundById: async (id) => {
      const response = await apiClient.get(`/refunds/${id}`);
      return response.data;
    },

    createRefund: async (refundData) => {
      const response = await apiClient.post("/refunds", refundData);
      return response.data;
    },

    updateRefund: async (id, refundData) => {
      const response = await apiClient.put(`/refunds/${id}`, refundData);
      return response.data;
    },

    approveRefund: async (id) => {
      const response = await apiClient.patch(`/refunds/${id}/approve`);
      return response.data;
    },

    rejectRefund: async (id, reason) => {
      const response = await apiClient.patch(`/refunds/${id}/reject`, {
        reason,
      });
      return response.data;
    },

    processRefund: async (id) => {
      const response = await apiClient.patch(`/refunds/${id}/process`);
      return response.data;
    },

    getRefundStatus: async (id) => {
      const response = await apiClient.get(`/refunds/${id}/status`);
      return response.data;
    },

    uploadRefundDocuments: async (id, formData) => {
      const response = await apiClient.uploadFile(
        `/refunds/${id}/documents`,
        formData
      );
      return response.data;
    },

    getRefundPolicy: async () => {
      const response = await apiClient.get("/refunds/policy");
      return response.data;
    },

    calculateRefundAmount: async (orderId, items) => {
      const response = await apiClient.post("/refunds/calculate", {
        orderId,
        items,
      });
      return response.data;
    },
  },
};

export default orderService;
