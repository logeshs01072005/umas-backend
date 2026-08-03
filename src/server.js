require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/auth.routes");
const productsRoutes = require("./routes/products.routes");
const cartRoutes = require("./routes/cart.routes");
const ordersRoutes = require("./routes/orders.routes");
const paymentRoutes = require("./routes/payment.routes");
const adminRoutes = require("./routes/admin.routes");
const uploadRoutes = require("./routes/upload.routes");
const bannersRoutes = require("./routes/banners.routes");
const settingsRoutes = require("./routes/settings.routes");
const returnsRoutes = require("./routes/returns.routes");
const reviewsRoutes = require("./routes/reviews.routes");
const notificationsRoutes = require("./routes/notifications.routes");

const { notFound, errorHandler } = require("./middleware/errorHandler");
const { connectDB } = require("./config/db");
const path = require("path");

// Connect to MongoDB
connectDB();

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false, // allows images to be loaded by React dev server on different port
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.razorpay.com", "https://*.googleapis.com"],
      scriptSrc: [
        "'self'",
        "https://checkout.razorpay.com",
        "https://cdn.razorpay.com",
        "https://cdnjs.cloudflare.com",
        "blob:",
        "'unsafe-inline'",
      ],
      scriptSrcElem: [
        "'self'",
        "https://checkout.razorpay.com",
        "https://cdn.razorpay.com",
        "https://cdnjs.cloudflare.com",
        "blob:",
        "'unsafe-inline'",
      ],
      connectSrc: [
        "'self'",
        "https://checkout.razorpay.com",
        "https://api.razorpay.com",
        "https://cdn.razorpay.com",
        "https://lumberjack.razorpay.com",
        "https://www.google-analytics.com"
      ],
      frameSrc: ["'self'", "https://api.razorpay.com", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
    },
  },
}));
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true,
}));
app.use(express.json());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Serve static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Serve static frontend build
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// General API rate limit (only in production to avoid blocking local development reloads)
if (process.env.NODE_ENV === "production") {
  app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  }));
}

app.get("/health", (req, res) => res.json({ status: "ok", service: "umas-fashion-boutique-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/banners", bannersRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/returns", returnsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use("/api/notifications", notificationsRoutes);

// SPA routing fallback for React Frontend
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/uploads") || req.path === "/health") {
    return next();
  }
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛍️  Uma's Fashion & Boutique API running on port ${PORT}`);
});