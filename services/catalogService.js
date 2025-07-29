import { apiClient } from "./api.js";

export const catalogService = {
  // Product Management
  products: {
    getAllProducts: async (params = {}) => {
      const response = await apiClient.get("/product", { params });
      return response.data;
    },

    getProductById: async (id) => {
      const response = await apiClient.get(`/product/${id}`);
      return response.data;
    },

    createProduct: async (productData) => {
      const response = await apiClient.post("/product", productData);
      return response.data;
    },

    updateProduct: async (id, productData) => {
      const response = await apiClient.put(`/product/${id}`, productData);
      return response.data;
    },

    deleteProduct: async (id) => {
      const response = await apiClient.delete(`/product/${id}`);
      return response.data;
    },

    uploadProductImages: async (id, formData) => {
      const response = await apiClient.uploadFile(
        `/product/${id}/images`,
        formData
      );
      return response.data;
    },

    searchProducts: async (query, filters = {}) => {
      const response = await apiClient.get("/product/search", {
        params: { q: query, ...filters },
      });
      return response.data;
    },

    getProductsByCategory: async (categoryId, params = {}) => {
      const response = await apiClient.get(`/product/category/${categoryId}`, {
        params,
      });
      return response.data;
    },

    getProductsByBrand: async (brandId, params = {}) => {
      const response = await apiClient.get(`/product/brand/${brandId}`, {
        params,
      });
      return response.data;
    },

    getFeaturedProducts: async (params = {}) => {
      const response = await apiClient.get("/product/featured", { params });
      return response.data;
    },

    getNewArrivals: async (params = {}) => {
      const response = await apiClient.get("/product/new-arrivals", { params });
      return response.data;
    },

    getBestSellers: async (params = {}) => {
      const response = await apiClient.get("/product/best-sellers", { params });
      return response.data;
    },

    getRelatedProducts: async (productId, params = {}) => {
      const response = await apiClient.get(`/product/${productId}/related`, {
        params,
      });
      return response.data;
    },

    toggleProductStatus: async (id) => {
      const response = await apiClient.patch(`/product/${id}/toggle-status`);
      return response.data;
    },

    bulkUpdateProducts: async (productIds, updateData) => {
      const response = await apiClient.patch("/product/bulk-update", {
        productIds,
        updateData,
      });
      return response.data;
    },

    getProductVariants: async (productId) => {
      const response = await apiClient.get(`/product/${productId}/variants`);
      return response.data;
    },

    addProductVariant: async (productId, variantData) => {
      const response = await apiClient.post(
        `/product/${productId}/variants`,
        variantData
      );
      return response.data;
    },

    updateProductVariant: async (productId, variantId, variantData) => {
      const response = await apiClient.put(
        `/product/${productId}/variants/${variantId}`,
        variantData
      );
      return response.data;
    },

    deleteProductVariant: async (productId, variantId) => {
      const response = await apiClient.delete(
        `/product/${productId}/variants/${variantId}`
      );
      return response.data;
    },
  },

  // Inventory Management
  inventory: {
    getAllInventory: async (params = {}) => {
      const response = await apiClient.get("/inventories", { params });
      return response.data;
    },

    getInventoryById: async (id) => {
      const response = await apiClient.get(`/inventories/${id}`);
      return response.data;
    },

    updateInventory: async (id, inventoryData) => {
      const response = await apiClient.put(`/inventories/${id}`, inventoryData);
      return response.data;
    },

    getProductInventory: async (productId) => {
      const response = await apiClient.get(`/inventories/product/${productId}`);
      return response.data;
    },

    updateProductStock: async (productId, stockData) => {
      const response = await apiClient.patch(
        `/inventories/product/${productId}/stock`,
        stockData
      );
      return response.data;
    },

    getLowStockProducts: async (threshold = 10) => {
      const response = await apiClient.get("/inventories/low-stock", {
        params: { threshold },
      });
      return response.data;
    },

    getOutOfStockProducts: async () => {
      const response = await apiClient.get("/inventories/out-of-stock");
      return response.data;
    },

    bulkUpdateStock: async (updates) => {
      const response = await apiClient.patch("/inventories/bulk-update", {
        updates,
      });
      return response.data;
    },

    trackInventoryMovement: async (productId, movementData) => {
      const response = await apiClient.post(
        `/inventories/product/${productId}/movement`,
        movementData
      );
      return response.data;
    },

    getInventoryHistory: async (productId, params = {}) => {
      const response = await apiClient.get(
        `/inventories/product/${productId}/history`,
        { params }
      );
      return response.data;
    },
  },

  // Review Management
  reviews: {
    getAllReviews: async (params = {}) => {
      const response = await apiClient.get("/reviews", { params });
      return response.data;
    },

    getReviewById: async (id) => {
      const response = await apiClient.get(`/reviews/${id}`);
      return response.data;
    },

    createReview: async (reviewData) => {
      const response = await apiClient.post("/reviews", reviewData);
      return response.data;
    },

    updateReview: async (id, reviewData) => {
      const response = await apiClient.put(`/reviews/${id}`, reviewData);
      return response.data;
    },

    deleteReview: async (id) => {
      const response = await apiClient.delete(`/reviews/${id}`);
      return response.data;
    },

    getProductReviews: async (productId, params = {}) => {
      const response = await apiClient.get(`/reviews/product/${productId}`, {
        params,
      });
      return response.data;
    },

    getUserReviews: async (userId, params = {}) => {
      const response = await apiClient.get(`/reviews/user/${userId}`, {
        params,
      });
      return response.data;
    },

    approveReview: async (id) => {
      const response = await apiClient.patch(`/reviews/${id}/approve`);
      return response.data;
    },

    rejectReview: async (id, reason) => {
      const response = await apiClient.patch(`/reviews/${id}/reject`, {
        reason,
      });
      return response.data;
    },

    flagReview: async (id, reason) => {
      const response = await apiClient.patch(`/reviews/${id}/flag`, { reason });
      return response.data;
    },

    getReviewStatistics: async (productId) => {
      const response = await apiClient.get(
        `/reviews/product/${productId}/stats`
      );
      return response.data;
    },

    reportReview: async (id, reportData) => {
      const response = await apiClient.post(
        `/reviews/${id}/report`,
        reportData
      );
      return response.data;
    },

    replyToReview: async (id, replyData) => {
      const response = await apiClient.post(`/reviews/${id}/reply`, replyData);
      return response.data;
    },

    likeReview: async (id) => {
      const response = await apiClient.post(`/reviews/${id}/like`);
      return response.data;
    },

    unlikeReview: async (id) => {
      const response = await apiClient.delete(`/reviews/${id}/like`);
      return response.data;
    },
  },

  // Wishlist Management
  wishlist: {
    getWishlist: async () => {
      const response = await apiClient.get("/wishlist");
      return response.data;
    },

    addToWishlist: async (productId) => {
      const response = await apiClient.post("/wishlist", { productId });
      return response.data;
    },

    removeFromWishlist: async (productId) => {
      const response = await apiClient.delete(`/wishlist/${productId}`);
      return response.data;
    },

    clearWishlist: async () => {
      const response = await apiClient.delete("/wishlist/clear");
      return response.data;
    },

    checkWishlistItem: async (productId) => {
      const response = await apiClient.get(`/wishlist/check/${productId}`);
      return response.data;
    },

    moveToCart: async (productId, quantity = 1) => {
      const response = await apiClient.post(
        `/wishlist/${productId}/move-to-cart`,
        { quantity }
      );
      return response.data;
    },

    shareWishlist: async (recipientEmail) => {
      const response = await apiClient.post("/wishlist/share", {
        recipientEmail,
      });
      return response.data;
    },

    getWishlistStats: async () => {
      const response = await apiClient.get("/wishlist/stats");
      return response.data;
    },
  },

  // Search and Filters
  search: {
    globalSearch: async (query, filters = {}) => {
      const response = await apiClient.get("/search", {
        params: { q: query, ...filters },
      });
      return response.data;
    },

    getSearchSuggestions: async (query) => {
      const response = await apiClient.get("/search/suggestions", {
        params: { q: query },
      });
      return response.data;
    },

    getPopularSearches: async () => {
      const response = await apiClient.get("/search/popular");
      return response.data;
    },

    saveSearchQuery: async (query) => {
      const response = await apiClient.post("/search/save", { query });
      return response.data;
    },

    getSearchHistory: async () => {
      const response = await apiClient.get("/search/history");
      return response.data;
    },

    clearSearchHistory: async () => {
      const response = await apiClient.delete("/search/history");
      return response.data;
    },

    getFilters: async (category = null) => {
      const response = await apiClient.get("/search/filters", {
        params: category ? { category } : {},
      });
      return response.data;
    },

    getFilterOptions: async (filterType, category = null) => {
      const response = await apiClient.get(`/search/filters/${filterType}`, {
        params: category ? { category } : {},
      });
      return response.data;
    },
  },
};

export default catalogService;
