const express = require("express");
const router = express.Router();

// Authentication middleware
const protect = require("../../middlewares/auth.middleware");

// Wishlist controllers
const {
  addProductToWishlist,
  getUserWishlist,
  removeProductFromWishlist,
  clearUserWishlist
} = require("./wishlist.controller");

// All wishlist routes require login
router.use(protect);

// Get user's wishlist
router.get("/", getUserWishlist);

// Add product to wishlist
router.post("/:productId", addProductToWishlist);

// Remove a particular product
router.delete("/:productId", removeProductFromWishlist);

// Clear entire wishlist
router.delete("/", clearUserWishlist);

module.exports = router;