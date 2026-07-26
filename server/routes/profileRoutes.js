const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { getProfile } = require('../controllers/profileController');

const router = express.Router();

/**
 * @route   GET /api/profile
 * @desc    Get profile information of the authenticated user
 * @access  Private (JWT Token Required)
 */
router.get('/', authenticateToken, getProfile);

module.exports = router;
