const adminUserService = require("./adminUser.service");

// GET ALL USERS
const getAllUsers = async (req, res) => {
    try {
        const users = await adminUserService.getAllUsers();

        return res.status(200).json({
            success: true,
            message: "Users fetched successfully",
            totalUsers: users.length,
            users
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// GET USER BY ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await adminUserService.getUserById(id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User fetched successfully",
            user
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


// DELETE USER
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        await adminUserService.deleteUser(id, req.user._id);

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (error) {
        const statusCode =
            error.message === "User not found" ? 404 :
            error.message.includes("cannot delete") ? 403 :
            500;

        return res.status(statusCode).json({
            success: false,
            message: error.message
        });
    }
};


module.exports = {
    getAllUsers,
    getUserById,
    deleteUser
};