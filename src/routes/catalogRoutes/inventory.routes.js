import express from "express";
import {
  createOrUpdateInventory,
  getInventoryByProductId,
  getAllInventories,
  updateInventoryByProductId,
  deleteInventoryByProductId,
} from "../../controllers/catalogController/inventory.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = express.Router();

// Create or update inventory
router.post(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Create or update inventory"),
  checkRole(["super-admin", "admin"]),
  createOrUpdateInventory
);

// Get inventory for a specific product
router.get(
  "/:productId",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Get inventory by product ID"),
  checkRole(["super-admin", "admin"]),
  getInventoryByProductId
);

// Get all inventories
router.get(
  "/",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Get All Inventories"),
  checkRole(["super-admin", "admin"]),
  getAllInventories
);

// Update inventory by product ID
router.put(
  "/:productId",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Update inventory by product ID"),
  checkRole(["super-admin", "admin"]),
  updateInventoryByProductId
);

// Delete inventory by product ID
router.delete(
  "/:productId",
  authenticateAdmin,
  adminRateLimiter,
  logAction("Delete inventory by product ID"),
  checkRole(["super-admin", "admin"]),
  deleteInventoryByProductId
);

export default router;
