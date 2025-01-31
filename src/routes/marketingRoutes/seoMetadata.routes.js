import { Router } from "express";
import {
  createSeoMetadata,
  getSeoMetadata,
  updateSeoMetadata,
  deleteSeoMetadata,
  getAllSeoMetadata,
} from "../../controllers/marketingController/seoMetadata.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import { logAction } from "../../middlewares/auditLogMiddleware.js";

const router = Router();

router.use(authenticateAdmin);

// Routes for SEO Metadata CRUD operations and getting all SEO Metadata
router
  .route("/")
  .post(
    checkRole(["admin", "super-admin"]),
    authenticateAdmin,
    adminRateLimiter,
    logAction("Create SEO Metadata"),
    createSeoMetadata
  )
  .get(
    checkRole(["admin", "super-admin"]),
    authenticateAdmin,
    adminRateLimiter,
    logAction("Get All SEO Metadata"),
    getAllSeoMetadata
  );

// Routes for getting, updating, and deleting SEO Metadata by page URL
router
  .route("/:pageUrl")
  .get(
    checkRole(["admin", "super-admin"]),
    adminRateLimiter,
    logAction("Get SEO Metadata by Page URL"),
    authenticateAdmin,
    getSeoMetadata
  )
  .patch(
    checkRole(["admin", "super-admin"]),
    adminRateLimiter,
    logAction("Update SEO Metadata by Page URL"),
    authenticateAdmin,
    updateSeoMetadata
  )
  .delete(
    checkRole(["admin", "super-admin"]),
    adminRateLimiter,
    logAction("Delete SEO Metadata by Page URL"),
    authenticateAdmin,
    deleteSeoMetadata
  );

export default router;
