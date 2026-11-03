const User = require("../../models/user.model");

// GET USER PROFILE
const getProfile = async (userId) => {

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    return user;
};


// UPDATE USER PROFILE
const updateProfile = async (userId, data) => {

    const { name, number, email } = data;

    const user = await User.findById(userId);

    if (!user) {
        throw new Error("User not found");
    }

    if (name !== undefined) user.name = name;
    if (number !== undefined) user.number = number;
    if (email !== undefined) user.email = email.trim().toLowerCase();

    await user.save();

    return user;
};


module.exports = {
    getProfile,
    updateProfile
};