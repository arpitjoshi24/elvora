const express = require("express");
const router = express.Router();

const {
    getAllUsers,
    getUserById,
    deleteUser
} = require("./adminUser.controller");

// Import protect directly (without destructuring)
const protect = require("../../../middlewares/auth.middleware");

// Check whether the logged-in user is an admin
const adminOnly = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only."
        });
    }

    next();
};

// GET ALL USERS
router.get("/users", protect, adminOnly, getAllUsers);

// GET USER BY ID
router.get("/users/:id", protect, adminOnly, getUserById);

// DELETE USER
router.delete("/users/:id", protect, adminOnly, deleteUser);

module.exports = router;