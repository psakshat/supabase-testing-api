import express from "express";
import {
  getCompletions,
  getCompletionById,
  createCompletion,
  deleteCompletion,
} from "../controllers/completionsController.js";

const router = express.Router();

router.get("/", getCompletions);
router.get("/:id", getCompletionById);
router.post("/", createCompletion);
router.delete("/:id", deleteCompletion);

export default router;
