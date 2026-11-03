const express = require("express");
const router = express.Router();

// Authentication middleware
const protect = require("../../middlewares/auth.middleware");

// Cart controllers
const {
  addProductToCart,
  getUserCart,
  updateProductQuantity,
  removeProductFromCart,
  clearUserCart
} = require("./cart.controller");

// All cart routes require authentication
router.use(protect);

// Get user's cart
router.get("/", getUserCart);

// Add product to cart
router.post("/:productId", addProductToCart);

// Update product quantity
router.put("/:productId", updateProductQuantity);

// Remove a particular product
router.delete("/:productId", removeProductFromCart);

// Clear entire cart
router.delete("/", clearUserCart);

module.exports = router;