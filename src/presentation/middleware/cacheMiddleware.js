/**
 * Creates an immutable cache entry
 * @param {*} response - The response data to cache
 * @returns {Object} Cache entry with response and timestamp
 */
const createCacheEntry = (response) => ({
  response,
  timestamp: Date.now(),
  lastAccessed: Date.now()
});

/**
 * Checks if a cache entry has expired
 * @param {Object} entry - Cache entry to check
 * @param {number} maxAge - Maximum age in milliseconds
 * @returns {boolean} Whether the entry has expired
 */
const isExpired = (entry, maxAge) => 
  Date.now() - entry.timestamp > maxAge;

/**
 * Updates the last accessed time for a cache entry
 * @param {Object} entry - Cache entry to update
 * @returns {Object} New cache entry with updated lastAccessed
 */
const updateAccessTime = (entry) => ({
  ...entry,
  lastAccessed: Date.now()
});

/**
 * Removes the oldest entries when cache reaches max size
 * @param {Map} cache - The cache Map
 * @param {number} maxSize - Maximum cache size
 * @returns {Map} New cache with oldest entries removed
 */
const enforceCacheLimit = (cache, maxSize) => {
  if (cache.size <= maxSize) return cache;
  
  const entries = Array.from(cache.entries())
    .sort(([, a], [, b]) => b.lastAccessed - a.lastAccessed)
    .slice(0, maxSize);
  
  return new Map(entries);
};

/**
 * Generates a unique cache key from a request
 * @param {Object} req - Express request object
 * @returns {string} Cache key
 */
const generateCacheKey = (req) => 
  `${req.method}:${req.originalUrl}`;

/**
 * Creates a caching middleware with functional programming principles
 * @param {Object} config - Middleware configuration
 * @param {number} [config.max=50] - Maximum cache size
 * @param {number} [config.maxAge=30000] - Maximum age in milliseconds
 * @returns {Function} Express middleware
 */
export const createCacheMiddleware = ({ max = 50, maxAge = 30000 }) => {
  let cacheStore = new Map();

  return (req, res, next) => {
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
      return next();
    }

    const cacheKey = generateCacheKey(req);

    if (cacheStore.has(cacheKey)) {
      const entry = cacheStore.get(cacheKey);
      
      if (!isExpired(entry, maxAge)) {
        const updatedEntry = updateAccessTime(entry);
        cacheStore = new Map(cacheStore.set(cacheKey, updatedEntry));
        return res.send(entry.response);
      } else {
        cacheStore = new Map([...cacheStore].filter(([k]) => k !== cacheKey));
      }
    }

    const originalSend = res.send;
    res.send = function(body) {
      const newEntry = createCacheEntry(body);
      
      cacheStore = new Map([...cacheStore, [cacheKey, newEntry]]);
      
      cacheStore = enforceCacheLimit(cacheStore, max);
      
      return originalSend.call(this, body);
    };

    next();
  };
};