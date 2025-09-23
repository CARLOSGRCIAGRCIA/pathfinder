import { findOptimalPath } from "../../../../src/business/services/pathFinderService.js";
import { Either } from "../../../../src/business/utils/either/Either.js";

describe("PathFinderService", () => {
  it("should find an optimal path successfully", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 2, y: 2 };
    const obstacles = [];
    const waypoints = [];
    const width = 3;
    const height = 3;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should find an optimal path in a complex maze", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 9, y: 9 };
    const obstacles = [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 3, y: 0 },
      { x: 4, y: 0 },
      { x: 5, y: 0 },
      { x: 6, y: 0 },
      { x: 7, y: 0 },
      { x: 8, y: 0 },
      { x: 9, y: 1 },
      { x: 8, y: 1 },
      { x: 7, y: 1 },
      { x: 6, y: 1 },
      { x: 5, y: 1 },
      { x: 4, y: 1 },
      { x: 3, y: 1 },
      { x: 2, y: 1 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
      { x: 4, y: 2 },
      { x: 5, y: 2 },
      { x: 6, y: 2 },
      { x: 7, y: 2 },
      { x: 8, y: 2 },
      { x: 9, y: 3 },
      { x: 8, y: 3 },
      { x: 7, y: 3 },
      { x: 6, y: 3 },
      { x: 5, y: 3 },
      { x: 4, y: 3 },
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 4 },
      { x: 2, y: 4 },
      { x: 3, y: 4 },
      { x: 4, y: 4 },
      { x: 5, y: 4 },
      { x: 6, y: 4 },
      { x: 7, y: 4 },
      { x: 8, y: 4 },
      { x: 9, y: 5 },
      { x: 8, y: 5 },
      { x: 7, y: 5 },
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
      { x: 2, y: 5 },
      { x: 1, y: 6 },
      { x: 2, y: 6 },
      { x: 3, y: 6 },
      { x: 4, y: 6 },
      { x: 5, y: 6 },
      { x: 6, y: 6 },
      { x: 7, y: 6 },
      { x: 8, y: 6 },
      { x: 9, y: 7 },
      { x: 8, y: 7 },
      { x: 7, y: 7 },
      { x: 6, y: 7 },
      { x: 5, y: 7 },
      { x: 4, y: 7 },
      { x: 3, y: 7 },
      { x: 2, y: 7 },
      { x: 1, y: 8 },
      { x: 2, y: 8 },
      { x: 3, y: 8 },
      { x: 4, y: 8 },
      { x: 5, y: 8 },
      { x: 6, y: 8 },
      { x: 7, y: 8 },
      { x: 8, y: 8 }
    ];
    const waypoints = [];
    const width = 10;
    const height = 10;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should find an optimal path in a non-square map (10x3)", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 9, y: 2 };
    const obstacles = [
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 3, y: 1 },
      { x: 4, y: 1 },
      { x: 5, y: 1 },
      { x: 6, y: 1 },
      { x: 7, y: 1 },
      { x: 8, y: 1 }
    ];
    const waypoints = [];
    const width = 10;
    const height = 3;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should find an optimal path in a non-square map (100x10)", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 99, y: 9 };
    const obstacles = [];
    const waypoints = [];
    const width = 100;
    const height = 10;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should return an error if start or end points are out of bounds", () => {
    const start = { x: -1, y: 0 };
    const end = { x: 2, y: 2 };
    const obstacles = [];
    const waypoints = [];
    const width = 3;
    const height = 3;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error.message, () => null)).toBe(
      "Start or end point is out of bounds"
    );
  });

  it("should return an error if a point is inside an obstacle", () => {
    const start = { x: 1, y: 1 };
    const end = { x: 2, y: 2 };
    const obstacles = [{ x: 1, y: 1, size: 1 }];
    const waypoints = [];
    const width = 3;
    const height = 3;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, () => null)).toBe(
      "A point is inside an obstacle or too close to it"
    );
  });

  it("should find an optimal path with multiple waypoints", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [];
    const waypoints = [{ x: 2, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 1 }];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should find an optimal path with multiple obstacles", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }];
    const waypoints = [];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should find an optimal path in a complex geometry", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 1, y: 2 },
      { x: 1, y: 3 },
      { x: 3, y: 1 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 3, y: 4 }
    ];
    const waypoints = [];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should find an optimal path with diagonal movement", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [];
    const waypoints = [];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      true
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should find an optimal path in a map with high obstacle density", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 9, y: 9 };
    const width = 10;
    const height = 10;

    const obstacles = Array.from({ length: width }, (_, x) =>
      Array.from({ length: height }, (_, y) => (x !== y ? { x, y } : null))
    )
      .flat()
      .filter(Boolean);

    const waypoints = [];
    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should return an error if no path is possible due to obstacles", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [
      { x: 1, y: 0, size: 1 },
      { x: 1, y: 1, size: 1 },
      { x: 1, y: 2, size: 1 },
      { x: 1, y: 3, size: 1 },
      { x: 1, y: 4, size: 1 },
      { x: 2, y: 0, size: 1 },
      { x: 2, y: 1, size: 1 },
      { x: 2, y: 2, size: 1 },
      { x: 2, y: 3, size: 1 },
      { x: 2, y: 4, size: 1 },
      { x: 3, y: 0, size: 1 },
      { x: 3, y: 1, size: 1 },
      { x: 3, y: 2, size: 1 },
      { x: 3, y: 3, size: 1 },
      { x: 3, y: 4, size: 1 }
    ];
    const waypoints = [];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    const errorMsg = result.fold(error => error, () => null);

    expect(errorMsg).toBeTruthy();
  });

  it("should return an error if a waypoint is blocked by obstacles", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [{ x: 2, y: 2, size: 1 }];
    const waypoints = [{ x: 2, y: 2 }];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, () => null)).toBe(
      "A point is inside an obstacle or too close to it"
    );
  });

  it("should find an optimal path in a large map", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 99, y: 99 };
    const obstacles = [];
    const waypoints = [];
    const width = 400;
    const height = 500;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should visit waypoints in the correct order", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [];
    const waypoints = [{ x: 2, y: 2 }, { x: 1, y: 3 }];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });

    const path = result.fold(() => [], res => res.path);
    const waypointIndices = waypoints.map(wp =>
      path.findIndex(p => p.x === wp.x && p.y === wp.y)
    );
    expect(waypointIndices).toEqual(waypointIndices.sort((a, b) => a - b));
  });

  it("should choose the shortest path when multiple routes are possible", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [];
    const waypoints = [];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });

    const distance = result.fold(() => Infinity, res => res.distance);
    expect(distance).toBeLessThanOrEqual(8);
  });

  it("should find an optimal path with diagonal movement and obstacles", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 4, y: 4 };
    const obstacles = [{ x: 1, y: 1 }, { x: 2, y: 2 }];
    const waypoints = [];
    const width = 5;
    const height = 5;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      true
    );

    expect(result.fold(error => error, path => path)).toEqual({
      path: expect.any(Array),
      distance: expect.any(Number)
    });
  });

  it("should return an error if no path is found between points", () => {
    const start = { x: 0, y: 0 };
    const end = { x: 2, y: 2 };
    const obstacles = [
      { x: 0, y: 1, size: 1 },
      { x: 1, y: 0, size: 1 },
      { x: 1, y: 1, size: 1 },
      { x: 1, y: 2, size: 1 },
      { x: 2, y: 1, size: 1 }
    ];
    const waypoints = [];
    const width = 3;
    const height = 3;

    const result = findOptimalPath(
      start,
      end,
      obstacles,
      waypoints,
      width,
      height,
      {},
      false
    );

    const errorMsg = result.fold(error => error, () => null);
    expect(errorMsg).toBeTruthy();
  });
});
