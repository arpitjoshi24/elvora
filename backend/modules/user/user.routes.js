const express = require("express");
const router = express.Router();

const protect = require("../../middlewares/auth.middleware");

const {
    getProfile,
    updateProfile
} = require("./user.controller");

// Get profile
router.get("/profile", protect, getProfile);

// Update profile
router.put("/profile", protect, updateProfile);

module.exports = router;