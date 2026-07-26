const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads folder exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 1. Allowed MIME Types and Extensions
const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const allowedExtensions = ['.pdf', '.docx', '.doc'];

// 2. Configure Multer Disk Storage safely
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize basename to prevent path traversal attack vectors
    const cleanBasename = path.basename(file.originalname).replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(cleanBasename).toLowerCase();
    const safeExt = allowedExtensions.includes(ext) ? ext : '.pdf';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `resume-${uniqueSuffix}${safeExt}`);
  },
});

// 3. File Filter for PDF and DOCX documents
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeType = file.mimetype;

  const isMimeAllowed = allowedMimeTypes.includes(mimeType);
  const isExtAllowed = allowedExtensions.includes(ext);

  // Require BOTH valid extension AND valid MIME type for maximum security
  if (isMimeAllowed && isExtAllowed) {
    return cb(null, true);
  }

  const error = new Error('Invalid file format. Only PDF (.pdf) and Word (.docx, .doc) files are accepted.');
  error.code = 'INVALID_FILE_TYPE';
  return cb(error, false);
};

// 4. Configure Multer Instance with 5MB Limit
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit
  },
  fileFilter: fileFilter,
});

/**
 * Custom Express Middleware Wrapper for Multer Upload
 * Catches Multer upload errors (size limit, file type filter) and returns structured JSON responses.
 */
const uploadResumeMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('resume');

  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            status: 'fail',
            message: 'File size exceeds maximum limit of 5 MB.',
          });
        }
        return res.status(400).json({
          status: 'fail',
          message: `Upload error: ${err.message}`,
        });
      }

      if (err.code === 'INVALID_FILE_TYPE' || err.message) {
        return res.status(400).json({
          status: 'fail',
          message: err.message,
        });
      }

      return res.status(400).json({
        status: 'fail',
        message: 'Failed to process resume file upload.',
      });
    }

    next();
  });
};

module.exports = uploadResumeMiddleware;
