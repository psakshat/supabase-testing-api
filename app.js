import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

import skillsRoutes from "./routes/skillsRoutes.js";
import tasksRoutes from "./routes/tasksRoutes.js";
import enemiesRoutes from "./routes/enemiesRoutes.js";
import completionsRoutes from "./routes/completionsRoutes.js";
import purchasesRoutes from "./routes/purchasesRoutes.js";
import playersRoutes from "./routes/playersRoutes.js";
import authRoutes from "./routes/auth.js";
import { authMiddleware } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express();
app.use(express.json());

// Initialize Supabase client once and pass it around if needed
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Public routes - no auth middleware
app.use("/api/v1/auth", authRoutes(supabase));

// Auth middleware applied only to routes that require auth
app.use(authMiddleware);

app.use("/api/v1/skills", skillsRoutes);
app.use("/api/v1/tasks", tasksRoutes);
app.use("/api/v1/enemies", enemiesRoutes);
app.use("/api/v1/completions", completionsRoutes);
app.use("/api/v1/purchases", purchasesRoutes);
app.use("/api/v1/players", playersRoutes);

// Default route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Gamified Backend API" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
