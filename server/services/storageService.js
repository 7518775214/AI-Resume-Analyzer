const path = require('path');
const fs = require('fs');

/**
 * Storage Service Abstraction
 * 
 * Provides a unified interface for handling file uploads.
 * Defaults to local storage (`/uploads`), but can easily be extended
 * to support Cloudinary or AWS S3 if credentials are provided in environment variables.
 */
class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '..', 'uploads');
    this.ensureUploadDirExists();
  }

  /**
   * Ensures the local uploads directory exists
   */
  ensureUploadDirExists() {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Generates public or relative URL for a stored file
   * @param {string} fileName - Stored file name
   * @param {import('express').Request} [req] - Express request object for absolute URL construction
   * @returns {string} File URL
   */
  getFileUrl(fileName, req) {
    // If Cloudinary or external CDN is configured, return CDN URL
    if (process.env.CLOUDINARY_URL) {
      return fileName; // Cloudinary returns absolute HTTPS URL directly
    }

    // Local Storage URL construction
    if (req) {
      const protocol = req.protocol || 'http';
      const host = req.get('host') || 'localhost:5000';
      return `${protocol}://${host}/uploads/${fileName}`;
    }

    return `/uploads/${fileName}`;
  }

  /**
   * Deletes a local file if needed
   * @param {string} fileName 
   */
  async deleteFile(fileName) {
    try {
      const resolvedPath = path.resolve(this.uploadDir, fileName);
      // Path traversal security check
      if (!resolvedPath.startsWith(path.resolve(this.uploadDir))) {
        console.warn(`[STORAGE SERVICE] Path traversal attempt blocked for filename: ${fileName}`);
        return;
      }

      if (fs.existsSync(resolvedPath)) {
        await fs.promises.unlink(resolvedPath);
      }
    } catch (err) {
      console.error(`[STORAGE SERVICE] Failed to delete file ${fileName}:`, err);
    }
  }
}

module.exports = new StorageService();
