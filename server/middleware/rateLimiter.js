const rateLimit = require('express-rate-limit');

/**
 * Helper to construct rate limiters with consistent response structure
 */
const createLimiter = ({ windowMs, max, message }) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    statusCode: 429,
    handler: (req, res) => {
      res.status(429).json({
        status: 'fail',
        message: message,
      });
    },
  });
};

/**
 * General Rate Limiter for standard API endpoints
 * 100 requests per 15 minutes window per IP.
 */
const apiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP. Please try again after 15 minutes.',
});

/**
 * Strict Rate Limiter for Authentication and Upload endpoints
 * 20 requests per 15 minutes window per IP.
 */
const sensitiveLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: 'Too many sensitive requests (login/register/upload). Please try again after 15 minutes.',
});

/**
 * AI Rate Limiter for heavy Gemini AI generation endpoints
 * 15 requests per 15 minutes window per IP.
 */
const aiLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: 'AI analysis quota rate limit reached for this session. Please wait a few minutes before generating more AI analyses.',
});

module.exports = {
  apiLimiter,
  sensitiveLimiter,
  aiLimiter,
};
