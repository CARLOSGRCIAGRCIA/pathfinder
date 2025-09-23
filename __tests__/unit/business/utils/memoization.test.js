import memoizeFindOptimalPath from "../../../../src/business/utils/memoization.js";

describe('memoizeFindOptimalPath', () => {
  let mockFindOptimalPath;
  let memoizedFindOptimalPath;

  beforeEach(() => {
    mockFindOptimalPath = jest.fn((start, end, obstacles, waypoints, width, height, userPreferences) => {
      return `Path from (${start.x},${start.y}) to (${end.x},${end.y})`;
    });

    memoizedFindOptimalPath = memoizeFindOptimalPath(mockFindOptimalPath, 2);
  });

  it('should call the original function when the cache is empty', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 10, y: 10 };
    const obstacles = [];
    const waypoints = [];
    const width = 100;
    const height = 100;
    const userPreferences = {};

    const result = memoizedFindOptimalPath(start, end, obstacles, waypoints, width, height, userPreferences);

    expect(mockFindOptimalPath).toHaveBeenCalledTimes(1);
    expect(result).toBe('Path from (0,0) to (10,10)');
  });

  it('should return cached result when the same input is provided again', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 10, y: 10 };
    const obstacles = [];
    const waypoints = [];
    const width = 100;
    const height = 100;
    const userPreferences = {};

    memoizedFindOptimalPath(start, end, obstacles, waypoints, width, height, userPreferences);
    const result = memoizedFindOptimalPath(start, end, obstacles, waypoints, width, height, userPreferences);

    expect(mockFindOptimalPath).toHaveBeenCalledTimes(1);
    expect(result).toBe('Path from (0,0) to (10,10)');
  });

  it('should evict the least recently used item when the cache is full', () => {
    const start1 = { x: 0, y: 0 };
    const end1 = { x: 10, y: 10 };
    const start2 = { x: 5, y: 5 };
    const end2 = { x: 15, y: 15 };
    const start3 = { x: 20, y: 20 };
    const end3 = { x: 30, y: 30 };
    const obstacles = [];
    const waypoints = [];
    const width = 100;
    const height = 100;
    const userPreferences = {};

    memoizedFindOptimalPath(start1, end1, obstacles, waypoints, width, height, userPreferences);
    memoizedFindOptimalPath(start2, end2, obstacles, waypoints, width, height, userPreferences);

    memoizedFindOptimalPath(start3, end3, obstacles, waypoints, width, height, userPreferences);

    expect(mockFindOptimalPath).toHaveBeenCalledTimes(3);

    memoizedFindOptimalPath(start1, end1, obstacles, waypoints, width, height, userPreferences);
    expect(mockFindOptimalPath).toHaveBeenCalledTimes(4);
  });

  it('should handle malformed points in obstacles and waypoints', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 10, y: 10 };
    const obstacles = [{ x: null, y: null }, { x: undefined, y: undefined }]; 
    const waypoints = [{ x: 'invalid', y: 'invalid' }];
    const width = 100;
    const height = 100;
    const userPreferences = {};

    const result = memoizedFindOptimalPath(start, end, obstacles, waypoints, width, height, userPreferences);

    expect(mockFindOptimalPath).toHaveBeenCalledTimes(1);
    expect(result).toBe('Path from (0,0) to (10,10)');
  });

  it('should handle empty obstacles and waypoints', () => {
    const start = { x: 0, y: 0 };
    const end = { x: 10, y: 10 };
    const obstacles = [];
    const waypoints = [];
    const width = 100;
    const height = 100;
    const userPreferences = {};

    const result = memoizedFindOptimalPath(start, end, obstacles, waypoints, width, height, userPreferences);

    expect(mockFindOptimalPath).toHaveBeenCalledTimes(1);
    expect(result).toBe('Path from (0,0) to (10,10)');
  });
});