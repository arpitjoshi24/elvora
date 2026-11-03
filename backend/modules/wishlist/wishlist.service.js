const Wishlist = require("../../models/wishlist.model");
const Product = require("../../models/product.model");

// 1. Add product to wishlist
const addToWishlist = async (userId, productId) => {
  // Check whether product exists and is active
  const product = await Product.findOne({
    _id: productId,
    isActive: true
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Find user's wishlist or create a new one
  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId]
    });

    return wishlist;
  }

  // Check whether product is already added
  if (wishlist.products.some(
    id => id.toString() === productId.toString()
  )) {
    throw new Error("Product already exists in wishlist");
  }

  wishlist.products.push(productId);

  await wishlist.save();

  return wishlist;
};


// 2. Get user's wishlist
const getWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId })
    .populate({
      path: "products",
      match: { isActive: true },
      select: "name price discountPrice images stock"
    });

  if (!wishlist) {
    return { user: userId, products: [] };
  }

  return wishlist;
};


// 3. Remove product from wishlist
const removeFromWishlist = async (userId, productId) => {
  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  const productExists = wishlist.products.some(
    id => id.toString() === productId.toString()
  );

  if (!productExists) {
    throw new Error("Product not found in wishlist");
  }

  wishlist.products = wishlist.products.filter(
    id => id.toString() !== productId.toString()
  );

  await wishlist.save();

  return wishlist;
};


// 4. Clear wishlist
const clearWishlist = async (userId) => {
  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  wishlist.products = [];

  await wishlist.save();

  return wishlist;
};


module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist
};