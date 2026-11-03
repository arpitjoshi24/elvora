const Product = require("../../models/product.model");
const mongoose = require("mongoose");
// GET ALL PRODUCTS
const getAllProducts = async (query) => {

    const {
        search,
        category,
        minPrice,
        maxPrice,
        sort,
        page = 1,
        limit = 10
    } = query;

    let filter = {
        isActive: true
    };

    // Search by product name
    if (search) {
        filter.name = {
            $regex: search,
            $options: "i"
        };
    }

    // Filter by category
    if (category) {
        filter.category = category;
    }

    // Filter by price
    if (minPrice !== undefined || maxPrice !== undefined) {

        filter.price = {};

        if (minPrice !== undefined) {
            filter.price.$gte = Number(minPrice);
        }

        if (maxPrice !== undefined) {
            filter.price.$lte = Number(maxPrice);
        }
    }

    // Sorting
    let sortOption = {};

    if (sort === "price_low") {
        sortOption.price = 1;
    } 
    else if (sort === "price_high") {
        sortOption.price = -1;
    } 
    else if (sort === "latest") {
        sortOption.createdAt = -1;
    }

    const pageNumber = Math.max(1, Number(page));
    const limitNumber = Math.min(50, Math.max(1, Number(limit)));

    const skip = (pageNumber - 1) * limitNumber;

    const products = await Product.find(filter)
        .populate("category", "name")
        .sort(sortOption)
        .skip(skip)
        .limit(limitNumber);

    const totalProducts = await Product.countDocuments(filter);

    return {
        products,
        totalProducts,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalProducts / limitNumber)
    };
};


// GET SINGLE PRODUCT
const getProductById = async (productId) => {

    const product = await Product.findOne({
        _id: productId,
        isActive: true
    }).populate("category", "name");

    if (!product) {
        throw new Error("Product not found");
    }

    return product;
};


// GET FEATURED PRODUCTS
const getFeaturedProducts = async () => {

    return await Product.find({
        isFeatured: true,
        isActive: true
    })
    .populate("category", "name")
    .sort({ createdAt: -1 });
};


// GET LATEST PRODUCTS
const getLatestProducts = async () => {

    return await Product.find({
        isActive: true
    })
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(10);
};


// ADD PRODUCT
const createProduct = async (productData) => {

    const {
        name,
        description,
        price,
        discountPrice,
        images,
        category,
        stock,
        isFeatured
    } = productData;

    // Check required fields
    if (!name || !description || price === undefined || !category) {
        throw new Error("Please provide all required fields");
    }

    // Validate price
    if (Number(price) < 0) {
        throw new Error("Price cannot be negative");
    }

    if (
        discountPrice !== undefined &&
        discountPrice !== null &&
        (Number(discountPrice) < 0 || Number(discountPrice) > Number(price))
    ) {
        throw new Error("Invalid discount price");
    }

    // Create product
    const product = await Product.create({
        name,
        description,
        price,
        discountPrice,
        images,
        category,
        stock,
        isFeatured
    });

    return product;
};

// UPDATE PRODUCT
const updateProduct = async (productId, productData) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const allowedFields = [
    "name",
    "description",
    "price",
    "discountPrice",
    "images",
    "category",
    "stock",
    "isFeatured",
    "isActive",
  ];

  const updateData = {};

  allowedFields.forEach((field) => {
    if (productData[field] !== undefined) {
      updateData[field] = productData[field];
    }
  });

  if (
    updateData.price !== undefined &&
    Number(updateData.price) < 0
  ) {
    throw new Error("Price cannot be negative");
  }

  if (
    updateData.discountPrice !== undefined &&
    updateData.discountPrice !== null &&
    (
      Number(updateData.discountPrice) < 0 ||
      Number(updateData.discountPrice) >
        Number(updateData.price ?? (await Product.findById(productId))?.price)
    )
  ) {
    throw new Error("Invalid discount price");
  }

  if (
    updateData.stock !== undefined &&
    (!Number.isInteger(Number(updateData.stock)) ||
      Number(updateData.stock) < 0)
  ) {
    throw new Error("Invalid stock quantity");
  }

  const product = await Product.findByIdAndUpdate(
    productId,
    updateData,
    {
      returnDocument: "after",
      runValidators: true,
    }
  ).populate("category", "name");

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};


// DELETE PRODUCT
const deleteProduct = async (productId) => {
  if (!mongoose.Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID");
  }

  const product = await Product.findByIdAndDelete(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};
module.exports = {
  getAllProducts,
  getProductById,
  getFeaturedProducts,
  getLatestProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};