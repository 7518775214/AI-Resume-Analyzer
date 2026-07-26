const logger = require('../utils/logger');

/**
 * Centralized Global Error Handling Middleware
 * Formats errors consistently and ensures stack traces are hidden in production.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : (err.statusCode || 500);
  const isProduction = process.env.NODE_ENV === 'production';

  // Log error using logger utility
  logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, isProduction ? '' : err.stack);

  res.status(statusCode).json({
    status: statusCode >= 500 ? 'error' : 'fail',
    message: err.message || 'An internal server error occurred.',
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

module.exports = errorHandler;
