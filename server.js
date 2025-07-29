// const app = require("./app.js");
// const { PORT } = require("./src/config/environment.js");

// const server = app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
//   console.log(`📱 Habit Tracker API v${process.env.API_VERSION || "1"}`);
//   console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
// });

// // Graceful shutdown
// process.on("SIGTERM", () => {
//   console.log("SIGTERM received. Shutting down gracefully...");
//   server.close(() => {
//     console.log("Process terminated");
//   });
// });

// process.on("SIGINT", () => {
//   console.log("SIGINT received. Shutting down gracefully...");
//   server.close(() => {
//     console.log("Process terminated");
//   });
// });
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { globalErrorHandler } = require("./src/middleware/errorHandler.js");
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({ origin: "*" }));

// Route imports
const authRoutes = require("./src/routes/auth.js");
const userRoutes = require("./src/routes/users.js");
const skillRoutes = require("./src/routes/skills.js");
const taskRoutes = require("./src/routes/tasks.js");
const enemyRoutes = require("./src/routes/enemies.js");
const storeRoutes = require("./src/routes/storeRoutes.js");

// Route usage
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/skills", skillRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/enemies", enemyRoutes);
app.use("/api/v1/store", storeRoutes);

// Base route
app.get("/", (req, res) => {
  res.send("Welcome to the API!");
});

app.use(globalErrorHandler);
// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});
