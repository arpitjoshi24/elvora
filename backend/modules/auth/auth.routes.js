const express = require("express");

const router = express.Router();

const {
  register,
  login,
  logoutUser
} = require("./auth.controller");

// Register API
router.post("/register", register);

// Login API
router.post("/login", login);
router.post("/logout", logoutUser);
module.exports = router;