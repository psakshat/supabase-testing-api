// const express = require("express");
// const helmet = require("helmet");
// const cors = require("cors");
// const rateLimit = require("express-rate-limit");
// require("dotenv").config();

// // Import middleware
// const errorHandler = require("./src/middleware/errorHandler.js");
// const logger = require("./src/middleware/logger.js");

// // Import routes
// const authRoutes = require("./src/routes/auth.js");
// const userRoutes = require("./src/routes/users");
// const skillRoutes = require("./src/routes/skills");
// const taskRoutes = require("./src/routes/tasks");
// const enemyRoutes = require("./src/routes/enemies");
// const powerupRoutes = require("./src/routes/powerups");
// const achievementRoutes = require("./src/routes/achievements");
// const economyRoutes = require("./src/routes/economy");
// const punishmentRoutes = require("./src/routes/punishment");
// const analyticsRoutes = require("./src/routes/analytics");

// const app = express();

// // Security middleware
// app.use(helmet());
// app.use(
//   cors({
//     origin: ["http://localhost:3000", "http://localhost:19006"],
//     credentials: true,
//   })
// );

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use(limiter);

// // Body parsing middleware
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true }));

// // Logging middleware
// app.use(logger);

// // Health check
// app.get("/health", (req, res) => {
//   res.json({
//     status: "OK",
//     timestamp: new Date().toISOString(),
//     version: process.env.API_VERSION || "1.0.0",
//   });
// });

// // API routes
// // const API_PREFIX = `/api/v1${process.env.API_VERSION || "v1"}`;

// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/users", userRoutes);
// app.use("/api/v1/skills", skillRoutes);
// app.use("/api/v1/tasks", taskRoutes);
// app.use("/api/v1/enemies", enemyRoutes);
// app.use("/api/v1/powerups", powerupRoutes);
// app.use("/api/v1/achievements", achievementRoutes);
// app.use("/api/v1/economy", economyRoutes);
// app.use("/api/v1/punishment", punishmentRoutes);
// app.use("/api/v1/analytics", analyticsRoutes);

// // 404 handler
// app.use("*", (req, res) => {
//   res.status(404).json({
//     error: "Route not found",
//     path: req.originalUrl,
//   });
// });

// // Global error handler
// app.use(errorHandler);

// module.exports = app;
