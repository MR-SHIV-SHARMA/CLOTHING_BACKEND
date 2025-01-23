import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

app.use(express.static("public"));

app.use(cookieParser());

// admin block
import authRoutes from "./routes/admin/auth.routes.js";
import adminRoutes from "./routes/admin/admin.routes.js";
import contentRoutes from "./routes/admin/content.routes.js";
import activityRoutes from "./routes/admin/activity.routes.js";
import superAdminRoutes from "./routes/admin/superAdmin.routes.js";
import brandRoutes from "./routes/admin/brand.routes.js";
import categoryRoutes from "./routes/admin/category.routes.js";

import userRouter from "./routes/user.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";
import reviewRoutes from "./routes/review.routes.js";
import refundRoutes from "./routes/refund.routes.js";
import couponRoutes from "./routes/coupon.routes.js";
import bannerRoutes from "./routes/admin/banner.routes.js";
import productRoutes from "./routes/product.routes.js";
import addressRoutes from "./routes/address.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import shippingRoutes from "./routes/shipping.routes.js";
import auditLogRoutes from "./routes/auditLog.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

// admin block
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/content", contentRoutes);
app.use("/activity", activityRoutes);
app.use("/super-admin", superAdminRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/categories", categoryRoutes);

app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/banners", bannerRoutes);
app.use("/api/v1/refunds", refundRoutes);
app.use("/api/v1/coupons", couponRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/wishlist", wishlistRoutes);
app.use("/api/v1/addresses", addressRoutes);
app.use("/api/v1/shipping", shippingRoutes);
app.use("/api/v1/audit-logs", auditLogRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/inventories", inventoryRoutes);
app.use("/api/v1/notifications", notificationRoutes);

export { app };
