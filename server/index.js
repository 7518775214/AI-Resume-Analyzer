const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const helmet = require('helmet');
const morgan = require('morgan');

const connectDB = require('./config/db');
const validateEnv = require('./config/validateEnv');
const logger = require('./utils/logger');

const { apiLimiter, sensitiveLimiter } = require('./middleware/rateLimiter');
const notFoundHandler = require('./middleware/notFoundHandler');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const resumeRoutes = require('./routes/resumeRoutes');

// 1. Load and validate environment variables on startup
dotenv.config();
validateEnv();

// 2. Connect to MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// 3. Express Reverse Proxy Trust Configuration
app.set('trust proxy', 1);

// 4. Security Headers (Helmet)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }, // Allow serving uploaded resumes/static assets across origins
  })
);

// 5. CORS Configuration
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// 6. HTTP Request Logging (Morgan)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// 7. Request Body Parsing with 2MB Body Size Limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// 8. Global Rate Limiter for all API routes
app.use('/api', apiLimiter);

// 9. Sensitive Rate Limiter for Authentication Endpoints
app.use('/api/auth', sensitiveLimiter);

// 10. Serve Static Uploaded Files safely
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 11. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/resumes', resumeRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Resume Analyzer & Interview Coach Backend Server is operational.',
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to AI Resume Analyzer & Interview Coach API Server',
  });
});

// 12. Unknown Route Handler (404)
app.use(notFoundHandler);

// 13. Centralized Global Error Handler
app.use(errorHandler);

// Global Unhandled Process Exception & Rejection Safety Listeners
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown:', error.message, error.stack);
});

// Start Server
app.listen(PORT, () => {
  logger.info(`[SERVER] Operational in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
