import express from "express";
import {
  getPurchases,
  getPurchaseById,
  createPurchase,
  deletePurchase,
} from "../controllers/purchasesController.js";

const router = express.Router();

router.get("/", getPurchases);
router.get("/:id", getPurchaseById);
router.post("/", createPurchase);
router.delete("/:id", deletePurchase);

export default router;
