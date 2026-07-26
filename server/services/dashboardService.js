const mongoose = require('mongoose');
const Resume = require('../models/Resume');

/**
 * Service to aggregate dashboard metrics and statistics for an authenticated user
 */
class DashboardService {
  /**
   * Retrieves summary stats for the user's dashboard using an optimized single-facet aggregation query
   * 
   * @param {string|mongoose.Types.ObjectId} userId - Authenticated user's ObjectId
   * @returns {Promise<object>} Aggregated summary statistics object
   */
  async getUserDashboardStats(userId) {
    try {
      // Ensure userId is a valid Mongoose ObjectId for aggregation matching
      const userObjectId = mongoose.Types.ObjectId.isValid(userId)
        ? new mongoose.Types.ObjectId(userId)
        : userId;

      // Single aggregation query with $facet to compute all metrics in one database roundtrip
      const aggregateResult = await Resume.aggregate([
        {
          $match: { userId: userObjectId },
        },
        {
          $facet: {
            totalResumes: [{ $count: 'count' }],
            totalAnalyses: [
              { $match: { analysisStatus: 'completed' } },
              { $count: 'count' },
            ],
            totalInterviewSessions: [
              { $match: { interviewQuestionsStatus: 'completed' } },
              { $count: 'count' },
            ],
            avgAtsScore: [
              {
                $match: {
                  analysisStatus: 'completed',
                  'analysis.atsScore': { $gte: 0 },
                },
              },
              {
                $group: {
                  _id: null,
                  averageScore: { $avg: '$analysis.atsScore' },
                },
              },
            ],
          },
        },
      ]);

      const facet = aggregateResult[0] || {};
      const totalResumes = facet.totalResumes?.[0]?.count || 0;
      const totalAnalyses = facet.totalAnalyses?.[0]?.count || 0;
      const totalInterviewSessions = facet.totalInterviewSessions?.[0]?.count || 0;
      const rawAvg = facet.avgAtsScore?.[0]?.averageScore;
      const avgAtsScore = typeof rawAvg === 'number' ? Math.round(rawAvg) : 0;

      return {
        totalResumes,
        totalAnalyses,
        totalInterviewSessions,
        avgAtsScore,
      };
    } catch (error) {
      console.error('[DASHBOARD SERVICE ERROR] Failed to compute stats:', error);
      throw error;
    }
  }
}

module.exports = new DashboardService();
