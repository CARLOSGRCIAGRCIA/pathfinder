const createLRUCache = maxSize => {
  const cache = new Map();
  const order = new Map();
  const timeouts = new Map();
  let counter = 0;

  const clearKey = key => {
    if (cache.has(key)) {
      cache.delete(key);
      order.delete(key);
      if (timeouts.has(key)) {
        clearTimeout(timeouts.get(key));
        timeouts.delete(key);
      }
    }
  };

  const setExpirationTimer = key => {
    if (timeouts.has(key)) {
      clearTimeout(timeouts.get(key));
    }
    const timeoutId = setTimeout(() => clearKey(key), 20000);
    timeouts.set(key, timeoutId);
  };

  const get = key => {
    if (cache.has(key)) {
      order.set(key, counter++);
      setExpirationTimer(key);
      return cache.get(key);
    }
    return undefined;
  };

  const set = (key, value) => {
    if (cache.size >= maxSize && !cache.has(key)) {
      const lruKey = Array.from(order.entries()).reduce((a, b) => (a[1] < b[1] ? a : b))[0];
      clearKey(lruKey);
    }
    cache.set(key, value);
    order.set(key, counter++);
    setExpirationTimer(key);
  };

  const clear = () => {
    Array.from(timeouts.values()).forEach(timeoutId => clearTimeout(timeoutId));
    cache.clear();
    order.clear();
    timeouts.clear();
  };

  return { get, set, clear };
};

const memoizeFindOptimalPath = (func, cacheSize = 100) => {
  const cache = createLRUCache(cacheSize);

  return function (start, end, obstacles, waypoints, width, height, userPreferences) {
    const serializePoints = points =>
      points
        .map(p => `${p.x},${p.y}`)
        .sort()
        .join(';');

    const keyParts = [
      `${start.x},${start.y}`,
      `${end.x},${end.y}`,
      serializePoints(obstacles),
      serializePoints(waypoints),
      width,
      height,
    ];

    const key = keyParts.join('|');

    const cachedResult = cache.get(key);
    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const result = func(start, end, obstacles, waypoints, width, height, userPreferences);
    cache.set(key, result);
    return result;
  };
};

export default memoizeFindOptimalPath;
