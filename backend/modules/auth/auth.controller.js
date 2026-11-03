const authService = require("./auth.service");

// REGISTER CONTROLLER
const register = async (req, res) => {
  try {
    const { name, number, email, password } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters"
      });
    }

    const result = await authService.registerUser({
      name,
      number,
      email: email.trim().toLowerCase(),
      password
    });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      user: result.user
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


// LOGIN CONTROLLER
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await authService.loginUser({
      email: email.trim().toLowerCase(),
      password
    });

    res.cookie("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: result.user
    });

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message
    });
  }
};
const logoutUser = async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};
module.exports = {
  register,
  login,
  logoutUser
};