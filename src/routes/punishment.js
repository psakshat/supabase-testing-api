const express = require("express");
const router = express.Router();
const punishmentController = require("../controllers/punishmentController.js");
const { authenticateToken } = require("../middleware/auth.js");

// Get punishment status
router.get(
  "/status",
  authenticateToken,
  punishmentController.getPunishmentStatus
);

// Complete punishment
router.post(
  "/complete",
  authenticateToken,
  punishmentController.completePunishment
);

// Verify walking distance
router.post(
  "/verify-distance",
  authenticateToken,
  punishmentController.verifyDistance
);

module.exports = router;
