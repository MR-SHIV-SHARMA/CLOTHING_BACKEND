import { apiClient } from "./api.js";

export const marketingService = {
  // Coupon Management
  coupons: {
    createCoupon: async (couponData) => {
      const response = await apiClient.post("/coupons", couponData);
      return response.data;
    },

    getAllCoupons: async () => {
      const response = await apiClient.get("/coupons");
      return response.data;
    },

    getCouponById: async (id) => {
      const response = await apiClient.get(`/coupons/${id}`);
      return response.data;
    },

    updateCoupon: async (id, couponData) => {
      const response = await apiClient.put(`/coupons/${id}`, couponData);
      return response.data;
    },

    deleteCoupon: async (id) => {
      const response = await apiClient.delete(`/coupons/${id}`);
      return response.data;
    },

    validateCoupon: async (couponCode) => {
      const response = await apiClient.post("/coupons/validate", { code: couponCode });
      return response.data;
    },

    applyCoupon: async (couponCode, orderData) => {
      const response = await apiClient.post("/coupons/apply", { code: couponCode, ...orderData });
      return response.data;
    },
  },

  // Advertisement Management
  advertisements: {
    createAdvertisement: async (adData) => {
      const response = await apiClient.post("/advertisements", adData);
      return response.data;
    },

    getAllAdvertisements: async () => {
      const response = await apiClient.get("/advertisements");
      return response.data;
    },

    getAdvertisementById: async (id) => {
      const response = await apiClient.get(`/advertisements/${id}`);
      return response.data;
    },

    updateAdvertisement: async (id, adData) => {
      const response = await apiClient.put(`/advertisements/${id}`, adData);
      return response.data;
    },

    deleteAdvertisement: async (id) => {
      const response = await apiClient.delete(`/advertisements/${id}`);
      return response.data;
    },

    getActiveAdvertisements: async () => {
      const response = await apiClient.get("/advertisements/active");
      return response.data;
    },

    trackAdClick: async (adId, clickData) => {
      const response = await apiClient.post(`/advertisements/${adId}/click`, clickData);
      return response.data;
    },

    getAdStatistics: async (adId) => {
      const response = await apiClient.get(`/advertisements/${adId}/statistics`);
      return response.data;
    },
  },

  // SEO Management
  seo: {
    createOrUpdateSEO: async (seoData) => {
      const response = await apiClient.post("/seo", seoData);
      return response.data;
    },

    getSEOMetadata: async (pageUrl) => {
      const response = await apiClient.get(`/seo/${pageUrl}`);
      return response.data;
    },

    getAllSEOMetadata: async () => {
      const response = await apiClient.get("/seo");
      return response.data;
    },

    updateSEOMetadata: async (seoId, seoData) => {
      const response = await apiClient.put(`/seo/${seoId}`, seoData);
      return response.data;
    },

    deleteSEOMetadata: async (seoId) => {
      const response = await apiClient.delete(`/seo/${seoId}`);
      return response.data;
    },

    generateSitemap: async () => {
      const response = await apiClient.get("/seo/sitemap.xml");
      return response.data;
    },

    generateRobotsTxt: async () => {
      const response = await apiClient.get("/seo/robots.txt");
      return response.data;
    },

    auditSEO: async (pageUrl) => {
      const response = await apiClient.get(`/seo/audit/${pageUrl}`);
      return response.data;
    },

    bulkUpdateProductSEO: async (updateData) => {
      const response = await apiClient.post("/seo/bulk-update", updateData);
      return response.data;
    },

    getSEOAnalytics: async () => {
      const response = await apiClient.get("/seo/analytics/overview");
      return response.data;
    },

    getSEORecommendations: async () => {
      const response = await apiClient.get("/seo/recommendations");
      return response.data;
    },

    generateStructuredData: async (entityType, entityId) => {
      const response = await apiClient.get(`/seo/structured-data/${entityType}/${entityId}`);
      return response.data;
    },
  },

  // SEO Metadata Management
  seoMetadata: {
    getAllSEOMetadata: async (params = {}) => {
      const response = await apiClient.get("/seo-metadata", { params });
      return response.data;
    },

    getSEOMetadataById: async (id) => {
      const response = await apiClient.get(`/seo-metadata/${id}`);
      return response.data;
    },

    createSEOMetadata: async (metadataData) => {
      const response = await apiClient.post("/seo-metadata", metadataData);
      return response.data;
    },

    updateSEOMetadata: async (id, metadataData) => {
      const response = await apiClient.put(`/seo-metadata/${id}`, metadataData);
      return response.data;
    },

    deleteSEOMetadata: async (id) => {
      const response = await apiClient.delete(`/seo-metadata/${id}`);
      return response.data;
    },

    getSEOMetadataByUrl: async (url) => {
      const response = await apiClient.get(`/seo-metadata/url/${encodeURIComponent(url)}`);
      return response.data;
    },

    generateMetaTags: async (pageData) => {
      const response = await apiClient.post("/seo-metadata/generate-tags", pageData);
      return response.data;
    },
  },

  // Email Marketing
  emailMarketing: {
    createCampaign: async (campaignData) => {
      const response = await apiClient.post("/email-marketing/campaigns", campaignData);
      return response.data;
    },

    getCampaigns: async (params = {}) => {
      const response = await apiClient.get("/email-marketing/campaigns", { params });
      return response.data;
    },

    sendCampaign: async (campaignId) => {
      const response = await apiClient.post(`/email-marketing/campaigns/${campaignId}/send`);
      return response.data;
    },

    getCampaignStats: async (campaignId) => {
      const response = await apiClient.get(`/email-marketing/campaigns/${campaignId}/stats`);
      return response.data;
    },

    subscribeToNewsletter: async (emailData) => {
      const response = await apiClient.post("/email-marketing/subscribe", emailData);
      return response.data;
    },

    unsubscribeFromNewsletter: async (token) => {
      const response = await apiClient.post("/email-marketing/unsubscribe", { token });
      return response.data;
    },
  },

  // Promotional Campaigns
  promotions: {
    createPromotion: async (promotionData) => {
      const response = await apiClient.post("/promotions", promotionData);
      return response.data;
    },

    getPromotions: async (params = {}) => {
      const response = await apiClient.get("/promotions", { params });
      return response.data;
    },

    getActivePromotions: async () => {
      const response = await apiClient.get("/promotions/active");
      return response.data;
    },

    updatePromotion: async (id, promotionData) => {
      const response = await apiClient.put(`/promotions/${id}`, promotionData);
      return response.data;
    },

    deletePromotion: async (id) => {
      const response = await apiClient.delete(`/promotions/${id}`);
      return response.data;
    },

    activatePromotion: async (id) => {
      const response = await apiClient.patch(`/promotions/${id}/activate`);
      return response.data;
    },

    deactivatePromotion: async (id) => {
      const response = await apiClient.patch(`/promotions/${id}/deactivate`);
      return response.data;
    },
  },

  // Social Media Integration
  socialMedia: {
    shareProduct: async (productId, platform, messageData) => {
      const response = await apiClient.post(`/social-media/share/product/${productId}`, {
        platform,
        ...messageData
      });
      return response.data;
    },

    getShareableLink: async (productId, platform) => {
      const response = await apiClient.get(`/social-media/share-link/product/${productId}/${platform}`);
      return response.data;
    },

    trackSocialEngagement: async (engagementData) => {
      const response = await apiClient.post("/social-media/track-engagement", engagementData);
      return response.data;
    },

    getSocialMediaStats: async (timeRange = "30d") => {
      const response = await apiClient.get("/social-media/stats", { 
        params: { timeRange } 
      });
      return response.data;
    },
  },

  // Loyalty Program
  loyalty: {
    createLoyaltyProgram: async (programData) => {
      const response = await apiClient.post("/loyalty/programs", programData);
      return response.data;
    },

    getLoyaltyPrograms: async () => {
      const response = await apiClient.get("/loyalty/programs");
      return response.data;
    },

    enrollUserInProgram: async (programId, userId) => {
      const response = await apiClient.post(`/loyalty/programs/${programId}/enroll`, { userId });
      return response.data;
    },

    getUserLoyaltyPoints: async (userId) => {
      const response = await apiClient.get(`/loyalty/users/${userId}/points`);
      return response.data;
    },

    redeemLoyaltyPoints: async (userId, pointsData) => {
      const response = await apiClient.post(`/loyalty/users/${userId}/redeem`, pointsData);
      return response.data;
    },

    addLoyaltyPoints: async (userId, pointsData) => {
      const response = await apiClient.post(`/loyalty/users/${userId}/add-points`, pointsData);
      return response.data;
    },
  },
};

export default marketingService;
