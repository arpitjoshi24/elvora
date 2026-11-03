const Category = require("../../models/category.model");
const Product = require("../../models/product.model");
const mongoose = require("mongoose");

// ADD CATEGORY
const createCategory = async (data) => {

    const { name, description, image } = data;

    if (!name || !name.trim()) {
        throw new Error("Category name is required");
    }

    const existingCategory = await Category.findOne({
        name: name.trim()
    });

    if (existingCategory) {
        throw new Error("Category already exists");
    }

    const category = await Category.create({
        name: name.trim(),
        description,
        image
    });

    return category;
};


// GET ALL ACTIVE CATEGORIES
const getAllCategories = async () => {

    return await Category.find({
        isActive: true
    }).sort({ createdAt: -1 });

};


// GET ALL CATEGORIES FOR ADMIN
const getAdminCategories = async () => {

    return await Category.find().sort({
        createdAt: -1
    });

};


// GET SINGLE CATEGORY
const getCategoryById = async (id, includeInactive = false) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID");
    }

    const filter = { _id: id };

    if (!includeInactive) {
        filter.isActive = true;
    }

    const category = await Category.findOne(filter);

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
};


// UPDATE CATEGORY
const updateCategory = async (id, data) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID");
    }

    const category = await Category.findById(id);

    if (!category) {
        throw new Error("Category not found");
    }

    const { name, description, image } = data;

    if (name !== undefined) {
        if (!name.trim()) {
            throw new Error("Category name cannot be empty");
        }

        category.name = name.trim();
    }

    if (description !== undefined) {
        category.description = description;
    }

    if (image !== undefined) {
        category.image = image;
    }

    await category.save();

    return category;
};


// ACTIVATE / DEACTIVATE CATEGORY
const updateCategoryStatus = async (id, isActive) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID");
    }

    const category = await Category.findByIdAndUpdate(
        id,
        { isActive },
        { new: true, runValidators: true }
    );

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
};


// DELETE CATEGORY
const deleteCategory = async (id) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID");
    }

    const productsExist = await Product.exists({
        category: id
    });

    if (productsExist) {
        throw new Error(
            "Cannot delete category because products are associated with it. Deactivate it instead."
        );
    }

    const category = await Category.findByIdAndDelete(id);

    if (!category) {
        throw new Error("Category not found");
    }

    return category;
};


// GET PRODUCTS BY CATEGORY
const getCategoryProducts = async (id) => {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new Error("Invalid category ID");
    }

    const category = await Category.findOne({
        _id: id,
        isActive: true
    });

    if (!category) {
        throw new Error("Category not found");
    }

    const products = await Product.find({
        category: id,
        isActive: true
    });

    return {
        category,
        products
    };
};


module.exports = {
    createCategory,
    getAllCategories,
    getAdminCategories,
    getCategoryById,
    updateCategory,
    updateCategoryStatus,
    deleteCategory,
    getCategoryProducts
};