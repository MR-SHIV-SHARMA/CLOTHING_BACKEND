import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { trackAnalytics } from "./middlewares/analytics.middleware.js";

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

app.use(trackAnalytics); // Use the analytics middleware globally

// admin block
import authRoutes from "./routes/adminRoutes/auth.routes.js";
import brandRoutes from "./routes/adminRoutes/brand.routes.js";
import adminRoutes from "./routes/adminRoutes/admin.routes.js";
import contentRoutes from "./routes/adminRoutes/content.routes.js";
import categoryRoutes from "./routes/adminRoutes/category.routes.js";
import activityRoutes from "./routes/adminRoutes/activity.routes.js";
import superAdminRoutes from "./routes/adminRoutes/superAdmin.routes.js";

import userRouter from "./routes/userRoutes/user.routes.js";
import cartRoutes from "./routes/orderRoutes/cart.routes.js";
import orderRoutes from "./routes/orderRoutes/order.routes.js";
import bannerRoutes from "./routes/adminRoutes/banner.routes.js";
import refundRoutes from "./routes/orderRoutes/refund.routes.js";
import addressRoutes from "./routes/userRoutes/address.routes.js";
import reviewRoutes from "./routes/catalogRoutes/review.routes.js";
import couponRoutes from "./routes/marketingRoutes/coupon.routes.js";
import productRoutes from "./routes/catalogRoutes/product.routes.js";
import paymentRoutes from "./routes/paymentRoutes/payment.routes.js";
import shippingRoutes from "./routes/orderRoutes/shipping.routes.js";
import auditLogRoutes from "./routes/systemRoutes/auditLog.routes.js";
import wishlistRoutes from "./routes/catalogRoutes/wishlist.routes.js";
import analyticsRoutes from "./routes/systemRoutes/analytics.routes.js";
import inventoryRoutes from "./routes/catalogRoutes/inventory.routes.js";
import notificationRoutes from "./routes/systemRoutes/notification.routes.js";

import faqRoutes from "./routes/systemRoutes/faq.routes.js";
import taxRoutes from "./routes/paymentRoutes/tax.routes.js";
import feedbackRoutes from "./routes/userRoutes/feedback.routes.js";
import bulkOrderRoutes from "./routes/orderRoutes/bulkOrder.routes.js";
import transactionRoutes from "./routes/paymentRoutes/transaction.routes.js";
import seoMetadataRoutes from "./routes/marketingRoutes/seoMetadata.routes.js";
import advertisementRoutes from "./routes/marketingRoutes/advertisement.routes.js";

// admin block
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/content", contentRoutes);
app.use("/api/v1/activity", activityRoutes);
app.use("/api/v1/brands", brandRoutes);
app.use("/api/v1/super-admin", superAdminRoutes);
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

app.use("/api/v1/tax", taxRoutes);
app.use("/api/v1/faq-data", faqRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/bulk-orders", bulkOrderRoutes);
app.use("/api/v1/seo-metadata", seoMetadataRoutes);
app.use("/api/v1/advertisements", advertisementRoutes);
app.use("/api/v1/transactionRoutes", transactionRoutes);

export { app };
