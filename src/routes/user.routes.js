import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middlewares/multer.middlewares.js"; 
import authenticateAdmin from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(authenticateAdmin, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(authenticateAdmin, changeCurrentPassword);
router.route("/current-user").post(authenticateAdmin, getCurrentUser);
router.route("/update-account-details").patch(authenticateAdmin, updateAccountDetails);
router
  .route("/update-user-avatar")
  .patch(authenticateAdmin, upload.single("avatar"), updateUserAvatar);

export default router;
