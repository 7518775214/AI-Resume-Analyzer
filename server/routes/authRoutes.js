const express = require('express');
const { validateUserRegistration } = require('../middleware/userValidator');
const { register } = require('../controllers/authController');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', validateUserRegistration, register);

module.exports = router;
