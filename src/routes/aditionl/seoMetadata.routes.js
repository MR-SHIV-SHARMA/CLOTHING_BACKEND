import { Router } from "express";
import {
  createSeoMetadata,
  getSeoMetadata,
  updateSeoMetadata,
  deleteSeoMetadata,
  getAllSeoMetadata,
} from "../../controllers/aditionl/seoMetadata.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";

const router = Router();

router.use(authenticateAdmin);

// Routes for SEO Metadata CRUD operations and getting all SEO Metadata
router
  .route("/")
  .post(checkRole(["admin", "super-admin"]), createSeoMetadata)
  .get(checkRole(["admin", "super-admin"]), getAllSeoMetadata);

// Routes for getting, updating, and deleting SEO Metadata by page URL
router
  .route("/:pageUrl")
  .get(getSeoMetadata)
  .patch(checkRole(["admin", "super-admin"]), updateSeoMetadata)
  .delete(checkRole(["admin", "super-admin"]), deleteSeoMetadata);

export default router;
