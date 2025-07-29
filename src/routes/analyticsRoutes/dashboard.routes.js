import { Router } from 'express';
import {
  getSalesDashboard,
  getSalesComparison,
  getRealTimeMetrics,
  exportSalesData
} from '../../controllers/analyticsController/dashboard.controllers.js';
import {
  getTotalSales,
  getSalesByProduct,
  getSalesByCategory,
  getTopSellingProducts
} from '../../controllers/analyticsController/sales.controllers.js';
import { authMiddleware } from '../../middlewares/authMiddleware.js';
import { roleMiddleware } from '../../middlewares/roleMiddleware.js';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Main dashboard endpoint - comprehensive analytics
router.get('/dashboard', roleMiddleware(['admin', 'super-admin']), getSalesDashboard);

// Basic sales metrics
router.get('/sales/total', roleMiddleware(['admin', 'super-admin']), getTotalSales);
router.get('/sales/by-product', roleMiddleware(['admin', 'super-admin']), getSalesByProduct);
router.get('/sales/by-category', roleMiddleware(['admin', 'super-admin']), getSalesByCategory);
router.get('/sales/top-products', roleMiddleware(['admin', 'super-admin']), getTopSellingProducts);

// Advanced analytics
router.get('/sales/comparison', roleMiddleware(['admin', 'super-admin']), getSalesComparison);
router.get('/sales/realtime', roleMiddleware(['admin', 'super-admin']), getRealTimeMetrics);

// Data export
router.get('/sales/export', roleMiddleware(['admin', 'super-admin']), exportSalesData);

export default router;
