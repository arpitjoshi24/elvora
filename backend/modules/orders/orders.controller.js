const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrders,
  updateOrderStatus
} = require("./orders.service");

const mongoose = require("mongoose");

// 1. Create new order
const placeOrder = async (req, res) => {
  try {
    const { addressId, paymentMethod } = req.body;

    if (!addressId || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: "Address ID and payment method are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid address ID"
      });
    }

    const order = await createOrder(req.user._id, {
      addressId,
      paymentMethod
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 2. Get logged-in user's orders
const getUserOrders = async (req, res) => {
  try {
    const orders = await getMyOrders(req.user._id);

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      totalOrders: orders.length,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 3. Get order details by ID
const getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await getOrderById(
      req.user._id,
      orderId
    );

    return res.status(200).json({
      success: true,
      message: "Order details fetched successfully",
      order
    });

  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};


// 4. Cancel order
const cancelUserOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    const order = await cancelOrder(
      req.user._id,
      orderId
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


// 5. Admin: Get all orders
const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await getAllOrders();

    return res.status(200).json({
      success: true,
      message: "All orders fetched successfully",
      totalOrders: orders.length,
      orders
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


// 6. Admin: Update order status
const changeOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID"
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Order status is required"
      });
    }

    const order = await updateOrderStatus(orderId, status);

    return res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      order
    });

  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


module.exports = {
  placeOrder,
  getUserOrders,
  getSingleOrder,
  cancelUserOrder,
  getAllOrdersAdmin,
  changeOrderStatus
};