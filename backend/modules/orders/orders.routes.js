const express = require("express");
const router = express.Router();

// Authentication middleware
const protect = require("../../middlewares/auth.middleware");

// Order controllers
const {
  placeOrder,
  getUserOrders,
  getSingleOrder,
  cancelUserOrder
} = require("./orders.controller");

// All customer order routes require authentication
router.use(protect);

// Place a new order
router.post("/", placeOrder);

// Get all orders of logged-in user
router.get("/", getUserOrders);

// Get a particular order
router.get("/:orderId", getSingleOrder);

// Cancel an order
router.patch("/:orderId/cancel", cancelUserOrder);

module.exports = router;