const express = require('express');
const { validateUserRegistration, validateUserLogin } = require('../middleware/userValidator');
const { register, login } = require('../controllers/authController');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateUserRegistration, register);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and return JWT token
 * @access  Public
 */
router.post('/login', validateUserLogin, login);

module.exports = router;

