// Central export file for all services
// Import and re-export all service modules

export { default as adminService } from "./adminService.js";
export { default as authService } from "./authService.js";
export { default as catalogService } from "./catalogService.js";
export { default as orderService } from "./orderService.js";
export { default as paymentService } from "./paymentService.js";
export { default as productService } from "./productService.js";
export { default as userService } from "./userService.js";
export { default as marketingService } from "./marketingService.js";
export { default as vendorService } from "./vendorService.js";
export { default as systemService } from "./systemService.js";

// Export combined services object for easier consumption
export const services = {
  admin: adminService,
  auth: authService,
  catalog: catalogService,
  order: orderService,
  payment: paymentService,
  product: productService,
  user: userService,
  marketing: marketingService,
  vendor: vendorService,
  system: systemService,
};

// Export API client for direct use if needed
export { apiClient, tokenUtils } from "./api.js";

// Service categories for easier organization
export const serviceCategories = {
  authentication: ["auth", "admin"],
  ecommerce: ["catalog", "product", "order", "payment"],
  user_management: ["user", "vendor"],
  marketing: ["marketing"],
  system: ["system"],
};

// Service endpoints mapping for documentation
export const serviceEndpoints = {
  // Admin & Authentication
  admin: {
    auth: "/auth/admin/*",
    management: "/admin/*",
    superAdmin: "/super-admin/*",
    brands: "/brands/*",
    categories: "/categories/*",
    content: "/content/*",
    activity: "/activity/*",
    banners: "/banners/*",
  },
  
  auth: {
    users: "/auth/*",
    profile: "/auth/profile",
    addresses: "/auth/addresses/*",
    twoFactor: "/auth/2fa/*",
  },

  // E-commerce Core
  catalog: {
    products: "/product/*",
    inventory: "/inventories/*",
    reviews: "/reviews/*",
    wishlist: "/wishlist/*",
    search: "/search/*",
  },

  order: {
    cart: "/cart/*",
    orders: "/orders/*",
    multiMerchant: "/multi-merchant-orders/*",
    bulkOrders: "/bulk-orders/*",
    shipping: "/shipping/*",
    refunds: "/refunds/*",
  },

  payment: {
    payments: "/payments/*",
    stripe: "/payments/stripe/*",
    tax: "/tax/*",
    transactions: "/transactionRoutes/*", // Note: This needs to be fixed to /transactions/*
  },

  // User Management
  user: {
    users: "/users/*",
    addresses: "/addresses/*",
    feedback: "/feedback/*",
    oauth: "/oauth/*",
  },

  vendor: {
    vendors: "/vendors/*",
    merchants: "/merchants/*",
  },

  // Marketing
  marketing: {
    coupons: "/coupons/*",
    advertisements: "/advertisements/*",
    seo: "/seo/*",
    seoMetadata: "/seo-metadata/*",
  },

  // System
  system: {
    analytics: "/analytics/*",
    auditLogs: "/audit-logs/*",
    faq: "/faq-data/*",
    notifications: "/notifications/*",
    dashboard: "/dashboard/*",
    sales: "/sales/*",
  },
};

export default services;
