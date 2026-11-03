const categoryService = require("./category.service");

// ADD CATEGORY
const createCategory = async (req, res) => {
    try {

        const category = await categoryService.createCategory(req.body);

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.code === 11000
                ? "Category already exists"
                : error.message
        });
    }
};


// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
    try {

        const categories = await categoryService.getAllCategories();

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET ADMIN CATEGORIES
const getAdminCategories = async (req, res) => {
    try {

        const categories = await categoryService.getAdminCategories();

        return res.status(200).json({
            success: true,
            count: categories.length,
            categories
        });

    } catch (error) {

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET SINGLE CATEGORY
const getCategoryById = async (req, res) => {
    try {

        const category = await categoryService.getCategoryById(
            req.params.id,
            req.originalUrl.startsWith("/api/admin/")
        );

        return res.status(200).json({
            success: true,
            category
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE CATEGORY
const updateCategory = async (req, res) => {
    try {

        const category = await categoryService.updateCategory(
            req.params.id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category
        });

    } catch (error) {

        return res.status(error.code === 11000 ? 409 : 400).json({
            success: false,
            message: error.code === 11000
                ? "Category name already exists"
                : error.message
        });
    }
};


// UPDATE CATEGORY STATUS
const updateCategoryStatus = async (req, res) => {
    try {

        if (typeof req.body.isActive !== "boolean") {
            return res.status(400).json({
                success: false,
                message: "isActive must be true or false"
            });
        }

        const category = await categoryService.updateCategoryStatus(
            req.params.id,
            req.body.isActive
        );

        return res.status(200).json({
            success: true,
            message: "Category status updated successfully",
            category
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE CATEGORY
const deleteCategory = async (req, res) => {
    try {

        await categoryService.deleteCategory(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully"
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};


// GET PRODUCTS BY CATEGORY
const getCategoryProducts = async (req, res) => {
    try {

        const result = await categoryService.getCategoryProducts(
            req.params.id
        );

        return res.status(200).json({
            success: true,
            ...result
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
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