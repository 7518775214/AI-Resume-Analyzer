const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const uploadResumeMiddleware = require('../middleware/uploadMiddleware');
const { uploadResume, getUserResumes } = require('../controllers/resumeController');

/**
 * Resume Routes
 * All routes in this module are protected by JWT authentication
 */

// @route   POST /api/resumes/upload
// @desc    Upload resume PDF/DOCX file and store metadata in MongoDB
// @access  Private
router.post('/upload', authenticateToken, uploadResumeMiddleware, uploadResume);

// @route   GET /api/resumes
// @desc    Get list of uploaded resumes for authenticated user
// @access  Private
router.get('/', authenticateToken, getUserResumes);

module.exports = router;
