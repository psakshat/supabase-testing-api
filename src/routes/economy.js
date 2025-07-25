const express = require("express");
const router = express.Router();
const economyController = require("../controllers/economyController.js");
const { authenticateToken } = require("../middleware/auth.js");

// Get user balance
router.get("/balance", authenticateToken, economyController.getBalance);

// Purchase gems with real money
router.post(
  "/purchase-gems",
  authenticateToken,
  economyController.purchaseGems
);

// Get transaction history
router.get(
  "/transactions",
  authenticateToken,
  economyController.getTransactions
);

module.exports = router;
