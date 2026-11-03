const {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart
} = require("./cart.service");

const mongoose = require("mongoose");

// 1. Add product to cart
const addProductToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity = 1 } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const cart = await addToCart(
      req.user._id,
      productId,
      quantity
    );

    return res.status(200).json({
      success: true,
      message: "Product added to cart successfully",
      cart
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 2. Get user's cart
const getUserCart = async (req, res) => {
  try {
    const cart = await getCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart fetched successfully",
      cart
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 3. Update product quantity
const updateProductQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive integer"
      });
    }

    const cart = await updateCartQuantity(
      req.user._id,
      productId,
      quantity
    );

    return res.status(200).json({
      success: true,
      message: "Cart quantity updated successfully",
      cart
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 4. Remove product from cart
const removeProductFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const cart = await removeFromCart(
      req.user._id,
      productId
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from cart successfully",
      cart
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 5. Clear entire cart
const clearUserCart = async (req, res) => {
  try {
    const cart = await clearCart(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
      cart
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  addProductToCart,
  getUserCart,
  updateProductQuantity,
  removeProductFromCart,
  clearUserCart
};