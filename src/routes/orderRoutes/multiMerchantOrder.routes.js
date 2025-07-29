import { Router } from 'express';
import {
  // Customer endpoints
  createOrderFromCart,
  getCustomerOrders,
  getOrderDetails,
  trackOrder,
  
  // Merchant endpoints
  getMerchantOrders,
  updateSubOrderStatus,
  addTrackingInfo,
  getMerchantOrderStats,
  getMerchantDashboard,
  
  // Admin endpoints
  getAllOrders,
  getOrderAnalytics
} from '../../controllers/orderController/multiMerchantOrder.controllers.js';

import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { roleMiddleware } from '../../middlewares/roleMiddleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// ==================== CUSTOMER ROUTES ====================

/**
 * Customer order management
 */
// Create order from cart
router.post('/create', roleMiddleware(['customer']), createOrderFromCart);

// Get customer's orders
router.get('/my-orders', roleMiddleware(['customer']), getCustomerOrders);

// Get specific order details
router.get('/:orderId/details', roleMiddleware(['customer']), getOrderDetails);

// Track order by order number
router.get('/track/:orderNumber', roleMiddleware(['customer']), trackOrder);

// ==================== MERCHANT ROUTES ====================

/**
 * Merchant order management
 */
// Get merchant's orders
router.get('/merchant/orders', roleMiddleware(['merchant']), getMerchantOrders);

// Get merchant's order statistics
router.get('/merchant/stats', roleMiddleware(['merchant']), getMerchantOrderStats);

// Get merchant dashboard
router.get('/merchant/dashboard', roleMiddleware(['merchant']), getMerchantDashboard);

// Update sub-order status
router.put('/:orderId/sub-order/:subOrderId/status', 
  roleMiddleware(['merchant']), 
  updateSubOrderStatus
);

// Add tracking information to sub-order
router.put('/:orderId/sub-order/:subOrderId/tracking', 
  roleMiddleware(['merchant']), 
  addTrackingInfo
);

// ==================== ADMIN ROUTES ====================

/**
 * Admin order management
 */
// Get all orders (admin view)
router.get('/admin/all', 
  roleMiddleware(['admin', 'super-admin']), 
  getAllOrders
);

// Get order analytics
router.get('/admin/analytics', 
  roleMiddleware(['admin', 'super-admin']), 
  getOrderAnalytics
);

// Admin can access any merchant's orders
router.get('/admin/merchant/:merchantId/orders', 
  roleMiddleware(['admin', 'super-admin']), 
  getMerchantOrders
);

// Admin can access any merchant's stats
router.get('/admin/merchant/:merchantId/stats', 
  roleMiddleware(['admin', 'super-admin']), 
  getMerchantOrderStats
);

export default router;
