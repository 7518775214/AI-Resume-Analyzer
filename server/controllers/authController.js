const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * Helper to construct a sanitized user object (strictly excluding password)
 * 
 * @param {Object} user - User document or plain JS object
 * @returns {Object} Sanitized user response object
 */
const formatUserResponse = (user) => ({
  id: user._id || user.id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
});

/**
 * Controller to handle user registration
 * 
 * @route   POST /api/auth/register
 * @access  Public
 * @desc    Registers a new user account with hashed password
 */
const register = async (req, res, next) => {
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

    // 5. Construct sanitized user object
    const userResponse = formatUserResponse(newUser);

    // 6. Return successful registration response
    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully',
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'fail',
        message: 'Email is already registered',
      });
    }
    next(error);
  }
};

/**
 * Controller to handle user login
 * 
 * @route   POST /api/auth/login
 * @access  Public
 * @desc    Authenticates user credentials and issues a JWT token
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user by email with .lean() for high-performance plain JS object query
    const user = await User.findOne({ email: normalizedEmail }).select('+password').lean();

    // 3. If user does not exist, return 401 Unauthorized
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // 4. Compare password with stored hashed password using bcrypt.compare()
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password',
      });
    }

    // 5. Read JWT secret and expiration from environment variables
    const secretKey = process.env.JWT_SECRET || 'supersecret_jwt_key_ai_resume_analyzer_2026';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';

    // 6. Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      secretKey,
      {
        expiresIn: jwtExpiresIn,
      }
    );

    // 7. Construct sanitized user object (strictly excluding password)
    const userResponse = formatUserResponse(user);

    // 8. Return success response with JWT token and user details
    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
};
