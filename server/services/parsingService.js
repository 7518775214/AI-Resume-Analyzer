const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const { cleanExtractedText } = require('../utils/textCleaner');

/**
 * Resume Parsing Service
 * 
 * Production-ready service responsible for auto-detecting document format via magic bytes
 * and MIME type, extracting text content from PDF and DOCX documents, cleaning extracted text,
 * and handling errors gracefully.
 */
class ParsingService {
  /**
   * Inspect magic bytes (file signature) of a file buffer to reliably detect format.
   * 
   * @param {Buffer} buffer - File content buffer
   * @returns {'pdf' | 'docx' | 'doc' | 'unknown'} Detected file signature
   */
  detectFormatFromBuffer(buffer) {
    if (!buffer || !Buffer.isBuffer(buffer) || buffer.length < 4) {
      return 'unknown';
    }

    // PDF signature: %PDF- (0x25 0x50 0x44 0x46)
    if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
      return 'pdf';
    }

    // DOCX signature: PK\x03\x04 (Zip archive - 0x50 0x4B 0x03 0x04)
    if (buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04) {
      return 'docx';
    }

    // Legacy Word binary signature: 0xD0 0xCF 0x11 0xE0
    if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) {
      return 'doc';
    }

    return 'unknown';
  }

  /**
   * Automatically detect document format using magic bytes first, falling back to MIME/extension.
   * 
   * @param {Buffer} buffer - File content buffer
   * @param {string} mimeType - Uploaded MIME type
   * @param {string} filePath - Path to stored file
   * @returns {'pdf' | 'docx'} Detected supported format
   * @throws {Error} If format is unsupported or spoofed
   */
  detectFileType(buffer, mimeType, filePath) {
    // 1. Try magic bytes first (most secure & reliable)
    const magicFormat = this.detectFormatFromBuffer(buffer);

    if (magicFormat === 'pdf') return 'pdf';
    if (magicFormat === 'docx') return 'docx';
    if (magicFormat === 'doc') {
      throw new Error('Legacy binary Word documents (.doc) are not supported. Please convert to .docx or PDF format.');
    }

    // 2. Fallback to MIME type and extension if magic bytes are indeterminate
    const normalizedMime = (mimeType || '').toLowerCase().trim();
    const ext = path.extname(filePath || '').toLowerCase();

    if (normalizedMime === 'application/pdf' || ext === '.pdf') {
      return 'pdf';
    }

    if (
      normalizedMime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      ext === '.docx'
    ) {
      return 'docx';
    }

    throw new Error(`Unsupported or invalid file format: MIME '${mimeType}', Extension '${ext}'. Only valid PDF and DOCX files are supported.`);
  }

  /**
   * Parse PDF file buffer and extract raw text content.
   * 
   * @param {Buffer} buffer - PDF file buffer
   * @returns {Promise<string>} Extracted plain text
   */
  async parsePDF(buffer) {
    try {
      const data = await pdfParse(buffer);
      return data.text || '';
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('encrypted') || msg.includes('password')) {
        throw new Error('PDF document is password-protected or encrypted.');
      }
      console.error('[PARSING SERVICE] PDF parsing failed:', msg);
      throw new Error(`Failed to parse PDF document: ${msg}`);
    }
  }

  /**
   * Parse DOCX file buffer and extract raw text content.
   * 
   * @param {Buffer} buffer - DOCX file buffer
   * @returns {Promise<string>} Extracted plain text
   */
  async parseDOCX(buffer) {
    try {
      const result = await mammoth.extractRawText({ buffer });

      if (result.messages && result.messages.length > 0) {
        const warnings = result.messages.filter((m) => m.type === 'warning').map((m) => m.message);
        if (warnings.length > 0) {
          console.warn('[PARSING SERVICE] Mammoth DOCX parsing warnings:', warnings.join('; '));
        }
      }

      return result.value || '';
    } catch (err) {
      console.error('[PARSING SERVICE] DOCX parsing failed:', err.message);
      throw new Error(`Failed to parse DOCX document: ${err.message}`);
    }
  }

  /**
   * Main entry point to parse a resume document file.
   * Reads file, auto-detects format safely, extracts text, cleans text, and handles errors.
   * 
   * @param {string} filePath - Absolute path to stored resume file
   * @param {string} mimeType - MIME type of uploaded file
   * @returns {Promise<string>} Cleaned plain text extracted from resume
   */
  async parseResume(filePath, mimeType) {
    if (!filePath) {
      throw new Error('File path is required for parsing.');
    }

    const resolvedPath = path.resolve(filePath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`Resume file not found at path: ${resolvedPath}`);
    }

    try {
      // 1. Read file buffer
      const fileBuffer = await fs.promises.readFile(resolvedPath);

      // 2. Detect format with magic byte validation
      const format = this.detectFileType(fileBuffer, mimeType, resolvedPath);

      // 3. Extract text according to format
      let rawText = '';
      if (format === 'pdf') {
        rawText = await this.parsePDF(fileBuffer);
      } else if (format === 'docx') {
        rawText = await this.parseDOCX(fileBuffer);
      }

      // 4. Clean and normalize extracted text
      const cleanedText = cleanExtractedText(rawText);

      if (!cleanedText) {
        console.warn(`[PARSING SERVICE] Warning: Extracted text is empty for file ${path.basename(resolvedPath)}. Document may be image-based or empty.`);
      }

      return cleanedText;
    } catch (error) {
      console.error(`[PARSING SERVICE ERROR] Failed to process resume file (${path.basename(filePath)}):`, error.message);
      throw error;
    }
  }
}

module.exports = new ParsingService();
