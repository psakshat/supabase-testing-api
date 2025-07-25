const express = require("express");
const router = express.Router();
const skillController = require("../controllers/skillController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { validateRequest } = require("../middleware/validation.js");
const { schemas } = require("../middleware/validation.js");

// Get user skills
router.get("/", authenticateToken, skillController.getSkills);

// Create new skill
router.post(
  "/",
  authenticateToken,
  validateRequest(schemas.createSkill),
  skillController.createSkill
);

// Get skill details
router.get("/:id", authenticateToken, skillController.getSkill);

// Update skill
router.put(
  "/:id",
  authenticateToken,
  validateRequest(schemas.createSkill),
  skillController.updateSkill
);

// Delete skill
router.delete("/:id", authenticateToken, skillController.deleteSkill);

// Get skill statistics
router.get("/:id/stats", authenticateToken, skillController.getSkillStats);

module.exports = router;
