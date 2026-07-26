const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * Controller to handle user registration
 * 
 * @route   POST /api/auth/register
 * @access  Public
 * @desc    Registers a new user account with hashed password
 */
const register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // 1. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if email already exists in database using fast indexed check
    const existingUser = await User.exists({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email is already registered',
      });
    }

    // 3. Hash password using bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 4. Save new user to MongoDB
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // 5. Construct sanitized user object (strictly excluding password)
    const userResponse = {
      id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
      emailVerified: newUser.emailVerified,
      createdAt: newUser.createdAt,
    };

    // 6. Return successful registration response
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    // Handle MongoDB duplicate key error (code 11000) as a fallback for race conditions
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email is already registered',
      });
    }

    console.error('[AUTH CONTROLLER ERROR] Registration failed:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
    });
  }
};

module.exports = {
  register,
};
