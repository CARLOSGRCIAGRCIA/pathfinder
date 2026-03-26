import analyticsService from '../../business/services/analyticsService.js';

export const getOverview = async (req, res, next) => {
  try {
    const { days = 7 } = req.query;
    const stats = await analyticsService.getRequestStats(parseInt(days));

    if (!stats) {
      return res.status(503).json({
        success: false,
        message: 'Analytics service unavailable',
      });
    }

    res.json({
      success: true,
      data: {
        totalRequests: stats.totalRequests,
        uniqueUsers: stats.uniqueUsers,
        avgResponseTime: stats.avgResponseTime,
        errorRate: stats.errorRate,
        period: `${days} days`,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getEndpoints = async (req, res, next) => {
  try {
    const topEndpoints = await analyticsService.getTopEndpoints(20);

    res.json({
      success: true,
      data: {
        endpoints: topEndpoints,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getPerformance = async (req, res, next) => {
  try {
    const responseTime = await analyticsService.getResponseTimeStats();

    res.json({
      success: true,
      data: responseTime,
    });
  } catch (error) {
    next(error);
  }
};

export const getErrors = async (req, res, next) => {
  try {
    const errorRate = await analyticsService.getErrorRate();
    const statusDistribution = await analyticsService.getStatusCodeDistribution();

    res.json({
      success: true,
      data: {
        errorRate,
        statusCodes: statusDistribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

export default {
  getOverview,
  getEndpoints,
  getPerformance,
  getErrors,
};
