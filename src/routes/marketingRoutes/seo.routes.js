import { Router } from "express";
import {
  createOrUpdateSEO,
  getSEOMetadata,
  getAllSEOMetadata,
  updateSEOMetadata,
  deleteSEOMetadata,
  generateSitemap,
  generateRobotsTxt,
  auditSEO,
  bulkUpdateProductSEO,
  getSEOAnalytics,
  getSEORecommendations,
  generateStructuredData,
} from "../../controllers/marketingController/seo.controllers.js";
import { verifyJWT } from "../../middlewares/auth.middlewares.js";
import { authorizeRoles } from "../../middlewares/authorize.middlewares.js";

const router = Router();

// Public routes (no authentication required)
/**
 * @route   GET /api/v1/seo/sitemap.xml
 * @desc    Generate XML sitemap
 * @access  Public
 */
router.route("/sitemap.xml").get(generateSitemap);

/**
 * @route   GET /api/v1/seo/robots.txt
 * @desc    Generate robots.txt file
 * @access  Public
 */
router.route("/robots.txt").get(generateRobotsTxt);

// Protected routes - require authentication
router.use(verifyJWT);

/**
 * @route   GET /api/v1/seo/:pageUrl
 * @desc    Get SEO metadata for a specific page
 * @access  Authenticated users
 */
router.route("/:pageUrl").get(getSEOMetadata);

/**
 * @route   GET /api/v1/seo/structured-data/:entityType/:entityId
 * @desc    Generate structured data for specific entity
 * @access  Authenticated users
 */
router.route("/structured-data/:entityType/:entityId").get(generateStructuredData);

// Admin/Manager only routes
router.use(authorizeRoles(["admin", "super_admin", "manager", "marketing_manager"]));

/**
 * @route   POST /api/v1/seo
 * @desc    Create or update SEO metadata
 * @access  Admin/Manager only
 */
router.route("/").post(createOrUpdateSEO);

/**
 * @route   GET /api/v1/seo
 * @desc    Get all SEO metadata with filtering and pagination
 * @access  Admin/Manager only
 */
router.route("/").get(getAllSEOMetadata);

/**
 * @route   PUT /api/v1/seo/:seoId
 * @desc    Update SEO metadata
 * @access  Admin/Manager only
 */
router.route("/:seoId").put(updateSEOMetadata);

/**
 * @route   DELETE /api/v1/seo/:seoId
 * @desc    Delete SEO metadata
 * @access  Admin/Manager only
 */
router.route("/:seoId").delete(deleteSEOMetadata);

/**
 * @route   GET /api/v1/seo/audit/:pageUrl
 * @desc    Audit SEO for a specific page
 * @access  Admin/Manager only
 */
router.route("/audit/:pageUrl").get(auditSEO);

/**
 * @route   POST /api/v1/seo/bulk-update
 * @desc    Bulk update SEO for products
 * @access  Admin/Manager only
 */
router.route("/bulk-update").post(bulkUpdateProductSEO);

/**
 * @route   GET /api/v1/seo/analytics/overview
 * @desc    Get SEO analytics and insights
 * @access  Admin/Manager only
 */
router.route("/analytics/overview").get(getSEOAnalytics);

/**
 * @route   GET /api/v1/seo/recommendations
 * @desc    Get SEO recommendations for improvement
 * @access  Admin/Manager only
 */
router.route("/recommendations").get(getSEORecommendations);

export default router;
