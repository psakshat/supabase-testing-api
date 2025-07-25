const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController.js");
const { authenticateToken } = require("../middleware/auth.js");

// Get dashboard data
router.get(
  "/dashboard",
  authenticateToken,
  analyticsController.getDashboardData
);

// Get XP progression
router.get("/xp-history", authenticateToken, analyticsController.getXpHistory);

// Get completion statistics
router.get(
  "/completion-rates",
  authenticateToken,
  analyticsController.getCompletionRates
);

module.exports = router;
