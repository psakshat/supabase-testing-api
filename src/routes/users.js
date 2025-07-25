const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController.js");
const { authenticateToken } = require("../middleware/auth.js");

// Get user profile
router.get("/profile", authenticateToken, userController.getProfile);

// Update user profile
router.put("/profile", authenticateToken, userController.updateProfile);

// Get user stats
router.get("/stats", authenticateToken, userController.getStats);

// Upload profile image
// router.post("/upload-avatar", authenticateToken, userController.uploadAvatar);

// Update user settings
// router.put("/settings", authenticateToken, userController.updateSettings);

module.exports = router;
