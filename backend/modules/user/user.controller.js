const userService = require("./user.service");

// GET PROFILE
const getProfile = async (req, res) => {
    try {

        const user = await userService.getProfile(req.user._id);

        return res.status(200).json({
            success: true,
            message: "Profile fetched successfully",
            user: {
                id: user._id,
                name: user.name,
                number: user.number,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {

        const user = await userService.updateProfile(
            req.user._id,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                id: user._id,
                name: user.name,
                number: user.number,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {

        return res.status(
            error.code === 11000 ? 409 : 400
        ).json({
            success: false,
            message: error.code === 11000
                ? "Email already registered"
                : error.message
        });
    }
};


module.exports = {
    getProfile,
    updateProfile
};