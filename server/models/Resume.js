const mongoose = require('mongoose');

/**
 * Resume Schema Definition
 * Stores metadata and file references for user-uploaded resumes.
 */
const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
      maxlength: [255, 'Original file name cannot exceed 255 characters'],
    },
    storedFileName: {
      type: String,
      required: [true, 'Stored file name is required'],
      trim: true,
    },
    fileUrl: {
      type: String,
      required: [true, 'File URL or path is required'],
      trim: true,
    },
    fileType: {
      type: String,
      required: [true, 'File MIME type is required'],
      trim: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size in bytes is required'],
      min: [1, 'File size must be greater than 0 bytes'],
    },
    jobTitle: {
      type: String,
      default: '',
      trim: true,
      maxlength: [200, 'Job title cannot exceed 200 characters'],
    },
    jobDescription: {
      type: String,
      default: '',
      trim: true,
      maxlength: [10000, 'Job description cannot exceed 10,000 characters'],
    },
    extractedText: {
      type: String,
      default: '',
    },
    parsingStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    analysisStatus: {
      type: String,
      enum: ['none', 'pending', 'completed', 'failed'],
      default: 'none',
    },
    analysis: {
      atsScore: {
        type: Number,
        default: 0,
      },
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      missingSkills: [{ type: String }],
      roleMatch: [{ type: String }],
      improvements: [{ type: String }],
      summary: {
        type: String,
        default: '',
      },
      analyzedAt: {
        type: Date,
      },
    },
    interviewQuestionsStatus: {
      type: String,
      enum: ['none', 'pending', 'completed', 'failed'],
      default: 'none',
    },
    interviewQuestions: {
      technical: {
        easy: [{ type: String }],
        medium: [{ type: String }],
        hard: [{ type: String }],
      },
      hr: [{ type: String }],
      projectBased: [{ type: String }],
      tips: [{ type: String }],
      generatedAt: {
        type: Date,
      },
    },
    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fetching user resumes sorted by upload date
resumeSchema.index({ userId: 1, uploadDate: -1 });

const Resume = mongoose.model('Resume', resumeSchema);

module.exports = Resume;
