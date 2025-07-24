import express from "express";
import { signup, signin, refresh } from "../controllers/authController.js";

export default (supabase) => {
  const router = express.Router();

  router.post("/signup", (req, res) => signup(req, res, supabase));
  router.post("/signin", (req, res) => signin(req, res, supabase));
  router.post("/refresh", (req, res) => refresh(req, res, supabase));

  return router;
};
