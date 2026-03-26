import TrackingService from './TrackingService.js';

class AnalyticsService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 60000;
  }

  async getRequestStats(days = 7) {
    const cacheKey = `stats_${days}`;
    const cached = this.cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }

    try {
      const stats = await TrackingService.getStats(days);

      this.cache.set(cacheKey, {
        timestamp: Date.now(),
        data: stats,
      });

      return stats;
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }

  async getEndpointStats(endpoint, days = 7) {
    const allStats = await this.getRequestStats(days);

    if (!allStats) return null;

    const endpointStats = allStats.endpointStats || [];
    return endpointStats.find(e => e.endpoint === endpoint);
  }

  async getResponseTimeStats() {
    const stats = await this.getRequestStats(1);

    if (!stats) return null;

    return {
      avg: stats.avgResponseTime || 0,
      min: stats.minResponseTime || 0,
      max: stats.maxResponseTime || 0,
      p95: stats.p95ResponseTime || 0,
      p99: stats.p99ResponseTime || 0,
    };
  }

  async getErrorRate() {
    const stats = await this.getRequestStats(1);

    if (!stats) return null;

    const total = stats.totalRequests || 0;
    const errors = stats.errorRequests || 0;

    return {
      count: errors,
      percentage: total > 0 ? (errors / total) * 100 : 0,
      total,
    };
  }

  async getTopEndpoints(limit = 10) {
    const stats = await this.getRequestStats(7);

    if (!stats || !stats.endpointStats) return [];

    return stats.endpointStats
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map(e => ({
        endpoint: e.endpoint,
        method: e.method,
        hits: e.count,
        avgResponseTime: e.avgResponseTime,
      }));
  }

  async getStatusCodeDistribution() {
    const stats = await this.getRequestStats(1);

    if (!stats) return {};

    const distribution = {};

    if (stats.statusCodes) {
      for (const [code, count] of Object.entries(stats.statusCodes)) {
        const category = `${Math.floor(code / 100)}xx`;
        distribution[category] = (distribution[category] || 0) + count;
      }
    }

    return distribution;
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new AnalyticsService();
