const express = require("express");
const router = express.Router();

// Authentication middleware
const protect = require("../../middlewares/auth.middleware");

// Address controllers
const {
  createAddress,
  getUserAddresses,
  getSingleAddress,
  editAddress,
  makeDefaultAddress,
  removeAddress
} = require("./address.controller");

// All address routes require authentication
router.use(protect);

// Add new address
router.post("/", createAddress);

// Get all saved addresses
router.get("/", getUserAddresses);

// Get a particular address
router.get("/:addressId", getSingleAddress);

// Update address
router.put("/:addressId", editAddress);

// Set default address
router.patch("/:addressId/default", makeDefaultAddress);

// Delete address
router.delete("/:addressId", removeAddress);

module.exports = router;