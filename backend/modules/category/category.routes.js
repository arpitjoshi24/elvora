const express = require("express");
const router = express.Router();

const {
    getAllCategories,
    getCategoryById,
    getCategoryProducts
} = require("./category.controller");

router.get("/", getAllCategories);

router.get("/:id/products", getCategoryProducts);

router.get("/:id", getCategoryById);

module.exports = router;