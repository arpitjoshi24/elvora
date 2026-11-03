const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");

// Helper: Calculate cart total
const calculateCartTotal = (cart) => {
  let total = 0;

  cart.items.forEach((item) => {
    const product = item.product;

    if (product) {
      const price = product.discountPrice ?? product.price;
      total += price * item.quantity;
    }
  });

  return total;
};


// Helper: Populate cart products and update total
const refreshCart = async (cart) => {
  await cart.populate({
    path: "items.product",
    select: "name price discountPrice images stock isActive"
  });

  cart.totalAmount = calculateCartTotal(cart);

  await cart.save();

  return cart;
};


// 1. Add product to cart
const addToCart = async (userId, productId, quantity = 1) => {

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true
  });

  if (!product) {
    throw new Error("Product not found");
  }

  if (product.stock < quantity) {
    throw new Error("Insufficient product stock");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [{
        product: productId,
        quantity
      }]
    });

    return refreshCart(cart);
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (newQuantity > product.stock) {
      throw new Error("Requested quantity exceeds available stock");
    }

    existingItem.quantity = newQuantity;
  } else {
    cart.items.push({
      product: productId,
      quantity
    });
  }

  return refreshCart(cart);
};


// 2. Get user's cart
const getCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    return {
      user: userId,
      items: [],
      totalAmount: 0
    };
  }

  return refreshCart(cart);
};


// 3. Update product quantity
const updateCartQuantity = async (userId, productId, quantity) => {

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a positive integer");
  }

  const product = await Product.findOne({
    _id: productId,
    isActive: true
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const item = cart.items.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (!item) {
    throw new Error("Product not found in cart");
  }

  if (quantity > product.stock) {
    throw new Error("Requested quantity exceeds available stock");
  }

  item.quantity = quantity;

  return refreshCart(cart);
};


// 4. Remove product from cart
const removeFromCart = async (userId, productId) => {

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  const itemExists = cart.items.some(
    (item) => item.product.toString() === productId.toString()
  );

  if (!itemExists) {
    throw new Error("Product not found in cart");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId.toString()
  );

  return refreshCart(cart);
};


// 5. Clear entire cart
const clearCart = async (userId) => {

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found");
  }

  cart.items = [];
  cart.totalAmount = 0;

  await cart.save();

  return cart;
};


module.exports = {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  calculateCartTotal
};