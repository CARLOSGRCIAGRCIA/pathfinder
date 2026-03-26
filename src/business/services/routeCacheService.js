import RouteCache from '../../data/models/RouteCache.js';
import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';

const DEFAULT_CACHE_TTL_HOURS = 24;

const routeCacheService = {
  getCachedRoute: async params => {
    try {
      const cacheKey = RouteCache.generateKey(params);
      const cached = await RouteCache.findOne({ cacheKey });

      if (!cached) {
        return Either.left(new AppError('Cache miss', 404, 'CACHE_MISS'));
      }

      if (cached.expiresAt && cached.expiresAt < new Date()) {
        await RouteCache.deleteOne({ _id: cached._id });
        return Either.left(new AppError('Cache expired', 404, 'CACHE_EXPIRED'));
      }

      await cached.incrementHits();

      return Either.right({
        path: cached.result.path,
        distance: cached.result.distance,
        cost: cached.result.cost,
        cached: true,
        hits: cached.hits,
        createdAt: cached.createdAt,
      });
    } catch (error) {
      console.error('Route cache get error:', error);
      return Either.left(new AppError('Cache retrieval failed', 500, 'CACHE_ERROR'));
    }
  },

  setCachedRoute: async (params, result, ttlHours = DEFAULT_CACHE_TTL_HOURS) => {
    try {
      const cacheKey = RouteCache.generateKey(params);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + ttlHours);

      const cacheEntry = await RouteCache.findOneAndUpdate(
        { cacheKey },
        {
          $set: {
            startPoint: params.start,
            endPoint: params.end,
            waypoints: params.waypoints || [],
            obstacles: params.obstacles || [],
            width: params.width,
            height: params.height,
            terrainGridHash: params.terrainGrid ? 'provided' : 'default',
            result: {
              path: result.path,
              distance: result.distance,
              cost: result.cost,
            },
            expiresAt,
            hits: 0,
          },
        },
        { upsert: true, new: true }
      );

      return Either.right({
        cached: true,
        cacheId: cacheEntry._id,
        expiresAt,
      });
    } catch (error) {
      console.error('Route cache set error:', error);
      return Either.left(new AppError('Cache storage failed', 500, 'CACHE_ERROR'));
    }
  },

  invalidateCache: async pattern => {
    try {
      const result = await RouteCache.deleteMany({
        cacheKey: { $regex: pattern },
      });
      return Either.right({ deleted: result.deletedCount });
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return Either.left(new AppError('Cache invalidation failed', 500, 'CACHE_ERROR'));
    }
  },

  clearAllCache: async () => {
    try {
      const result = await RouteCache.deleteMany({});
      return Either.right({ deleted: result.deletedCount });
    } catch (error) {
      console.error('Cache clear error:', error);
      return Either.left(new AppError('Cache clear failed', 500, 'CACHE_ERROR'));
    }
  },

  getCacheStats: async () => {
    try {
      const [total, expired, byHits] = await Promise.all([
        RouteCache.countDocuments(),
        RouteCache.countDocuments({ expiresAt: { $lt: new Date() } }),
        RouteCache.aggregate([{ $group: { _id: null, totalHits: { $sum: '$hits' } } }]),
      ]);

      const [oldest, newest] = await Promise.all([
        RouteCache.findOne().sort({ createdAt: 1 }).select('createdAt'),
        RouteCache.findOne().sort({ createdAt: -1 }).select('createdAt'),
      ]);

      return Either.right({
        totalEntries: total,
        expiredEntries: expired,
        totalHits: byHits[0]?.totalHits || 0,
        oldestEntry: oldest?.createdAt,
        newestEntry: newest?.createdAt,
      });
    } catch (error) {
      console.error('Cache stats error:', error);
      return Either.left(new AppError('Failed to get cache stats', 500, 'CACHE_ERROR'));
    }
  },

  cleanupExpired: async () => {
    try {
      const result = await RouteCache.deleteMany({
        expiresAt: { $lt: new Date() },
      });
      return Either.right({ deleted: result.deletedCount });
    } catch (error) {
      console.error('Cleanup error:', error);
      return Either.left(new AppError('Cleanup failed', 500, 'CACHE_ERROR'));
    }
  },
};

export default routeCacheService;
