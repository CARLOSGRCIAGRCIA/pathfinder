import { findOptimalPath } from '../../../../src/business/services/pathFinderService.js';

describe('PathFinderService', () => {
  describe('findOptimalPath', () => {
    it('should return a valid path for simple case', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 2, y: 2 };
      const obstacles = [];
      const waypoints = [];
      const width = 5;
      const height = 5;

      const result = findOptimalPath(start, end, obstacles, waypoints, width, height, {});

      expect(result.isRight()).toBe(true);
      result.fold(
        error => fail(`Expected success but got error: ${error.message}`),
        path => {
          expect(path).toHaveProperty('path');
          expect(path).toHaveProperty('distance');
          expect(path).toHaveProperty('cost');
          expect(path).toHaveProperty('terrainGrid');
        }
      );
    });

    it('should return an error if start is out of bounds', () => {
      const start = { x: -1, y: 0 };
      const end = { x: 2, y: 2 };
      const obstacles = [];
      const waypoints = [];
      const width = 5;
      const height = 5;

      const result = findOptimalPath(start, end, obstacles, waypoints, width, height, {});

      expect(result.isLeft()).toBe(true);
    });

    it('should return an error if end is out of bounds', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 10, y: 10 };
      const obstacles = [];
      const waypoints = [];
      const width = 5;
      const height = 5;

      const result = findOptimalPath(start, end, obstacles, waypoints, width, height, {});

      expect(result.isLeft()).toBe(true);
    });

    it('should return a path avoiding obstacles', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 4, y: 4 };
      const obstacles = [{ x: 2, y: 2, size: 1 }];
      const waypoints = [];
      const width = 5;
      const height = 5;

      const result = findOptimalPath(start, end, obstacles, waypoints, width, height, {});

      expect(result.isRight()).toBe(true);
    });

    it('should return a path with waypoints', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 4, y: 4 };
      const obstacles = [];
      const waypoints = [{ x: 2, y: 2 }];
      const width = 5;
      const height = 5;

      const result = findOptimalPath(start, end, obstacles, waypoints, width, height, {});

      expect(result.isRight()).toBe(true);
      result.fold(
        error => fail(`Expected success but got error: ${error.message}`),
        path => {
          expect(path.path.length).toBeGreaterThan(0);
          expect(path.distance).toBeGreaterThan(0);
        }
      );
    });

    it('should handle waypoints', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 4, y: 4 };
      const obstacles = [];
      const waypoints = [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
      ];
      const width = 5;
      const height = 5;

      const result = findOptimalPath(start, end, obstacles, waypoints, width, height, {});

      expect(result.isRight()).toBe(true);
    });

    it('should handle terrain grid', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 2, y: 2 };
      const obstacles = [];
      const waypoints = [];
      const width = 5;
      const height = 5;
      const terrainGrid = [
        ['plains', 'plains', 'plains', 'plains', 'plains'],
        ['plains', 'road', 'road', 'plains', 'plains'],
        ['plains', 'road', 'plains', 'plains', 'plains'],
        ['plains', 'plains', 'plains', 'forest', 'plains'],
        ['plains', 'plains', 'plains', 'plains', 'plains'],
      ];

      const result = findOptimalPath(
        start,
        end,
        obstacles,
        waypoints,
        width,
        height,
        {},
        1,
        terrainGrid
      );

      expect(result.isRight()).toBe(true);
      result.fold(
        error => fail(`Expected success but got error: ${error.message}`),
        path => {
          expect(path.terrainGrid).toBeDefined();
          expect(path.cost).toBeDefined();
        }
      );
    });
  });
});
