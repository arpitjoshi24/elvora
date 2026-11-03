const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./modules/user/user.routes");
const authRoutes = require("./modules/auth/auth.routes");
const app = express();
const productRoutes = require("./modules/product/product.routes");
// Admin Product Routes
const adminProductRoutes = require("./modules/admin/products/adminProduct.routes");
const categoryRoutes = require("./modules/category/category.routes");
const adminCategoryRoutes = require("./modules/admin/categories/adminCategory.routes");
const wishlistRoutes = require("./modules/wishlist/wishlist.routes");
const cartRoutes = require("./modules/cart/cart.routes");
const addressRoutes = require("./modules/address/address.routes");
const orderRoutes = require("./modules/orders/orders.routes");
const adminOrderRoutes = require("./modules/admin/orders/adminOrder.routes");
const adminUserRoutes = require("./modules/admin/users/adminUser.routes");
// Middlewares
app.use(express.json());

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));

app.use(cookieParser());

// Home Route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Elvora API is running"
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/addresses", addressRoutes);
// Customer order routes
app.use("/api/orders", orderRoutes);
// Admin order routes
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin", adminUserRoutes);
module.exports = app;