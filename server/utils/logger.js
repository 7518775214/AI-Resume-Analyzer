/**
 * Centralized Logging Utility for Backend Server
 * Dynamically controls log output based on process.env.NODE_ENV.
 */

const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${message}`, ...args);
  },

  warn: (message, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, ...args);
  },

  error: (message, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, ...args);
  },

  debug: (message, ...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`, ...args);
    }
  },

  // Stream format compatible with Morgan request logger
  stream: {
    write: (message) => {
      console.log(`[HTTP] ${message.trim()}`);
    },
  },
};

module.exports = logger;
