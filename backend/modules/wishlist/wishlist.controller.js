const {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
} = require("./wishlist.service");

const mongoose = require("mongoose");

// 1. Add product to wishlist
const addProductToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const wishlist = await addToWishlist(req.user._id, productId);

    return res.status(200).json({
      success: true,
      message: "Product added to wishlist successfully",
      wishlist
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 2. Get wishlist
const getUserWishlist = async (req, res) => {
  try {
    const wishlist = await getWishlist(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      wishlist
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 3. Remove product from wishlist
const removeProductFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID"
      });
    }

    const wishlist = await removeFromWishlist(
      req.user._id,
      productId
    );

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist successfully",
      wishlist
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 4. Clear wishlist
const clearUserWishlist = async (req, res) => {
  try {
    const wishlist = await clearWishlist(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
      wishlist
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  addProductToWishlist,
  getUserWishlist,
  removeProductFromWishlist,
  clearUserWishlist
};