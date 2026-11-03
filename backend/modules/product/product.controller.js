const productService = require("./product.service");
const mongoose = require("mongoose");
// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
    try {

        const result = await productService.getAllProducts(req.query);

        return res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            ...result
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET SINGLE PRODUCT
const getProductById = async (req, res) => {
    try {

        const product = await productService.getProductById(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// GET FEATURED PRODUCTS
const getFeaturedProducts = async (req, res) => {
    try {

        const products = await productService.getFeaturedProducts();

        return res.status(200).json({
            success: true,
            message: "Featured products fetched successfully",
            products
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET LATEST PRODUCTS
const getLatestProducts = async (req, res) => {
    try {

        const products = await productService.getLatestProducts();

        return res.status(200).json({
            success: true,
            message: "Latest products fetched successfully",
            products
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
// ADD PRODUCT
const createProduct = async (req, res) => {

    try {

        const product = await productService.createProduct(req.body);

        return res.status(201).json({
            success: true,
            message: "Product added successfully",
            product
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });

    }
};


// UPDATE PRODUCT
const editProduct = async (req, res) => {
  try {
    const product = await productService.updateProduct(
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product,
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};


// DELETE PRODUCT
const removeProduct = async (req, res) => {
  try {
    await productService.deleteProduct(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
    getAllProducts,
    getProductById,
    getFeaturedProducts,
    getLatestProducts,
    createProduct,
    editProduct,
    removeProduct
};