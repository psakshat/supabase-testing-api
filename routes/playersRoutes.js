import express from "express";
import {
  getPlayerProfile,
  updatePlayerProfile,
} from "../controllers/playersController.js";

const router = express.Router();

router.get("/me", getPlayerProfile);
router.put("/me", updatePlayerProfile);

export default router;
