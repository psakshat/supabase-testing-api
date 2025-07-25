import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import { uploadFile } from "../controllers/uploadController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(auth);

router.post("/", upload.single("file"), uploadFile);

export default router;
