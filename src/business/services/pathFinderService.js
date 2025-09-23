import Heap from "heap";
import { Either } from "../utils/either/Either.js";
import { AppError } from "../utils/errorUtils.js";
import { measureExecutionTime } from "../utils/monitoring.js";
import memoizeFindOptimalPath from "../utils/memoization.js";
import { hasCyclicDependencies, handleStartEqualsEnd } from "../../business/utils/validationUtils.js";

const THRESHOLD = 10;

const createNode = (x, y, f = 0, g = 0, h = 0, parent = null) => {
  return { x, y, f, g, h, parent };
};

const isEqual = (nodeA, nodeB) => {
  return nodeA.x === nodeB.x && nodeA.y === nodeB.y;
};

const calculateDistance = (pointA, pointB) => {
  if (!pointA || !pointB) {
    return Infinity;
  }
  const distance = Math.sqrt(
    Math.pow(pointA.x - pointB.x, 2) + Math.pow(pointA.y - pointB.y, 2)
  );
  return distance;
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
        const distance =
          calculateDistance(waypoints[pos], waypoints[i]) + result.distance;

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
  return result.path.map((index) => waypoints[index]);
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

const getNeighbors = (node, width, height, obstacles, margin = 1) => {
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
        return createNode(newX, newY);
      }
      return null;
    })
    .filter((neighbor) => neighbor !== null);
  return neighbors;
};

const calculateHeuristic = (node, endNode) => {
  const h = Math.sqrt(Math.pow(node.x - endNode.x, 2) + Math.pow(node.y - endNode.y, 2));
  return h;
};

const calculateCost = (nodeA, nodeB) => {
  const cost = nodeA.x === nodeB.x || nodeA.y === nodeB.y ? 1 : Math.sqrt(2);
  return cost;
};

const reconstructPath = (node) => {
  const buildPath = (currentNode, path = []) =>
    currentNode === null
      ? path
      : buildPath(currentNode.parent, [
          { x: currentNode.x, y: currentNode.y },
          ...path,
        ]);

  const path = buildPath(node);
  const distance = path
    .slice(1)
    .reduce(
      (total, point, index) => total + calculateDistance(point, path[index]),
      0
    );

  return { path, distance };
};

const findPathBetweenTwoPoints = (
  start,
  end,
  obstacles,
  width,
  height,
  margin = 1
) => {
  const startNode = createNode(start.x, start.y);
  const endNode = createNode(end.x, end.y);
  const openList = new Heap((a, b) => a.f - b.f);
  openList.push(startNode);
  const closedSet = new Set();


  while (openList.size() > 0) {
    const currentNode = openList.pop();

    if (isEqual(currentNode, endNode)) {
      return reconstructPath(currentNode);
    }

    closedSet.add(`${currentNode.x},${currentNode.y}`);
    const neighbors = getNeighbors(currentNode, width, height, obstacles, margin);


    neighbors.forEach((neighbor) => {
      if (closedSet.has(`${neighbor.x},${neighbor.y}`)) {
        return;
      }

      neighbor.g = currentNode.g + calculateCost(currentNode, neighbor);
      neighbor.h = calculateHeuristic(neighbor, endNode);
      neighbor.f = neighbor.g + neighbor.h;
      neighbor.parent = currentNode;

      const existingNode = openList.toArray().find((n) => isEqual(n, neighbor));
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
    margin = 1
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
      return Either.left(AppError("Start or end point is out of bounds", 400));
    }

    const startEndError = handleStartEqualsEnd(start, end);
    if (startEndError) {
      return startEndError;
    }

    if (hasCyclicDependencies(waypoints)) {
      return Either.left(AppError("Cyclic dependencies detected in waypoints", 400));
    }

    const allPoints = [start, ...waypoints, end];
    for (const point of allPoints) {
      if (isPointInObstacle(point.x, point.y, obstacles, margin)) {
        return Either.left("A point is inside an obstacle or too close to it");
      }
    }

    const orderedWaypoints = orderWaypoints(start, waypoints);

    if (!Array.isArray(orderedWaypoints)) {
      return Either.left(AppError("Failed to order waypoints", 500));
    }

    const pointsToVisit = [start, ...orderedWaypoints, end];

    let fullPath = [];
    let totalDistance = 0;

    for (let i = 0; i < pointsToVisit.length - 1; i++) {
      const currentStart = pointsToVisit[i];
      const currentEnd = pointsToVisit[i + 1];

      const pathResult = findPathBetweenTwoPoints(
        currentStart,
        currentEnd,
        obstacles,
        width,
        height,
        margin
      );

      if (!pathResult) {
        return Either.left(
          `No path found between ${JSON.stringify(
            currentStart
          )} and ${JSON.stringify(currentEnd)}`
        );
      }

      fullPath = fullPath.concat(pathResult.path);
      totalDistance += pathResult.distance;
    }

    return Either.right({ path: fullPath, distance: totalDistance });
  },
  "findOptimalPath"
);

const memoizedFindOptimalPath = memoizeFindOptimalPath(findOptimalPath);

export { memoizedFindOptimalPath as findOptimalPath };