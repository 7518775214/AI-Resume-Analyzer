/**
 * Graceful 404 Handler Middleware for Unmatched Routes
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Cannot ${req.method} ${req.originalUrl} - Resource or API endpoint not found.`,
  });
};

module.exports = notFoundHandler;
