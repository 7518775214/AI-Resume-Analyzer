const path = require('path');
const mongoose = require('mongoose');
const Resume = require('../models/Resume');
const storageService = require('../services/storageService');
const parsingService = require('../services/parsingService');
const geminiService = require('../services/geminiService');
const interviewAiService = require('../services/interviewAiService');

/**
 * Controller to handle resume upload, text extraction, and metadata persistence
 * 
 * @route   POST /api/resumes/upload
 * @access  Private (Protected by JWT)
 */
const uploadResume = async (req, res) => {
  try {
    // 1. Verify user is authenticated
    const userId = req.user?.id;
    if (!userId) {
      if (req.file?.filename) {
        await storageService.deleteFile(req.file.filename);
      }
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access. User authentication required.',
      });
    }

    // 2. Validate file presence from Multer
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No resume file provided. Please select a valid PDF or DOCX file.',
      });
    }

    const { originalname, filename, mimetype, size, path: multerPath } = req.file;
    const { jobTitle, jobDescription } = req.body;

    // Sanitize original filename to prevent path traversal or unsafe characters
    const sanitizedOriginalName = path.basename(originalname);

    // 3. Generate accessible file URL using Storage Service
    const fileUrl = storageService.getFileUrl(filename, req);

    // 4. Parse resume text automatically using Parsing Service
    const filePath = multerPath || path.join(storageService.uploadDir, filename);
    let extractedText = '';
    let parsingStatus = 'completed';
    try {
      extractedText = await parsingService.parseResume(filePath, mimetype);
    } catch (parseError) {
      console.warn(`[RESUME CONTROLLER] Parsing failed gracefully for ${filename}:`, parseError.message);
      parsingStatus = 'failed';
    }

    // 5. Create and save Resume metadata document in MongoDB with extracted text
    const newResume = await Resume.create({
      userId: userId,
      originalFileName: sanitizedOriginalName,
      storedFileName: filename,
      fileUrl: fileUrl,
      fileType: mimetype,
      fileSize: size,
      jobTitle: jobTitle ? jobTitle.trim() : '',
      jobDescription: jobDescription ? jobDescription.trim() : '',
      extractedText: extractedText,
      parsingStatus: parsingStatus,
      uploadDate: new Date(),
    });

    // 6. Return success response with resume metadata and extracted text
    return res.status(201).json({
      status: 'success',
      message: 'Resume uploaded and parsed successfully.',
      data: {
        resume: {
          id: newResume._id,
          userId: newResume.userId,
          originalFileName: newResume.originalFileName,
          storedFileName: newResume.storedFileName,
          fileUrl: newResume.fileUrl,
          fileType: newResume.fileType,
          fileSize: newResume.fileSize,
          jobTitle: newResume.jobTitle,
          jobDescription: newResume.jobDescription,
          extractedText: newResume.extractedText,
          parsingStatus: newResume.parsingStatus,
          uploadDate: newResume.uploadDate,
        },
      },
    });
  } catch (error) {
    console.error('[RESUME CONTROLLER ERROR] Failed to upload resume:', error);

    // Cleanup file from disk on database insertion failure to avoid orphaned files
    if (req.file?.filename) {
      await storageService.deleteFile(req.file.filename);
    }

    return res.status(500).json({
      status: 'error',
      message: 'An error occurred while saving resume metadata. Please try again.',
    });
  }
};

/**
 * Controller to fetch authenticated user's uploaded resumes with pagination support
 * 
 * @route   GET /api/resumes
 * @access  Private (Protected by JWT)
 */
const getUserResumes = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access.',
      });
    }

    // Parse and sanitize pagination parameters (cap max limit to 50 for security and resource protection)
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const total = await Resume.countDocuments({ userId });
    
    // Select specific list fields to optimize query execution and payload size
    const resumes = await Resume.find({ userId })
      .select('originalFileName storedFileName fileUrl fileType fileSize jobTitle jobDescription parsingStatus analysisStatus interviewQuestionsStatus analysis.atsScore uploadDate createdAt updatedAt')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      status: 'success',
      data: {
        count: resumes.length,
        total,
        page,
        totalPages,
        resumes,
      },
    });
  } catch (error) {
    console.error('[RESUME CONTROLLER ERROR] Failed to fetch resumes:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching resumes.',
    });
  }
};

/**
 * Controller to fetch single resume details including extracted text
 * 
 * @route   GET /api/resumes/:id
 * @access  Private (Protected by JWT)
 */
const getResumeById = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid resume ID format.',
      });
    }

    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resume not found.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: {
        resume,
      },
    });
  } catch (error) {
    console.error('[RESUME CONTROLLER ERROR] Failed to fetch resume by ID:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching resume details.',
    });
  }
};

/**
 * Controller to trigger Gemini AI Resume Analysis on extracted text
 * 
 * @route   POST /api/resumes/:id/analyze
 * @access  Private (Protected by JWT)
 */
const analyzeResume = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access. User authentication required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid resume ID format.',
      });
    }

    // 1. Fetch target resume belonging to authenticated user
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resume document not found.',
      });
    }

    // 2. Validate presence of parsed resume text
    if (!resume.extractedText || resume.extractedText.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Resume content is empty or could not be parsed. Please re-upload a clear PDF or DOCX file.',
      });
    }

    // 3. Mark status as pending while calling Gemini AI
    resume.analysisStatus = 'pending';
    await resume.save();

    // 4. Call dedicated Gemini AI Service to perform resume evaluation
    try {
      const analysisResult = await geminiService.analyzeResume(
        resume.extractedText,
        resume.jobTitle,
        resume.jobDescription
      );

      // 5. Update and persist AI analysis in MongoDB resume document
      resume.analysis = analysisResult;
      resume.analysisStatus = 'completed';
      await resume.save();

      // 6. Return clean structured JSON response to frontend
      return res.status(200).json({
        status: 'success',
        message: 'Resume analyzed successfully with Gemini AI.',
        data: {
          resumeId: resume._id,
          originalFileName: resume.originalFileName,
          jobTitle: resume.jobTitle,
          analysisStatus: resume.analysisStatus,
          analysis: resume.analysis,
        },
      });
    } catch (aiError) {
      console.error(`[RESUME CONTROLLER ERROR] AI analysis failed for resume ${id}:`, aiError);
      
      // Update analysis status to failed on error
      resume.analysisStatus = 'failed';
      await resume.save();

      return res.status(500).json({
        status: 'error',
        message: aiError.message || 'Gemini AI Resume Analysis failed. Please check API configuration or try again later.',
      });
    }
  } catch (error) {
    console.error('[RESUME CONTROLLER ERROR] Unexpected failure during resume analysis:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected internal server error occurred while analyzing the resume.',
    });
  }
};

/**
 * Controller to trigger Gemini AI Interview Question Generation based on parsed resume & analysis
 * 
 * @route   POST /api/resumes/:id/generate-questions
 * @access  Private (Protected by JWT)
 */
const generateInterviewQuestions = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { targetRole: customTargetRole } = req.body || {};

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access. User authentication required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid resume ID format.',
      });
    }

    // 1. Fetch resume belonging to user
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resume document not found.',
      });
    }

    // 2. Validate parsed text presence
    if (!resume.extractedText || resume.extractedText.trim() === '') {
      return res.status(400).json({
        status: 'fail',
        message: 'Resume text content is empty or could not be parsed. Please re-upload a clear PDF or DOCX file.',
      });
    }

    const effectiveTargetRole = (customTargetRole && typeof customTargetRole === 'string' && customTargetRole.trim()) || resume.jobTitle || 'Software Engineer';

    // 3. Mark status as pending
    resume.interviewQuestionsStatus = 'pending';
    await resume.save();

    // 4. Call dedicated Interview AI Service
    try {
      const questionsResult = await interviewAiService.generateInterviewQuestions(
        resume.extractedText,
        resume.analysis,
        effectiveTargetRole
      );

      // 5. Save generated questions in MongoDB document
      resume.interviewQuestions = questionsResult;
      resume.interviewQuestionsStatus = 'completed';
      if (customTargetRole && customTargetRole.trim()) {
        resume.jobTitle = customTargetRole.trim();
      }
      await resume.save();

      // 6. Return clean JSON response
      return res.status(200).json({
        status: 'success',
        message: 'AI interview questions generated successfully.',
        data: {
          resumeId: resume._id,
          targetRole: effectiveTargetRole,
          interviewQuestionsStatus: resume.interviewQuestionsStatus,
          interviewQuestions: resume.interviewQuestions,
        },
      });
    } catch (aiError) {
      console.error(`[RESUME CONTROLLER ERROR] Interview questions generation failed for resume ${id}:`, aiError);

      resume.interviewQuestionsStatus = 'failed';
      await resume.save();

      return res.status(500).json({
        status: 'error',
        message: aiError.message || 'Gemini AI Interview Question Generation failed. Please check API key or try again.',
      });
    }
  } catch (error) {
    console.error('[RESUME CONTROLLER ERROR] Unexpected failure generating interview questions:', error);
    return res.status(500).json({
      status: 'error',
      message: 'An unexpected internal server error occurred while generating interview questions.',
    });
  }
};

/**
 * Controller to delete a resume document and its stored physical file
 * 
 * @route   DELETE /api/resumes/:id
 * @access  Private (Protected by JWT)
 */
const deleteResume = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized access.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid resume ID format.',
      });
    }

    // 1. Fetch resume document belonging to authenticated user
    const resume = await Resume.findOne({ _id: id, userId });
    if (!resume) {
      return res.status(404).json({
        status: 'fail',
        message: 'Resume document not found.',
      });
    }

    // 2. Delete stored physical file using Storage Service abstraction
    if (resume.storedFileName) {
      await storageService.deleteFile(resume.storedFileName);
    }

    // 3. Delete database record
    await Resume.deleteOne({ _id: id, userId });

    return res.status(200).json({
      status: 'success',
      message: 'Resume and associated files deleted successfully.',
      data: {
        id: id,
      },
    });
  } catch (error) {
    console.error('[RESUME CONTROLLER ERROR] Failed to delete resume:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error while deleting resume.',
    });
  }
};

module.exports = {
  uploadResume,
  getUserResumes,
  getResumeById,
  analyzeResume,
  generateInterviewQuestions,
  deleteResume,
};



