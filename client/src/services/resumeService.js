import api from './api';

/**
 * Resume API Service
 * Handles uploading resumes and fetching uploaded resume history.
 */
const resumeService = {
  /**
   * Uploads resume file with optional job details to server
   * 
   * @param {FormData} formData - Multipart form data containing resume file, jobTitle, jobDescription
   * @param {function(number): void} [onUploadProgress] - Callback for tracking upload percentage (0-100)
   * @returns {Promise<object>} API response object with resume metadata
   */
  uploadResume: async (formData, onUploadProgress) => {
    const response = await api.post('/resumes/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onUploadProgress) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        }
      },
    });
    return response.data;
  },

  /**
   * Fetches list of uploaded resumes for authenticated user
   * @returns {Promise<object>} API response object with resumes list
   */
  getUserResumes: async () => {
    const response = await api.get('/resumes');
    return response.data;
  },

  /**
   * Fetches single resume details by ID
   * @param {string} id - Resume document ID
   * @returns {Promise<object>} API response object with resume details
   */
  getResumeById: async (id) => {
    const response = await api.get(`/resumes/${id}`);
    return response.data;
  },

  /**
   * Triggers Gemini AI Analysis for target resume ID
   * @param {string} id - Resume document ID
   * @returns {Promise<object>} API response object with AI analysis result
   */
  analyzeResume: async (id) => {
    const response = await api.post(`/resumes/${id}/analyze`);
    return response.data;
  },
};

export default resumeService;

