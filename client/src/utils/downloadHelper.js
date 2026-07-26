/**
 * Utility helper for client-side Blob file downloads and Blob error handling.
 */

/**
 * Programmatically triggers a browser download for PDF blob data
 * 
 * @param {Blob|ArrayBuffer} blobData - Raw binary blob data from API response
 * @param {string} [originalFileName='Resume'] - Base filename to name the download
 */
export const downloadPdfReport = (blobData, originalFileName = 'Resume') => {
  const blob = new Blob([blobData], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');

  // Sanitize filename to alphanumeric and safe punctuation
  const sanitized = (originalFileName || 'Resume')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/\.[^/.]+$/, '');

  const fileName = `${sanitized}_AI_Analysis.pdf`;

  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();

  // Clean up DOM link element and delay revoking object URL to avoid Safari/WebKit cutoff
  link.parentNode.removeChild(link);
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 1000);
};

/**
 * Extracts human-readable error message from API errors, handling Blob error payloads
 * 
 * @param {Error|Object} err - Error object thrown by Axios/API
 * @param {string} [fallbackMessage='Failed to process request. Please try again.'] - Fallback error message
 * @returns {Promise<string>} Human-readable error message
 */
export const parseApiErrorMessage = async (err, fallbackMessage = 'Failed to process request. Please try again.') => {
  if (!err) return fallbackMessage;

  // Handles cases where Axios receives a Blob error response when responseType is 'blob'
  if (err.response?.data instanceof Blob) {
    try {
      const text = await err.response.data.text();
      const json = JSON.parse(text);
      if (json.message) {
        return json.message;
      }
    } catch (e) {
      // Ignore JSON parse error and continue to secondary fallbacks
    }
  }

  if (err.response?.data?.message) {
    return err.response.data.message;
  }

  if (err.message) {
    return err.message;
  }

  return fallbackMessage;
};
