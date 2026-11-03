const express = require("express");
const router = express.Router();

const protect = require("../../../middlewares/auth.middleware");
const adminOnly = require("../../../middlewares/admin.middleware");

const {
  createProduct,
  editProduct,
  removeProduct,
} = require("../../product/product.controller");

router.use(protect, adminOnly);

router.post("/", createProduct);

router.put("/:id", editProduct);

router.delete("/:id", removeProduct);

module.exports = router;