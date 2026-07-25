const mongoose = require('mongoose');

/**
 * Connects to MongoDB Atlas database using Mongoose.
 * Reads connection string from process.env.MONGODB_URI.
 */
const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI;

  if (!mongoURI) {
    console.error('[DATABASE ERROR] MONGODB_URI is not defined in environment variables (.env file).');
    process.exit(1);
  }

  try {
    // Register Mongoose connection lifecycle listeners
    mongoose.connection.on('connected', () => {
      console.log(`[DATABASE] Mongoose default connection open to host: ${mongoose.connection.host}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[DATABASE ERROR] Mongoose default connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[DATABASE WARN] Mongoose default connection disconnected.');
    });

    // Handle process termination for graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('[DATABASE] Mongoose connection closed through app termination (SIGINT).');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('[DATABASE] Mongoose connection closed through app termination (SIGTERM).');
      process.exit(0);
    });

    // Establish initial connection
    const conn = await mongoose.connect(mongoURI);
    console.log(`[DATABASE SUCCESS] MongoDB Atlas connected: ${conn.connection.host} / DB: ${conn.connection.name}`);
    return conn;

  } catch (error) {
    console.error(`[DATABASE ERROR] Initial MongoDB Atlas connection failed: ${error.message}`);
    // Exit process with failure if database connection cannot be established
    process.exit(1);
  }
};

module.exports = connectDB;
