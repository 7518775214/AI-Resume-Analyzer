const User = require('../models/User');

/**
 * Controller to handle fetching authenticated user's profile details
 * 
 * @route   GET /api/profile
 * @access  Private (Protected by JWT)
 * @desc    Retrieves profile information for the authenticated user from database
 */
const getProfile = async (req, res) => {
  try {
    // 1. Verify user ID exists on req.user (attached by authenticateToken middleware)
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access. User identification missing.',
      });
    }

    // 2. Query user from MongoDB excluding password field using lean() for performance
    const user = await User.findById(userId).select('-password').lean();

    // 3. If user is not found (e.g. account deleted), return 404 Not Found
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User profile not found.',
      });
    }

    // 4. Construct sanitized profile response object
    const profileData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture || '',
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    // 5. Return success response with user profile data
    return res.status(200).json({
      status: 'success',
      message: 'Profile retrieved successfully',
      data: {
        user: profileData,
      },
    });
  } catch (error) {
    // Handle Mongoose CastError (invalid ObjectId format) gracefully
    if (error.name === 'CastError') {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid user ID format.',
      });
    }

    console.error('[PROFILE CONTROLLER ERROR] Failed to retrieve profile:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching profile',
    });
  }
};

module.exports = {
  getProfile,
};
