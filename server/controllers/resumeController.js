const path = require('path');
const Resume = require('../models/Resume');
const storageService = require('../services/storageService');

/**
 * Controller to handle resume upload and metadata persistence
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

    const { originalname, filename, mimetype, size } = req.file;
    const { jobTitle, jobDescription } = req.body;

    // Sanitize original filename to prevent path traversal or unsafe characters
    const sanitizedOriginalName = path.basename(originalname);

    // 3. Generate accessible file URL using Storage Service
    const fileUrl = storageService.getFileUrl(filename, req);

    // 4. Create and save Resume metadata document in MongoDB
    const newResume = await Resume.create({
      userId: userId,
      originalFileName: sanitizedOriginalName,
      storedFileName: filename,
      fileUrl: fileUrl,
      fileType: mimetype,
      fileSize: size,
      jobTitle: jobTitle ? jobTitle.trim() : '',
      jobDescription: jobDescription ? jobDescription.trim() : '',
      uploadDate: new Date(),
    });

    // 5. Return success response with resume metadata
    return res.status(201).json({
      status: 'success',
      message: 'Resume uploaded and saved successfully.',
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
 * Controller to fetch authenticated user's uploaded resumes
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

    const resumes = await Resume.find({ userId }).sort({ uploadDate: -1 }).lean();

    return res.status(200).json({
      status: 'success',
      data: {
        count: resumes.length,
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

module.exports = {
  uploadResume,
  getUserResumes,
};
