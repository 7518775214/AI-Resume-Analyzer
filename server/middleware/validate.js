const { validationResult } = require('express-validator');

/**
 * Reusable Validation Middleware
 * 
 * Intercepts incoming HTTP requests after express-validator rule chains execute.
 * Evaluates validation results and, if errors exist, formats them into a clean,
 * standardized JSON error response. If validation succeeds, control passes to next middleware.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    // Format error objects for consistent client response structure (one primary error per field)
    const formattedErrors = errors.array({ onlyFirstError: true }).map((error) => ({
      field: error.path || error.param || 'unknown',
      message: error.msg,
    }));

    return res.status(400).json({
      status: 'fail',
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  next();
};

module.exports = validate;
