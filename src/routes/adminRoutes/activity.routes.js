import express from "express";
import session from "express-session";
import { getActivityLogs } from "../../controllers/adminController/activity.controllers.js";
import { checkRole } from "../../middlewares/roleMiddleware.js";
import { adminRateLimiter } from "../../middlewares/rateLimiter.js";
import authenticateAdmin from "../../middlewares/authMiddleware.js";

const router = express.Router();

router.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true, httpOnly: true },
  })
);

// Get activity logs
router.get(
  "/super-admin/activity-logs",
  adminRateLimiter,
  authenticateAdmin,
  checkRole(["super-admin"]),
  getActivityLogs
);

export default router;
