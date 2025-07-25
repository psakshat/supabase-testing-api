const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController.js");
const { authenticateToken } = require("../middleware/auth.js");
const { validateRequest } = require("../middleware/validation.js");
const { schemas } = require("../middleware/validation.js");

// Get user tasks
router.get("/", authenticateToken, taskController.getTasks);

// Create new task
router.post(
  "/",
  authenticateToken,
  validateRequest(schemas.createTask),
  taskController.createTask
);

// Get task details
router.get("/:id", authenticateToken, taskController.getTask);

// Update task
router.put(
  "/:id",
  authenticateToken,
  validateRequest(schemas.createTask),
  taskController.updateTask
);

// Delete task
router.delete("/:id", authenticateToken, taskController.deleteTask);

// Complete task
router.post("/:id/complete", authenticateToken, taskController.completeTask);

// Get task statistics
router.get("/:id/stats", authenticateToken, taskController.getTaskStats);

// Get tasks for specific date
router.get(
  "/calendar/:date",
  authenticateToken,
  taskController.getTasksForDate
);

module.exports = router;
