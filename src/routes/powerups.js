const express = require("express");
const router = express.Router();
const powerupController = require("../controllers/powerupController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { validateRequest } = require("../middleware/validation.js");
const { schemas } = require("../middleware/validation.js");

// Get available power-ups
router.get("/", authenticateToken, powerupController.getPowerUps);

// Create custom power-up
router.post(
  "/",
  authenticateToken,
  validateRequest(schemas.createPowerUp),
  powerupController.createPowerUp
);

// Update power-up
router.put(
  "/:id",
  authenticateToken,
  validateRequest(schemas.createPowerUp),
  powerupController.updatePowerUp
);

// Delete power-up
router.delete("/:id", authenticateToken, powerupController.deletePowerUp);

// Purchase power-up
router.post(
  "/:id/purchase",
  authenticateToken,
  powerupController.purchasePowerUp
);

// Use power-up
router.post("/:id/use", authenticateToken, powerupController.usePowerUp);

module.exports = router;
