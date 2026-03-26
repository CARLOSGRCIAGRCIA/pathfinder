import Environment from '../../data/config/environment.js';
import { isRedisConnected } from '../../data/config/redis.js';

const inMemoryRateLimit = new Map();

const cleanUpMemoryStore = () => {
  const now = Date.now();
  for (const [key, value] of inMemoryRateLimit.entries()) {
    if (now > value.resetTime) {
      inMemoryRateLimit.delete(key);
    }
  }
};

setInterval(cleanUpMemoryStore, 60000);

export const createRateLimiter = (options = {}) => {
  const {
    windowMs = Environment.RATE_LIMIT_WINDOW_MS,
    maxRequests = Environment.RATE_LIMIT_MAX_REQUESTS,
    keyGenerator = req => req.ip || req.headers['x-forwarded-for'] || 'unknown',
    skipPaths = ['/health', '/api/health', '/api-docs', '/'],
  } = options;

  const shouldSkip = path => {
    return skipPaths.some(skipPath => path === skipPath || path.startsWith(skipPath));
  };

  const redisLimiter = async (req, res, next) => {
    if (shouldSkip(req.path)) {
      return next();
    }

    if (!isRedisConnected()) {
      return next();
    }

    const redis = await import('../../data/config/redis.js');
    const client = redis.getRedisClient();

    if (!client) {
      return next();
    }

    const key = `rate_limit:${keyGenerator(req)}`;

    try {
      const current = await client.get(key);

      if (!current) {
        await client.setEx(key, Math.ceil(windowMs / 1000), '1');
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
        res.setHeader('X-RateLimit-Reset', Math.ceil((Date.now() + windowMs) / 1000));
        return next();
      }

      const count = parseInt(current, 10);

      if (count >= maxRequests) {
        const ttl = await client.ttl(key);
        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

        return res.status(429).json({
          success: false,
          message: 'Too many requests from this IP, please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter: Math.ceil(windowMs / 1000),
        });
      }

      await client.incr(key);

      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - count - 1);
      const ttl = await client.ttl(key);
      res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + ttl);

      next();
    } catch (error) {
      console.error('Rate limiter error:', error.message);
      next();
    }
  };

  const memoryLimiter = (req, res, next) => {
    if (shouldSkip(req.path)) {
      return next();
    }

    const key = keyGenerator(req);
    const now = Date.now();
    const record = inMemoryRateLimit.get(key);

    if (!record || now > record.resetTime) {
      inMemoryRateLimit.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', maxRequests - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (record.count >= maxRequests) {
      res.setHeader('X-RateLimit-Limit', maxRequests);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      return res.status(429).json({
        success: false,
        message: 'Too many requests from this IP, please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }

    record.count++;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', maxRequests - record.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

    next();
  };

  return async (req, res, next) => {
    if (isRedisConnected()) {
      return redisLimiter(req, res, next);
    }
    return memoryLimiter(req, res, next);
  };
};

export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  maxRequests: 10,
  keyGenerator: req => `auth:${req.ip}`,
});

export const apiRateLimiter = createRateLimiter({
  windowMs: Environment.RATE_LIMIT_WINDOW_MS,
  maxRequests: Environment.RATE_LIMIT_MAX_REQUESTS,
});

export default {
  createRateLimiter,
  authRateLimiter,
  apiRateLimiter,
};
