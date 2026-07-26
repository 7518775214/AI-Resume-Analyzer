const express = require('express');
const authenticateToken = require('../middleware/authMiddleware');
const { getDashboard } = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @route   GET /api/dashboard
 * @desc    Get dashboard metrics and statistics for the authenticated user
 * @access  Private (JWT Token Required)
 */
router.get('/', authenticateToken, getDashboard);

module.exports = router;
