import Heap from 'heap';
import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';
import { measureExecutionTime } from '../utils/monitoring.js';
import memoizeFindOptimalPath from '../utils/memoization.js';
import {
  hasCyclicDependencies,
  handleStartEqualsEnd,
} from '../../business/utils/validationUtils.js';

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

const createNode = (x, y, f = 0, g = 0, h = 0, parent = null, terrain = TERRAIN_TYPES.PLAINS) => {
  return { x, y, f, g, h, parent, terrain };
};

const isEqual = (nodeA, nodeB) => {
  return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
};

const calculateDistance = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return Infinity;
  }
  const distance = Math.sqrt(Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2));
  return distance;
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
    const result = heldKarp(start, waypoints);
    return result;
  } else {
    const result = twoOpt(start, waypoints);
    return result;
  }
};

const isPointInObstacle = (x, y, obstacles, margin = 1) => {
  for (const obstacle of obstacles) {
    const { x: ox, y: oy, size } = obstacle;
    const halfSize = size / 2;
    const expandedOx = ox - halfSize - margin;
    const expandedOy = oy - halfSize - margin;
    const expandedSize = size + 2 * margin;

    if (
      x >= expandedOx &&
      x < expandedOx + expandedSize &&
      y >= expandedOy &&
      y < expandedOy + expandedSize
    ) {
      return true;
    }
  }
  return false;
};

const getTerrainAt = (x, y, terrainGrid, defaultTerrain = TERRAIN_TYPES.PLAINS) => {
  if (!terrainGrid || !Array.isArray(terrainGrid) || terrainGrid.length === 0) {
    return defaultTerrain;
  }

  const row = terrainGrid[y];
  if (!row) {
    return defaultTerrain;
  }

  const terrainValue = row[x];
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

const getNeighbors = (node, width, height, obstacles, margin = 1, terrainGrid = null) => {
  const directions = [
    [0, -1],
    [0, 1],
    [-1, 0],
    [1, 0],
    [-1, -1],
    [-1, 1],
    [1, -1],
    [1, 1],
  ];

  const neighbors = directions
    .map(([dx, dy]) => {
      const newX = node.x + dx;
      const newY = node.y + dy;

      if (
        newX >= 0 &&
        newX < width &&
        newY >= 0 &&
        newY < height &&
        !isPointInObstacle(newX, newY, obstacles, margin)
      ) {
        const terrain = terrainGrid ? getTerrainAt(newX, newY, terrainGrid) : TERRAIN_TYPES.PLAINS;
        return createNode(newX, newY, 0, 0, 0, null, terrain);
      }
      return null;
    })
    .filter(neighbor => neighbor !== null);
  return neighbors;
};

const calculateHeuristic = (node, endNode) => {
  const h = Math.sqrt(Math.pow(node.x - endNode.x, 2) + Math.pow(node.y - endNode.y, 2));
  return h;
};

const calculateCost = (nodeA, nodeB) => {
  const baseCost = nodeA.x === nodeB.x || nodeA.y === nodeB.y ? 1 : Math.sqrt(2);
  const terrainCost = getTerrainCost(nodeB.terrain);
  return baseCost * terrainCost;
};

const reconstructPath = (node, terrainGrid = null) => {
  const buildPath = (currentNode, path = []) =>
    currentNode === null
      ? path
      : buildPath(currentNode.parent, [
          {
            x: currentNode.x,
            y: currentNode.y,
            terrain: currentNode.terrain,
          },
          ...path,
        ]);

  const path = buildPath(node);

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

const findPathBetweenTwoPoints = (
  start,
  end,
  obstacles,
  width,
  height,
  margin = 1,
  terrainGrid = null
) => {
  const startTerrain = terrainGrid
    ? getTerrainAt(start.x, start.y, terrainGrid)
    : TERRAIN_TYPES.PLAINS;
  const startNode = createNode(start.x, start.y, 0, 0, 0, null, startTerrain);
  const endNode = createNode(end.x, end.y);
  const openList = new Heap((a, b) => a.f - b.f);
  openList.push(startNode);
  const closedSet = new Set();

  while (openList.size() > 0) {
    const currentNode = openList.pop();

    if (isEqual(currentNode, endNode)) {
      return reconstructPath(currentNode, terrainGrid);
    }

    closedSet.add(`${currentNode.x},${currentNode.y}`);
    const neighbors = getNeighbors(currentNode, width, height, obstacles, margin, terrainGrid);

    neighbors.forEach(neighbor => {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
        return;
      }

      neighbor.g = currentNode.g + calculateCost(currentNode, neighbor);
      neighbor.h = calculateHeuristic(neighbor, endNode);
      neighbor.f = neighbor.g + neighbor.h;
      neighbor.parent = currentNode;

      const existingNode = openList.toArray().find(n => isEqual(n, neighbor));
      if (existingNode && existingNode.g <= neighbor.g) {
        return;
      }

      openList.push(neighbor);
    });
  }

  return null;
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
    margin = 1,
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

    const startEndError = handleStartEqualsEnd(start, end);
    if (startEndError) {
      return startEndError;
    }

    if (hasCyclicDependencies(waypoints)) {
      return Either.left(
        new AppError('Cyclic dependencies detected in waypoints', 400, 'CYCLIC_DEPENDENCIES')
      );
    }

    const allPoints = [start, ...waypoints, end];
    for (const point of allPoints) {
      if (isPointInObstacle(point.x, point.y, obstacles, margin)) {
        return Either.left(
          new AppError(
            'A point is inside an obstacle or too close to it',
            400,
            'OBSTACLE_COLLISION'
          ),
          'OBSTACLE_COLLISION'
        );
      }

      if (terrainGrid) {
        const terrain = getTerrainAt(point.x, point.y, terrainGrid);
        const cost = getTerrainCost(terrain);
        if (cost === Infinity) {
          return Either.left(
            new AppError(
              `Point at (${point.x}, ${point.y}) is on impassable terrain: ${terrain}`,
              400,
              'IMPASSABLE_TERRAIN'
            )
          );
        }
      }
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
        obstacles,
        width,
        height,
        margin,
        terrainGrid
      );

      if (!pathResult) {
        return Either.left(
          new AppError(
            `No path found between ${JSON.stringify(currentStart)} and ${JSON.stringify(currentEnd)}`,
            400,
            'NO_PATH_FOUND'
          )
        );
      }

      fullPath = fullPath.concat(pathResult.path);
      totalDistance += pathResult.distance;
      totalCost += pathResult.cost;
    }

    return Either.right({
      path: fullPath,
      distance: totalDistance,
      cost: totalCost,
      terrainGrid: terrainGrid ? 'provided' : 'default',
    });
  },
  'findOptimalPath'
);

const memoizedFindOptimalPath = memoizeFindOptimalPath(findOptimalPath);

export {
  memoizedFindOptimalPath as findOptimalPath,
  TERRAIN_TYPES,
  TERRAIN_COSTS,
  getTerrainCost,
  getTerrainAt,
};

export const clearPathCache = () => {
  if (memoizedFindOptimalPath.cache) {
    memoizedFindOptimalPath.cache.clear();
  }
};
