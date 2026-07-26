/**
 * Text Cleaning Utility for Resume Parsing
 * 
 * Provides pure functions to sanitize, normalize, and clean text extracted from 
 * PDF and DOCX documents while preserving document sections and content structure.
 */

/**
 * Clean and normalize extracted resume text.
 * 
 * - Replaces non-breaking spaces (\u00A0) and strips zero-width characters (\u200B, \uFEFF)
 * - Normalizes Windows/Mac line endings (\r\n, \r) to Unix line endings (\n)
 * - Removes non-printable and null control characters
 * - Normalizes horizontal whitespace (multiple spaces/tabs -> single space)
 * - Trims trailing/leading whitespace per line
 * - Normalizes vertical whitespace (max 2 consecutive newlines to preserve sections)
 * 
 * @param {string} text - Raw extracted text from document parser
 * @returns {string} Cleaned and structured plain text
 */
const cleanExtractedText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  return (
    text
      // 1. Standardize non-breaking spaces and strip zero-width characters
      .replace(/\u00A0/g, ' ')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')

      // 2. Normalize all line breaks to \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')

      // 3. Remove null bytes and non-printable control characters (except \n and \t)
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')

      // 4. Replace tabs with single space
      .replace(/\t/g, ' ')

      // 5. Split into lines, trim each line's leading/trailing spaces
      .split('\n')
      .map((line) => line.replace(/[ \t]+/g, ' ').trim())
      .join('\n')

      // 6. Replace 3 or more consecutive newlines with 2 newlines (preserve section gaps)
      .replace(/\n{3,}/g, '\n\n')

      // 7. Final trim of leading/trailing document whitespace
      .trim()
  );
};

module.exports = {
  cleanExtractedText,
};
