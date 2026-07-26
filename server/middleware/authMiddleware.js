const jwt = require('jsonwebtoken');

/**
 * JWT Authentication Middleware
 * 
 * Intercepts incoming HTTP requests to verify JWT tokens from the Authorization header.
 * 
 * Workflow:
 * 1. Extracts Authorization header (`Authorization: Bearer <token>`).
 * 2. Validates header presence and format using case-insensitive regex.
 * 3. Synchronously verifies token signature and expiration against `JWT_SECRET`.
 * 4. On success: attaches decoded user payload (`{ id, role, iat, exp }`) to `req.user` and calls `next()`.
 * 5. On failure: handles expired/malformed tokens and returns a clean 401 Unauthorized response.
 *
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next middleware function
 */
const authenticateToken = (req, res, next) => {
  try {
    // 1. Extract Authorization header (Express automatically lowercases all request headers)
    const authHeader = req.headers.authorization;

    // 2. Validate presence of Authorization header
    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({
        status: 'fail',
        message: 'Access denied. No authentication token provided.',
      });
    }

    // 3. Extract token using regex matching 'Bearer <token>' (case-insensitive, handles extra whitespace)
    const authMatch = authHeader.match(/^Bearer\s+(.+)$/i);
    if (!authMatch || !authMatch[1].trim()) {
      return res.status(401).json({
        status: 'fail',
        message: 'Access denied. Malformed authentication header format.',
      });
    }

    const token = authMatch[1].trim();

    // 4. Retrieve secret key from environment variables
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return res.status(500).json({
        status: 'error',
        message: 'Server security configuration error. JWT secret missing.',
      });
    }

    // 5. Verify token synchronously (zero async Promise overhead, high execution speed)
    const decoded = jwt.verify(token, jwtSecret);

    // 6. Attach extracted user payload to req.user for downstream middleware/controllers
    req.user = decoded;

    // 7. Hand off execution to next middleware or route handler
    return next();
  } catch (error) {
    // Handle specific JWT verification error types with clean, secure 401 responses
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Authentication token has expired. Please log in again.',
      });
    }

    if (error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid authentication token.',
      });
    }

    // Fallback error response for unexpected authentication verification failures
    return res.status(401).json({
      status: 'fail',
      message: 'Authentication failed.',
    });
  }
};

module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
