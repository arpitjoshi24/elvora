const express = require("express");
const router = express.Router();

// Middlewares
const protect = require("../../../middlewares/auth.middleware");
const adminOnly = require("../../../middlewares/admin.middleware");

// Category Controllers
const {
  createCategory,
  getAdminCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
  deleteCategory
} = require("../../category/category.controller");

// All routes below require ADMIN authentication
router.use(protect, adminOnly);

// Create a new category
router.post("/", createCategory);

// Get all categories (including inactive)
router.get("/", getAdminCategories);

// Get a single category by ID
router.get("/:id", getCategoryById);

// Update category details
router.put("/:id", updateCategory);

// Activate or deactivate category
router.patch("/:id/status", updateCategoryStatus);

// Delete category
router.delete("/:id", deleteCategory);

module.exports = router;