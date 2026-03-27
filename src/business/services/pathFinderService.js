import Heap from 'heap';
import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';
import { measureExecutionTime } from '../utils/monitoring.js';

const THRESHOLD = 10;

const TERRAIN_TYPES = {
  PLAINS: 'plains',
  ROAD: 'road',
  FOREST: 'forest',
  MOUNTAIN: 'mountain',
  WATER: 'water',
  SAND: 'sand',
  SWAMP: 'swamp',
  WALL: 'wall',
};

const TERRAIN_COSTS = {
  [TERRAIN_TYPES.PLAINS]: 1.0,
  [TERRAIN_TYPES.ROAD]: 0.8,
  [TERRAIN_TYPES.FOREST]: 1.5,
  [TERRAIN_TYPES.MOUNTAIN]: 3.0,
  [TERRAIN_TYPES.WATER]: Infinity,
  [TERRAIN_TYPES.SAND]: 1.3,
  [TERRAIN_TYPES.SWAMP]: 2.5,
  [TERRAIN_TYPES.WALL]: Infinity,
};

const OBSTACLE_TYPES = {
  CIRCLE: 'circle',
  RECTANGLE: 'rectangle',
  POLYGON: 'polygon',
};

class Obstacle {
  constructor(obstacle) {
    this.id = obstacle._id || obstacle.id;
    this.x = obstacle.x;
    this.y = obstacle.y;
    this.size = obstacle.size || 1;
    this.type = obstacle.type || 'wall';
    this.rotation = obstacle.rotation || 0;

    this._initShape();
  }

  _initShape() {
    this.radius = this.size / 2;
    this.width = this.size;
    this.height = this.size;

    this.minX = this.x - this.radius;
    this.maxX = this.x + this.radius;
    this.minY = this.y - this.radius;
    this.maxY = this.y + this.radius;
  }

  containsPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }

  getDistanceToPoint(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance - this.radius;
  }

  intersectsLine(x1, y1, x2, y2) {
    if (this.containsPoint(x1, y1) || this.containsPoint(x2, y2)) {
      return true;
    }

    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - this.x;
    const fy = y1 - this.y;

    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - this.radius * this.radius;

    let discriminant = b * b - 4 * a * c;

    if (discriminant < 0) {
      return false;
    }

    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);

    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
  }

  getBoundingBox(padding = 0) {
    return {
      minX: this.x - this.radius - padding,
      maxX: this.x + this.radius + padding,
      minY: this.y - this.radius - padding,
      maxY: this.y + this.radius + padding,
    };
  }
}

class ObstacleManager {
  constructor(obstacles) {
    this.obstacles = obstacles.map(o => new Obstacle(o));
    this._buildGrid();
  }

  _buildGrid() {
    this.gridSize = 20;
    this.obstacleGrid = new Map();

    for (const obstacle of this.obstacles) {
      const box = obstacle.getBoundingBox(5);
      const minGridX = Math.floor(box.minX / this.gridSize);
      const maxGridX = Math.floor(box.maxX / this.gridSize);
      const minGridY = Math.floor(box.minY / this.gridSize);
      const maxGridY = Math.floor(box.maxY / this.gridSize);

      for (let gx = minGridX; gx <= maxGridX; gx++) {
        for (let gy = minGridY; gy <= maxGridY; gy++) {
          const key = `${gx},${gy}`;
          if (!this.obstacleGrid.has(key)) {
            this.obstacleGrid.set(key, []);
          }
          this.obstacleGrid.get(key).push(obstacle);
        }
      }
    }
  }

  _getNearbyObstacles(x, y, radius = 5) {
    const nearby = [];
    const minGridX = Math.floor((x - radius) / this.gridSize);
    const maxGridX = Math.floor((x + radius) / this.gridSize);
    const minGridY = Math.floor((y - radius) / this.gridSize);
    const maxGridY = Math.floor((y + radius) / this.gridSize);

    for (let gx = minGridX; gx <= maxGridX; gx++) {
      for (let gy = minGridY; gy <= maxGridY; gy++) {
        const key = `${gx},${gy}`;
        const cellObstacles = this.obstacleGrid.get(key);
        if (cellObstacles) {
          nearby.push(...cellObstacles);
        }
      }
    }

    return [...new Set(nearby)];
  }

  isColliding(x, y, margin = 0) {
    const nearby = this._getNearbyObstacles(x, y, margin + 2);
    for (const obstacle of nearby) {
      if (obstacle.containsPoint(x, y)) {
        return true;
      }
    }
    return false;
  }

  getMinDistanceToObstacle(x, y) {
    const nearby = this._getNearbyObstacles(x, y);
    let minDist = Infinity;
    for (const obstacle of nearby) {
      const dist = obstacle.getDistanceToPoint(x, y);
      if (dist < minDist) {
        minDist = dist;
      }
    }
    return minDist;
  }

  getPathCollisions(path, margin = 1) {
    const collisions = [];
    for (let i = 0; i < path.length - 1; i++) {
      const nearby = this._getNearbyObstacles(path[i].x, path[i].y, 5);
      for (const obstacle of nearby) {
        if (obstacle.intersectsLine(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y)) {
          collisions.push({
            segmentStart: path[i],
            segmentEnd: path[i + 1],
            obstacle: obstacle.id,
          });
        }
      }
    }
    return collisions;
  }
}

const createNode = (x, y, g = 0, h = 0, parent = null, terrain = TERRAIN_TYPES.PLAINS) => {
  return { x, y, g, h, f: g + h, parent, terrain };
};

const isEqual = (nodeA, nodeB) => {
  return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
};

const calculateDistance = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return Infinity;
  }
  return Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
};

const getTerrainCost = terrainType => {
  const cost = TERRAIN_COSTS[terrainType];
  return cost === undefined ? TERRAIN_COSTS[TERRAIN_TYPES.PLAINS] : cost;
};

const heldKarp = (start, waypoints) => {
  if (waypoints.length === 0) {
    return [];
  }
  const n = waypoints.length;
  const memo = new Map();

  const dp = (mask, pos) => {
    if (mask === (1 << n) - 1) {
      return {
        distance: calculateDistance(waypoints[pos], start),
        path: [pos],
      };
    }

    const key = `${mask},${pos}`;
    if (memo.has(key)) {
      return memo.get(key);
    }

    let minDistance = Infinity;
    let bestPath = [];

    for (let i = 0; i < n; i++) {
      if (!(mask & (1 << i))) {
        const newMask = mask | (1 << i);
        const result = dp(newMask, i);
        const distance = calculateDistance(waypoints[pos], waypoints[i]) + result.distance;

        if (distance < minDistance) {
          minDistance = distance;
          bestPath = [pos, ...result.path];
        }
      }
    }

    memo.set(key, { distance: minDistance, path: bestPath });
    return { distance: minDistance, path: bestPath };
  };

  const result = dp(0, 0);
  return result.path.map(index => waypoints[index]);
};

const twoOpt = (start, waypoints) => {
  let improved = true;
  let bestOrder = [...waypoints];
  let bestDistance = calculateTotalDistance(start, bestOrder);

  while (improved) {
    improved = false;
    for (let i = 0; i < bestOrder.length - 1; i++) {
      for (let j = i + 1; j < bestOrder.length; j++) {
        const newOrder = swap(bestOrder, i, j);
        const newDistance = calculateTotalDistance(start, newOrder);
        if (newDistance < bestDistance) {
          bestOrder = newOrder;
          bestDistance = newDistance;
          improved = true;
        }
      }
    }
  }

  return bestOrder;
};

const swap = (array, i, j) => {
  const newArray = [...array];
  [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  return newArray;
};

const calculateTotalDistance = (start, order) => {
  let totalDistance = calculateDistance(start, order[0]);
  for (let i = 0; i < order.length - 1; i++) {
    totalDistance += calculateDistance(order[i], order[i + 1]);
  }
  totalDistance += calculateDistance(order[order.length - 1], start);
  return totalDistance;
};

const orderWaypoints = (start, waypoints) => {
  if (waypoints.length < THRESHOLD) {
    return heldKarp(start, waypoints);
  } else {
    return twoOpt(start, waypoints);
  }
};

const getTerrainAt = (x, y, terrainGrid, defaultTerrain = TERRAIN_TYPES.PLAINS) => {
  if (!terrainGrid || !Array.isArray(terrainGrid) || terrainGrid.length === 0) {
    return defaultTerrain;
  }

  const row = terrainGrid[Math.floor(y)];
  if (!row) {
    return defaultTerrain;
  }

  const terrainValue = row[Math.floor(x)];
  if (terrainValue === undefined || terrainValue === null) {
    return defaultTerrain;
  }

  if (typeof terrainValue === 'string') {
    return terrainValue;
  }

  if (typeof terrainValue === 'number') {
    const terrainKeys = Object.keys(TERRAIN_TYPES);
    return terrainKeys[terrainValue % terrainKeys.length] || defaultTerrain;
  }

  return defaultTerrain;
};

const getNeighbors = (node, width, height, obstacleManager, margin = 2, terrainGrid = null) => {
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
    [-2, -1],
    [-2, 1],
    [2, -1],
    [2, 1],
    [-1, -2],
    [-1, 2],
    [1, -2],
    [1, 2],
  ];

  const neighbors = [];

  for (const [dx, dy] of directions) {
    const newX = node.x + dx;
    const newY = node.y + dy;

    if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
      if (!obstacleManager.isColliding(newX, newY, margin)) {
        const terrain = terrainGrid ? getTerrainAt(newX, newY, terrainGrid) : TERRAIN_TYPES.PLAINS;
        neighbors.push(createNode(newX, newY, 0, 0, null, terrain));
      }
    }
  }

  return neighbors;
};

const calculateHeuristic = (node, endNode) => {
  return Math.sqrt(Math.pow(node.x - endNode.x, 2) + Math.pow(node.y - endNode.y, 2));
};

const calculateCost = (nodeA, nodeB) => {
  const dx = Math.abs(nodeA.x - nodeB.x);
  const dy = Math.abs(nodeA.y - nodeB.y);
  const baseCost =
    dx > 1 || dy > 1 ? Math.sqrt(dx * dx + dy * dy) : dx === 0 || dy === 0 ? 1 : Math.sqrt(2);
  const terrainCost = getTerrainCost(nodeB.terrain);
  return baseCost * terrainCost;
};

const reconstructPath = (node, terrainGrid = null) => {
  const path = [];
  let current = node;

  while (current) {
    path.unshift({
      x: current.x,
      y: current.y,
      terrain: current.terrain,
    });
    current = current.parent;
  }

  let totalDistance = 0;
  let totalCost = 0;

  for (let i = 1; i < path.length; i++) {
    const baseDist = calculateDistance(path[i - 1], path[i]);
    const terrain = terrainGrid
      ? getTerrainAt(path[i].x, path[i].y, terrainGrid)
      : path[i].terrain || TERRAIN_TYPES.PLAINS;
    const terrainCost = getTerrainCost(terrain);

    totalDistance += baseDist;
    totalCost += baseDist * terrainCost;
  }

  return { path, distance: totalDistance, cost: totalCost };
};

const catmullRomSpline = (p0, p1, p2, p3, numPoints = 10) => {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const t = i / (numPoints - 1);
    const t2 = t * t;
    const t3 = t2 * t;

    const x =
      0.5 *
      (2 * p1.x +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

    const y =
      0.5 *
      (2 * p1.y +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

    points.push({ x: Math.round(x), y: Math.round(y) });
  }
  return points;
};

const smoothPath = (path, obstacleManager, width, height) => {
  if (path.length < 4) {
    return path;
  }

  const smoothed = [];

  for (let i = 0; i < path.length - 1; i++) {
    const p0 = path[Math.max(0, i - 1)];
    const p1 = path[i];
    const p2 = path[Math.min(path.length - 1, i + 1)];
    const p3 = path[Math.min(path.length - 1, i + 2)];

    const segment = catmullRomSpline(p0, p1, p2, p3, 5);

    for (let j = 0; j < segment.length - 1; j++) {
      const pt = segment[j];
      if (!obstacleManager.isColliding(pt.x, pt.y, 1)) {
        smoothed.push(pt);
      } else {
        smoothed.push(p1);
        break;
      }
    }
  }

  smoothed.push(path[path.length - 1]);

  const result = [smoothed[0]];
  for (let i = 1; i < smoothed.length; i++) {
    const last = result[result.length - 1];
    if (last.x !== smoothed[i].x || last.y !== smoothed[i].y) {
      result.push(smoothed[i]);
    }
  }

  return result;
};

const findPathBetweenTwoPoints = (
  start,
  end,
  obstacleManager,
  width,
  height,
  margin = 2,
  terrainGrid = null
) => {
  const startTerrain = terrainGrid
    ? getTerrainAt(start.x, start.y, terrainGrid)
    : TERRAIN_TYPES.PLAINS;

  const startNode = createNode(start.x, start.y, 0, 0, null, startTerrain);
  const endNode = { x: end.x, y: end.y };

  const openList = new Heap((a, b) => a.f - b.f);
  openList.push(startNode);

  const closedSet = new Set();
  const gScores = new Map();

  gScores.set(`${start.x},${start.y}`, 0);

  while (openList.size() > 0) {
    const currentNode = openList.pop();

    if (isEqual(currentNode, endNode)) {
      return reconstructPath(currentNode, terrainGrid);
    }

    const key = `${currentNode.x},${currentNode.y}`;
    closedSet.add(key);

    const neighbors = getNeighbors(
      currentNode,
      width,
      height,
      obstacleManager,
      margin,
      terrainGrid
    );

    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.x},${neighbor.y}`;

      if (closedSet.has(neighborKey)) {
        continue;
      }

      const tentativeG = currentNode.g + calculateCost(currentNode, neighbor);
      const existingG = gScores.get(neighborKey);

      if (existingG === undefined || tentativeG < existingG) {
        gScores.set(neighborKey, tentativeG);
        neighbor.g = tentativeG;
        neighbor.h = calculateHeuristic(neighbor, endNode);
        neighbor.f = neighbor.g + neighbor.h;
        neighbor.parent = currentNode;

        openList.push(neighbor);
      }
    }
  }

  return null;
};

const validateStartEndPoints = (start, end, obstacleManager, margin = 2) => {
  if (obstacleManager.isColliding(start.x, start.y, margin)) {
    return Either.left(
      new AppError(
        `Start point (${start.x}, ${start.y}) is inside or too close to an obstacle`,
        400,
        'INVALID_START'
      )
    );
  }

  if (obstacleManager.isColliding(end.x, end.y, margin)) {
    return Either.left(
      new AppError(
        `End point (${end.x}, ${end.y}) is inside or too close to an obstacle`,
        400,
        'INVALID_END'
      )
    );
  }

  const distToStart = obstacleManager.getMinDistanceToObstacle(start.x, start.y);
  const distToEnd = obstacleManager.getMinDistanceToObstacle(end.x, end.y);

  if (distToStart < margin || distToEnd < margin) {
    return Either.left(
      new AppError(
        'Start or end point is too close to an obstacle. Increase the distance.',
        400,
        'OBSTACLE_TOO_CLOSE'
      )
    );
  }

  return null;
};

const validateWaypoints = (waypoints, obstacleManager, margin = 2) => {
  for (let i = 0; i < waypoints.length; i++) {
    const wp = waypoints[i];

    if (obstacleManager.isColliding(wp.x, wp.y, margin)) {
      return Either.left(
        new AppError(
          `Waypoint "${wp.name}" at (${wp.x}, ${wp.y}) is inside or too close to an obstacle`,
          400,
          'INVALID_WAYPOINT'
        )
      );
    }

    const dist = obstacleManager.getMinDistanceToObstacle(wp.x, wp.y);
    if (dist < margin) {
      return Either.left(
        new AppError(
          `Waypoint "${wp.name}" at (${wp.x}, ${wp.y}) is too close to an obstacle. Move it at least ${margin + 1} units away.`,
          400,
          'WAYPOINT_TOO_CLOSE'
        )
      );
    }
  }

  return null;
};

const verifyPathClear = (path, obstacleManager) => {
  const collisions = obstacleManager.getPathCollisions(path, 1);

  if (collisions.length > 0) {
    return {
      valid: false,
      collisions,
    };
  }

  for (const point of path) {
    if (obstacleManager.isColliding(point.x, point.y, 1)) {
      return {
        valid: false,
        reason: `Path passes through obstacle at (${point.x}, ${point.y})`,
      };
    }
  }

  return { valid: true };
};

const findOptimalPath = measureExecutionTime(
  (
    start,
    end,
    obstacles,
    waypoints,
    width,
    height,
    userPreferences,
    margin = 2,
    terrainGrid = null
  ) => {
    if (
      start.x < 0 ||
      start.y < 0 ||
      start.x >= width ||
      start.y >= height ||
      end.x < 0 ||
      end.y < 0 ||
      end.x >= width ||
      end.y >= height
    ) {
      return Either.left(new AppError('Start or end point is out of bounds', 400, 'OUT_OF_BOUNDS'));
    }

    if (start.x === end.x && start.y === end.y) {
      return Either.left(
        new AppError('Start and end points cannot be the same', 400, 'SAME_POINTS')
      );
    }

    const obstacleManager = new ObstacleManager(obstacles);

    const startEndValidation = validateStartEndPoints(start, end, obstacleManager, margin);
    if (startEndValidation) {
      return startEndValidation;
    }

    const waypointsValidation = validateWaypoints(waypoints, obstacleManager, margin);
    if (waypointsValidation) {
      return waypointsValidation;
    }

    const orderedWaypoints = orderWaypoints(start, waypoints);
    if (!Array.isArray(orderedWaypoints)) {
      return Either.left(new AppError('Failed to order waypoints', 500, 'ORDERING_FAILED'));
    }

    const pointsToVisit = [start, ...orderedWaypoints, end];

    let fullPath = [];
    let totalDistance = 0;
    let totalCost = 0;

    for (let i = 0; i < pointsToVisit.length - 1; i++) {
      const currentStart = pointsToVisit[i];
      const currentEnd = pointsToVisit[i + 1];

      const pathResult = findPathBetweenTwoPoints(
        currentStart,
        currentEnd,
        obstacleManager,
        width,
        height,
        margin,
        terrainGrid
      );

      if (!pathResult) {
        return Either.left(
          new AppError(
            `No path found between (${currentStart.x}, ${currentStart.y}) and (${currentEnd.x}, ${currentEnd.y})`,
            400,
            'NO_PATH_FOUND'
          )
        );
      }

      fullPath = fullPath.concat(pathResult.path);
      totalDistance += pathResult.distance;
      totalCost += pathResult.cost;
    }

    const smoothedPath = smoothPath(fullPath, obstacleManager, width, height);

    const pathVerification = verifyPathClear(smoothedPath, obstacleManager);
    if (!pathVerification.valid) {
      console.warn(
        'Path verification failed:',
        pathVerification.reason || pathVerification.collisions
      );
    }

    return Either.right({
      path: smoothedPath,
      distance: totalDistance,
      cost: totalCost,
      originalPathLength: fullPath.length,
      smoothedPathLength: smoothedPath.length,
      terrainGrid: terrainGrid ? 'provided' : 'default',
    });
  },
  'findOptimalPath'
);

export {
  findOptimalPath,
  TERRAIN_TYPES,
  TERRAIN_COSTS,
  getTerrainCost,
  getTerrainAt,
  Obstacle,
  ObstacleManager,
};

export const clearPathCache = () => {
  console.log('Path cache cleared');
};
