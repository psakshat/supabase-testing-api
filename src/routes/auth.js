const express = require("express");
const router = express.Router();

// This import must match exactly the exports from your controller file
const {
  register,
  login,
  refreshToken,
} = require("../controllers/authController.js");

// Use those functions in routes
router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refreshToken);

module.exports = router;
