const logger = require('../utils/logger');

/**
 * Environment Variable Validation Utility
 * Verifies presence, formatting, and security constraints of environment variables.
 */
const validateEnv = () => {
  const requiredEnvVars = [
    'PORT',
    'NODE_ENV',
    'MONGODB_URI',
    'JWT_SECRET',
    'GEMINI_API_KEY',
  ];

  const missingVars = [];
  const invalidVars = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar].trim() === '') {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables on startup:');
    missingVars.forEach((v) => logger.error(`  - ${v}`));
    logger.error('Please configure them in server/.env before launching the server.');
    process.exit(1);
  }

  // Quality & Security Checks
  const port = parseInt(process.env.PORT, 10);
  if (isNaN(port) || port <= 0 || port > 65535) {
    invalidVars.push(`PORT must be a valid port number between 1 and 65535 (received: ${process.env.PORT})`);
  }

  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    logger.warn(`Unrecognized NODE_ENV value '${process.env.NODE_ENV}'. Defaulting to 'development'.`);
    process.env.NODE_ENV = 'development';
  }

  if (process.env.JWT_SECRET.length < 16) {
    logger.warn('JWT_SECRET is shorter than 16 characters. Consider using a stronger secret key for production.');
  }

  if (!process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    invalidVars.push('MONGODB_URI must start with "mongodb://" or "mongodb+srv://"');
  }

  if (invalidVars.length > 0) {
    logger.error('Invalid environment variable configurations:');
    invalidVars.forEach((v) => logger.error(`  - ${v}`));
    process.exit(1);
  }

  // Safe fallback for CLIENT_URL
  if (!process.env.CLIENT_URL) {
    process.env.CLIENT_URL = 'http://localhost:5173';
  }

  logger.info(`Environment variables validated successfully. Mode: ${process.env.NODE_ENV}`);
  return true;
};

module.exports = validateEnv;
