import express from "express";
import {
  createBulkOrder,
  getAllBulkOrders,
  getBulkOrderById,
  updateBulkOrderById,
  deleteBulkOrderById,
} from "../../controllers/orderController/bulkOrder.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create a new bulk order
router.post(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "customer"]),
  adminRateLimiter,
  logAction("Create A New Bulk Order"),
  createBulkOrder
);

// Get all bulk orders
router.get(
  "/",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  adminRateLimiter,
  logAction("Get All Bulk Orders"),
  getAllBulkOrders
);

// Get a single bulk order by ID
router.get(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  adminRateLimiter,
  logAction("Get A Bulk Order By ID"),
  getBulkOrderById
);

// Update a bulk order by ID
router.put(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  adminRateLimiter,
  logAction("Update A Bulk Order By ID"),
  updateBulkOrderById
);

// Delete a bulk order by ID
router.delete(
  "/:id",
  authenticateAdmin,
  checkRole(["admin", "super-admin", "merchant", "customer"]),
  adminRateLimiter,
  logAction("Delete A Bulk Order By ID"),
  deleteBulkOrderById
);

export default router;
