const User = require('../models/User');

/**
 * Controller to handle fetching dashboard overview and metrics for authenticated user
 * 
 * @route   GET /api/dashboard
 * @access  Private (Protected by JWT)
 * @desc    Retrieves summary dashboard data and user metadata for authenticated user
 */
const getDashboard = async (req, res) => {
  try {
    // 1. Verify user ID exists on req.user (attached by authenticateToken middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access. User identification missing.',
      });
    }

    // 2. Retrieve user record from database (excluding sensitive password hash)
    const user = await User.findById(userId).select('-password').lean();

    // 3. If user is not found, return 404 response
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User account not found.',
      });
    }

    // 4. Prepare dashboard summary statistics and recent activity placeholders
    const dashboardData = {
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      stats: {
        resumesAnalyzed: 0,
        interviewsCompleted: 0,
        averageScore: 0,
      },
      recentActivity: [],
    };

    // 5. Return successful JSON response
    return res.status(200).json({
      status: 'success',
      message: 'Dashboard data retrieved successfully',
      data: dashboardData,
    });
  } catch (error) {
    // Handle Mongoose CastError (invalid ObjectId format) gracefully
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID format.',
      });
    }

    console.error('[DASHBOARD CONTROLLER ERROR] Failed to retrieve dashboard data:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching dashboard data',
    });
  }
};

module.exports = {
  getDashboard,
};
