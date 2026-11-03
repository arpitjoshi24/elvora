const User = require("../../../models/user.model");

// GET ALL USERS
const getAllUsers = async () => {
    const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

    return users;
};

// GET USER BY ID
const getUserById = async (userId) => {
    const user = await User.findById(userId).select("-password");

    return user;
};

// DELETE USER
const deleteUser = async (userId, currentAdminId) => {

    // Prevent admin from deleting their own account
    if (String(userId) === String(currentAdminId)) {
        throw new Error("You cannot delete your own admin account");
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    // Prevent deleting another admin
    if (user.role === "ADMIN") {
        throw new Error("You cannot delete another admin account");
    }

    await User.findByIdAndDelete(userId);

    return user;
};

module.exports = {
    getAllUsers,
    getUserById,
    deleteUser
};