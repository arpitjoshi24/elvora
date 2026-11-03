const express = require("express");
const router = express.Router();

// Middlewares
const protect = require("../../../middlewares/auth.middleware");
const adminOnly = require("../../../middlewares/admin.middleware");

// Order controllers
const {
  getAllOrdersAdmin,
  changeOrderStatus
} = require("../../orders/orders.controller");

// All routes require ADMIN authentication
router.use(protect, adminOnly);

// Get all customer orders
router.get("/", getAllOrdersAdmin);

// Update order status
router.patch("/:orderId/status", changeOrderStatus);

module.exports = router;