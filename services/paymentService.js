import { apiClient } from "./api.js";

export const paymentService = {
  // Regular Payment Methods
  payments: {
    createPayment: async (paymentData) => {
      const response = await apiClient.post("/payments", paymentData);
      return response.data;
    },

    getPaymentStatus: async (transactionId) => {
      const response = await apiClient.get(
        `/payments/status?id=${transactionId}`
      );
      return response.data;
    },

    getAllPayments: async (params = {}) => {
      const response = await apiClient.get("/payments", { params });
      return response.data;
    },

    getPaymentById: async (id) => {
      const response = await apiClient.get(`/payments/${id}`);
      return response.data;
    },

    updatePayment: async (id, paymentData) => {
      const response = await apiClient.put(`/payments/${id}`, paymentData);
      return response.data;
    },

    deletePayment: async (id) => {
      const response = await apiClient.delete(`/payments/${id}`);
      return response.data;
    },

    updateOrderPaymentStatus: async (orderId, paymentStatus) => {
      const response = await apiClient.put("/payments/order/payment-status", {
        orderId,
        paymentStatus,
      });
      return response.data;
    },

    updatePaymentStatus: async (paymentId, paymentStatus) => {
      const response = await apiClient.put("/payments/payment/status", {
        paymentId,
        paymentStatus,
      });
      return response.data;
    },

    createShipping: async (shippingData) => {
      const response = await apiClient.post("/payments/shipping", shippingData);
      return response.data;
    },

    getOrderStatus: async (orderId) => {
      const response = await apiClient.get(`/payments/order-status/${orderId}`);
      return response.data;
    },

    getUserOrders: async () => {
      const response = await apiClient.get("/payments/user/orders");
      return response.data;
    },
  },

  // Stripe Payment Methods
  stripe: {
    createPaymentIntent: async (
      orderId,
      currency = "usd",
      customerId = null
    ) => {
      const response = await apiClient.post("/payments/stripe/payment-intent", {
        orderId,
        currency,
        customerId,
      });
      return response.data;
    },

    createCustomer: async (customerData) => {
      const response = await apiClient.post(
        "/payments/stripe/customer",
        customerData
      );
      return response.data;
    },

    confirmPayment: async (paymentIntentId, paymentMethodId) => {
      const response = await apiClient.post(
        "/payments/stripe/confirm-payment",
        {
          paymentIntentId,
          paymentMethodId,
        }
      );
      return response.data;
    },

    createRefund: async (
      paymentIntentId,
      amount = null,
      reason = "requested_by_customer"
    ) => {
      const response = await apiClient.post("/payments/stripe/refund", {
        paymentIntentId,
        amount,
        reason,
      });
      return response.data;
    },

    getPaymentDetails: async (paymentIntentId) => {
      const response = await apiClient.get(
        `/payments/stripe/payment/${paymentIntentId}`
      );
      return response.data;
    },

    createSetupIntent: async (customerId) => {
      const response = await apiClient.post("/payments/stripe/setup-intent", {
        customerId,
      });
      return response.data;
    },

    getCustomerPaymentMethods: async (customerId) => {
      const response = await apiClient.get(
        `/payments/stripe/customer/${customerId}/payment-methods`
      );
      return response.data;
    },

    savePaymentMethod: async (customerId, paymentMethodId) => {
      const response = await apiClient.post(
        "/payments/stripe/save-payment-method",
        {
          customerId,
          paymentMethodId,
        }
      );
      return response.data;
    },

    removePaymentMethod: async (paymentMethodId) => {
      const response = await apiClient.delete(
        `/payments/stripe/payment-method/${paymentMethodId}`
      );
      return response.data;
    },

    createSubscription: async (customerId, priceId, metadata = {}) => {
      const response = await apiClient.post("/payments/stripe/subscription", {
        customerId,
        priceId,
        metadata,
      });
      return response.data;
    },

    cancelSubscription: async (subscriptionId) => {
      const response = await apiClient.delete(
        `/payments/stripe/subscription/${subscriptionId}`
      );
      return response.data;
    },

    getSubscriptions: async (customerId) => {
      const response = await apiClient.get(
        `/payments/stripe/customer/${customerId}/subscriptions`
      );
      return response.data;
    },

    updateSubscription: async (subscriptionId, updateData) => {
      const response = await apiClient.put(
        `/payments/stripe/subscription/${subscriptionId}`,
        updateData
      );
      return response.data;
    },

    getInvoices: async (customerId) => {
      const response = await apiClient.get(
        `/payments/stripe/customer/${customerId}/invoices`
      );
      return response.data;
    },

    downloadInvoice: async (invoiceId) => {
      const response = await apiClient.get(
        `/payments/stripe/invoice/${invoiceId}/download`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    },
  },

  // Tax Management
  tax: {
    getAllTaxRates: async (params = {}) => {
      const response = await apiClient.get("/tax", { params });
      return response.data;
    },

    getTaxRateById: async (id) => {
      const response = await apiClient.get(`/tax/${id}`);
      return response.data;
    },

    createTaxRate: async (taxData) => {
      const response = await apiClient.post("/tax", taxData);
      return response.data;
    },

    updateTaxRate: async (id, taxData) => {
      const response = await apiClient.put(`/tax/${id}`, taxData);
      return response.data;
    },

    deleteTaxRate: async (id) => {
      const response = await apiClient.delete(`/tax/${id}`);
      return response.data;
    },

    calculateTax: async (calculationData) => {
      const response = await apiClient.post("/tax/calculate", calculationData);
      return response.data;
    },

    getTaxByLocation: async (location) => {
      const response = await apiClient.get("/tax/location", {
        params: { location },
      });
      return response.data;
    },

    getTaxExemptions: async () => {
      const response = await apiClient.get("/tax/exemptions");
      return response.data;
    },

    applyTaxExemption: async (customerId, exemptionData) => {
      const response = await apiClient.post(
        `/tax/customer/${customerId}/exemption`,
        exemptionData
      );
      return response.data;
    },

    validateTaxId: async (taxId, country) => {
      const response = await apiClient.post("/tax/validate", {
        taxId,
        country,
      });
      return response.data;
    },
  },

  // Transaction Management
  transactions: {
    getAllTransactions: async (params = {}) => {
      // Note: Backend currently uses /transactionRoutes but should be /transactions
      const response = await apiClient.get("/transactionRoutes", { params });
      return response.data;
    },

    getTransactionById: async (id) => {
      const response = await apiClient.get(`/transactionRoutes/${id}`);
      return response.data;
    },

    createTransaction: async (transactionData) => {
      const response = await apiClient.post(
        "/transactionRoutes",
        transactionData
      );
      return response.data;
    },

    updateTransaction: async (id, transactionData) => {
      const response = await apiClient.put(
        `/transactionRoutes/${id}`,
        transactionData
      );
      return response.data;
    },

    getTransactionHistory: async (customerId, params = {}) => {
      const response = await apiClient.get(
        `/transactionRoutes/customer/${customerId}`,
        { params }
      );
      return response.data;
    },

    getTransactionsByOrder: async (orderId) => {
      const response = await apiClient.get(
        `/transactionRoutes/order/${orderId}`
      );
      return response.data;
    },

    refundTransaction: async (transactionId, refundData) => {
      const response = await apiClient.post(
        `/transactionRoutes/${transactionId}/refund`,
        refundData
      );
      return response.data;
    },

    voidTransaction: async (transactionId) => {
      const response = await apiClient.post(
        `/transactionRoutes/${transactionId}/void`
      );
      return response.data;
    },

    getTransactionReport: async (startDate, endDate, filters = {}) => {
      const response = await apiClient.get("/transactionRoutes/report", {
        params: { startDate, endDate, ...filters },
      });
      return response.data;
    },

    exportTransactions: async (startDate, endDate, format = "csv") => {
      const response = await apiClient.get("/transactionRoutes/export", {
        params: { startDate, endDate, format },
        responseType: "blob",
      });
      return response.data;
    },

    reconcileTransactions: async (reconciliationData) => {
      const response = await apiClient.post(
        "/transactionRoutes/reconcile",
        reconciliationData
      );
      return response.data;
    },
  },

  // Payment Gateway Management
  gateways: {
    getAvailableGateways: async () => {
      const response = await apiClient.get("/payments/gateways");
      return response.data;
    },

    configureGateway: async (gatewayId, config) => {
      const response = await apiClient.put(
        `/payments/gateways/${gatewayId}`,
        config
      );
      return response.data;
    },

    testGatewayConnection: async (gatewayId) => {
      const response = await apiClient.post(
        `/payments/gateways/${gatewayId}/test`
      );
      return response.data;
    },

    getGatewayStatus: async (gatewayId) => {
      const response = await apiClient.get(
        `/payments/gateways/${gatewayId}/status`
      );
      return response.data;
    },

    enableGateway: async (gatewayId) => {
      const response = await apiClient.patch(
        `/payments/gateways/${gatewayId}/enable`
      );
      return response.data;
    },

    disableGateway: async (gatewayId) => {
      const response = await apiClient.patch(
        `/payments/gateways/${gatewayId}/disable`
      );
      return response.data;
    },
  },

  // Wallet and Saved Payment Methods
  wallet: {
    getWallet: async () => {
      const response = await apiClient.get("/payments/wallet");
      return response.data;
    },

    addFunds: async (amount, paymentMethodId) => {
      const response = await apiClient.post("/payments/wallet/add-funds", {
        amount,
        paymentMethodId,
      });
      return response.data;
    },

    withdrawFunds: async (amount, accountDetails) => {
      const response = await apiClient.post("/payments/wallet/withdraw", {
        amount,
        accountDetails,
      });
      return response.data;
    },

    getWalletHistory: async (params = {}) => {
      const response = await apiClient.get("/payments/wallet/history", {
        params,
      });
      return response.data;
    },

    transferFunds: async (recipientId, amount, note = "") => {
      const response = await apiClient.post("/payments/wallet/transfer", {
        recipientId,
        amount,
        note,
      });
      return response.data;
    },
  },

  // Payment Analytics
  analytics: {
    getPaymentStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/payments/analytics/stats", {
        params: { timeRange },
      });
      return response.data;
    },

    getPaymentTrends: async (timeRange = "30d") => {
      const response = await apiClient.get("/payments/analytics/trends", {
        params: { timeRange },
      });
      return response.data;
    },

    getFailureAnalysis: async (timeRange = "30d") => {
      const response = await apiClient.get("/payments/analytics/failures", {
        params: { timeRange },
      });
      return response.data;
    },

    getRevenueReport: async (startDate, endDate, groupBy = "day") => {
      const response = await apiClient.get("/payments/analytics/revenue", {
        params: { startDate, endDate, groupBy },
      });
      return response.data;
    },

    getPaymentMethodBreakdown: async (timeRange = "30d") => {
      const response = await apiClient.get(
        "/payments/analytics/payment-methods",
        {
          params: { timeRange },
        }
      );
      return response.data;
    },

    getChargebackReport: async (timeRange = "30d") => {
      const response = await apiClient.get("/payments/analytics/chargebacks", {
        params: { timeRange },
      });
      return response.data;
    },
  },

  // Security and Fraud Prevention
  security: {
    flagSuspiciousTransaction: async (transactionId, reason) => {
      const response = await apiClient.post(
        `/payments/security/flag/${transactionId}`,
        {
          reason,
        }
      );
      return response.data;
    },

    reviewFlaggedTransactions: async (params = {}) => {
      const response = await apiClient.get("/payments/security/flagged", {
        params,
      });
      return response.data;
    },

    approveFlaggedTransaction: async (transactionId) => {
      const response = await apiClient.patch(
        `/payments/security/approve/${transactionId}`
      );
      return response.data;
    },

    rejectFlaggedTransaction: async (transactionId, reason) => {
      const response = await apiClient.patch(
        `/payments/security/reject/${transactionId}`,
        {
          reason,
        }
      );
      return response.data;
    },

    getRiskScore: async (transactionData) => {
      const response = await apiClient.post(
        "/payments/security/risk-score",
        transactionData
      );
      return response.data;
    },

    updateFraudRules: async (rules) => {
      const response = await apiClient.put("/payments/security/fraud-rules", {
        rules,
      });
      return response.data;
    },

    getFraudRules: async () => {
      const response = await apiClient.get("/payments/security/fraud-rules");
      return response.data;
    },
  },
};

export default paymentService;
