const express = require("express");
const router = express.Router();
const enemyController = require("../controllers/enemyController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { validateRequest } = require("../middleware/validation.js");
const { schemas } = require("../middleware/validation.js");

// Get user enemies
router.get("/", authenticateToken, enemyController.getEnemies);

// Create new enemy
router.post(
  "/",
  authenticateToken,
  validateRequest(schemas.createEnemy),
  enemyController.createEnemy
);

// Get enemy details
router.get("/:id", authenticateToken, enemyController.getEnemy);

// Update enemy
router.put(
  "/:id",
  authenticateToken,
  validateRequest(schemas.createEnemy),
  enemyController.updateEnemy
);

// Delete enemy
router.delete("/:id", authenticateToken, enemyController.deleteEnemy);

// Trigger bad habit
router.post("/:id/trigger", authenticateToken, enemyController.triggerEnemy);

// Get enemy statistics
router.get("/:id/stats", authenticateToken, enemyController.getEnemyStats);

module.exports = router;
