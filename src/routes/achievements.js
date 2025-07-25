const express = require("express");
const router = express.Router();
const achievementController = require("../controllers/achievementController.js");
const { authenticateToken } = require("../middleware/auth.js");

// Get user achievements
router.get("/", authenticateToken, achievementController.getAchievements);

// Get available achievements
router.get(
  "/available",
  authenticateToken,
  achievementController.getAvailableAchievements
);

// Claim achievement rewards
router.post(
  "/:id/claim",
  authenticateToken,
  achievementController.claimAchievement
);

module.exports = router;
