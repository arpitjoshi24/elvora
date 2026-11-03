const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Address = require("../../models/address.model");

// 1. Create new order
const createOrder = async (userId, orderData) => {
  const { addressId, paymentMethod } = orderData;

  // Validate payment method
  if (!["COD", "ONLINE"].includes(paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  // Get user's cart
  const cart = await Cart.findOne({ user: userId });

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  // Get user's delivery address
  const address = await Address.findOne({
    _id: addressId,
    user: userId
  });

  if (!address) {
    throw new Error("Delivery address not found");
  }

  // Prepare order items
  const orderItems = [];
  let totalAmount = 0;

  for (const item of cart.items) {
    const product = await Product.findOne({
      _id: item.product,
      isActive: true
    });

    if (!product) {
      throw new Error("One or more products are unavailable");
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const price = product.discountPrice ?? product.price;

    totalAmount += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0] || "",
      price,
      quantity: item.quantity
    });
  }

  // Save delivery address snapshot
  const shippingAddress = {
    fullName: address.fullName,
    phone: address.phone,
    addressLine: address.addressLine,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
    landmark: address.landmark,
    addressType: address.addressType
  };

  // Create order
  const order = await Order.create({
    user: userId,
    items: orderItems,
    shippingAddress,
    totalAmount,
    paymentMethod,
    paymentStatus: "PENDING",
    orderStatus: "PLACED"
  });

  // For COD, reserve/decrease stock after successful order creation.
  // For ONLINE, stock must be reserved using a proper payment flow.
  if (paymentMethod === "COD") {
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        {
          _id: item.product,
          isActive: true,
          stock: { $gte: item.quantity }
        },
        {
          $inc: { stock: -item.quantity }
        },
        { new: true }
      );

      if (!updatedProduct) {
        await Order.deleteOne({ _id: order._id });
        throw new Error(
          `Stock changed while placing order for ${item.name}. Please try again.`
        );
      }
    }

    await Cart.updateOne(
      { user: userId },
      { $set: { items: [], totalAmount: 0 } }
    );
  }

  return order;
};


// 2. Get all orders of logged-in user
const getMyOrders = async (userId) => {
  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 });

  return orders;
};


// 3. Get order details
const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId
  }).populate("items.product", "name images");

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};


// 4. Cancel order
const cancelOrder = async (userId, orderId) => {
  const order = await Order.findOne({
    _id: orderId,
    user: userId
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (!["PLACED", "CONFIRMED"].includes(order.orderStatus)) {
    throw new Error("This order cannot be cancelled");
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );
  }

  order.orderStatus = "CANCELLED";

  if (order.paymentStatus === "PAID") {
    order.paymentStatus = "REFUNDED";
  }

  await order.save();

  return order;
};


// 5. Admin: Get all orders
const getAllOrders = async () => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  return orders;
};


// 6. Admin: Update order status
const updateOrderStatus = async (orderId, status) => {
  const allowedStatuses = [
    "PLACED",
    "CONFIRMED",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED"
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid order status");
  }

  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.orderStatus === "CANCELLED" ||
      order.orderStatus === "DELIVERED") {
    throw new Error("This order cannot be updated");
  }

  if (status === "CANCELLED") {
    throw new Error("Use the cancellation process to cancel an order");
  }

  order.orderStatus = status;

  await order.save();

  return order;
};


module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
};