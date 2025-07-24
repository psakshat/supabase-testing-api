import express from "express";
import {
  getEnemies,
  getEnemyById,
  createEnemy,
  updateEnemy,
  deleteEnemy,
} from "../controllers/enemiesController.js";

const router = express.Router();

router.get("/", getEnemies);
router.get("/:id", getEnemyById);
router.post("/", createEnemy);
router.put("/:id", updateEnemy);
router.delete("/:id", deleteEnemy);

export default router;
