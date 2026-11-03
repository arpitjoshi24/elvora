const express = require("express");
const protect = require("../../middlewares/auth.middleware");
const adminOnly = require("../../middlewares/admin.middleware");
const router = express.Router();

const {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getLatestProducts,
    createProduct
} = require("./product.controller");

// All products
router.get("/", getAllProducts);

// Featured products
router.get("/featured", getFeaturedProducts);

// Latest products
router.get("/latest", getLatestProducts);

// Particular product
router.get("/:id", getProductById);
router.post("/", protect, adminOnly, createProduct);

module.exports = router;