import api from './api';

/**
 * Service module encapsulating all authentication-related API calls.
 */
const authService = {
  /**
   * Registers a new user account.
   * @param {Object} userData - { fullName, email, password }
   * @returns {Promise<Object>} Backend API response payload
   */
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  /**
   * Authenticates user and retrieves JWT token with user profile.
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>} Backend API response payload containing token & user data
   */
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  /**
   * Retrieves profile details of currently authenticated user.
   * @returns {Promise<Object>} Backend API response payload containing user profile
   */
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },
};

export default authService;
