const User = require("../../models/user.model");
const jwt = require("jsonwebtoken");

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
const registerUser = async ({ name, number, email, password }) => {

  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists with this email");
  }

  // Create new user
  const user = await User.create({
    name,
    number,
    email,
    password
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      number: user.number,
      email: user.email,
      role: user.role
    },
    token
  };
};

// LOGIN
const loginUser = async ({ email, password }) => {

  // Find user and include password
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Compare passwords
  const isMatch = await user.comparePassword(password);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      name: user.name,
      number: user.number,
      email: user.email,
      role: user.role
    },
    token
  };
};

module.exports = {
  registerUser,
  loginUser
};