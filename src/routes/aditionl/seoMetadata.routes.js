import { Router } from "express";
import {
  createSeoMetadata,
  getSeoMetadata,
  updateSeoMetadata,
  deleteSeoMetadata,
} from "../../controllers/aditionl/seoMetadata.controllers.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";

const router = Router();

router.use(authenticateAdmin);

router.route("/").post(checkRole("admin", "superadmin"), createSeoMetadata);

router
  .route("/:pageUrl")
  .get(getSeoMetadata)
  .patch(checkRole("admin", "superadmin"), updateSeoMetadata)
  .delete(checkRole("admin", "superadmin"), deleteSeoMetadata);

export default router;
