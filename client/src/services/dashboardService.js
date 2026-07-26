import api from './api';

/**
 * Dashboard API Service
 * Handles fetching dashboard summary metrics and activity stats for authenticated user.
 */
const dashboardService = {
  /**
   * Fetches dashboard metrics (total resumes, analyses, interview sessions, average score)
   * @returns {Promise<object>} Dashboard API response object
   */
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};

export default dashboardService;
