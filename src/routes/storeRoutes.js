const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { authenticateToken } = require("../middleware/auth");

// Store Items
router.post("/store-item", authenticateToken, storeController.createStoreItem); // Create
router.put(
  "/store-item/:id",
  authenticateToken,
  storeController.updateStoreItem
); // Update
router.get("/store-items", authenticateToken, storeController.getAllStoreItems);

// Purchase
router.post("/buy-store-item", authenticateToken, storeController.buyStoreItem);

module.exports = router;
