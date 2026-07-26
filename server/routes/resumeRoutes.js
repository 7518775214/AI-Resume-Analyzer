const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const uploadResumeMiddleware = require('../middleware/uploadMiddleware');
const {
  uploadResume,
  getUserResumes,
  getResumeById,
  analyzeResume,
  generateInterviewQuestions,
  deleteResume,
} = require('../controllers/resumeController');

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

// @route   GET /api/resumes/:id
// @desc    Get single resume details including extracted text
// @access  Private
router.get('/:id', authenticateToken, getResumeById);

// @route   POST /api/resumes/:id/analyze
// @desc    Trigger Gemini AI Resume Analysis on extracted text
// @access  Private
router.post('/:id/analyze', authenticateToken, analyzeResume);

// @route   POST /api/resumes/:id/generate-questions
// @desc    Trigger Gemini AI Interview Question Generation based on resume & analysis
// @access  Private
router.post('/:id/generate-questions', authenticateToken, generateInterviewQuestions);

// @route   DELETE /api/resumes/:id
// @desc    Delete resume document and associated stored file
// @access  Private
router.delete('/:id', authenticateToken, deleteResume);

module.exports = router;



