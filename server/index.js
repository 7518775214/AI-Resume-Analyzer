const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB Atlas
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Basic Middleware
app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'AI Resume Analyzer & Interview Coach Backend Server is operational.',
    timestamp: new Date().toISOString(),
  });
});

// Root Endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to AI Resume Analyzer & Interview Coach API Server',
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`[SERVER] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

