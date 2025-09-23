import { body, param, validationResult } from "express-validator";
import { Either } from "../utils/either/Either.js";
import { findOptimalPath } from "../services/pathFinderService.js";
import Map from "../../data/models/Map.js";
import Obstacle from "../../data/models/Obstacle.js";
import Waypoint from "../../data/models/Waypoint.js";
import { AppError } from '../utils/errorUtils.js'; 

export const validate = validations => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

export const obstacleValidation = [
  body("*.x").isInt({ min: 0 }).withMessage("X must be a non-negative integer"),
  body("*.y").isInt({ min: 0 }).withMessage("Y must be a non-negative integer"),
  body("*.size")
    .optional()
    .isInt({ min: 1, max: 3 })
    .withMessage("Size must be between 1 and 3")
];
export const validateObstacle = [
  body('x').isInt({ min: 0 }).withMessage('X must be a non-negative integer'),
  body('y').isInt({ min: 0 }).withMessage('Y must be a non-negative integer'),
  body('size').isInt({ min: 0 }).withMessage('Size must be a non-negative integer'),
];
export const waypointValidation = [
  body('*.x').isInt({ min: 0 }).withMessage('X must be a non-negative integer'),
  body('*.y').isInt({ min: 0 }).withMessage('Y must be a non-negative integer'),
  body('*.name').isString().trim().notEmpty().withMessage('Name is required'),
];
export const validateWaypoints = [
  body('x').isInt({ min: 0 }).withMessage('X must be a non-negative integer'),
  body('y').isInt({ min: 0 }).withMessage('Y must be a non-negative integer'),
  body('name').isString().trim().notEmpty().withMessage('Name is required'),
];

export const validateIdFormat = (
  idName,
  errorMessage = "Invalid ID format"
) => {
  return param(idName)
    .isString()
    .isLength({ min: 24, max: 24 })
    .withMessage(errorMessage)
    .matches(/^[a-fA-F0-9]{24}$/)
    .withMessage(errorMessage);
};

export const validateIdExistence = (
  idName,
  model,
  errorMessage = "ID does not exist"
) => {
  return param(idName).custom(async (id, { req }) => {
    const exists = await model.findById(id);
    if (!exists) {
      return Promise.reject(errorMessage);
    }
  });
};

export const validateStoppingPoints = async (mapId) => {
  try {
    const waypoints = await Waypoint.find({ map: mapId });
    return waypoints.length > 0
      ? Either.right({
          valid: true,
          message: "Map contains at least one valid stopping point.",
        })
      : Either.left({
          valid: false,
          message: "Map must contain at least one stopping point.",
        });
  } catch (error) {
    return Either.left({ error: "Error fetching waypoints." });
  }
};

export const checkReachability = async (mapId) => {
  try {
    const map = await Map.findById(mapId);
    if (!map) {
      return Either.left({ error: "Map not found." });
    }

    const obstacles = await Obstacle.find({ map: mapId });
    const waypoints = await Waypoint.find({ map: mapId });

    const obstacleSet = new Set(
      obstacles.map((obstacle) => `${obstacle.x},${obstacle.y}`)
    );

    const isReachable = (start, end) => {
      const openList = [start];
      const closedSet = new Set();
      while (openList.length > 0) {
        const current = openList.shift();
        if (current[0] === end[0] && current[1] === end[1]) return true;
        closedSet.add(`${current[0]},${current[1]}`);
        const neighbors = [
          [current[0] + 1, current[1]],
          [current[0] - 1, current[1]],
          [current[0], current[1] + 1],
          [current[0], current[1] - 1],
        ].filter(
          ([x, y]) =>
            x >= 0 &&
            y >= 0 &&
            !obstacleSet.has(`${x},${y}`) &&
            !closedSet.has(`${x},${y}`)
        );
        openList.push(...neighbors);
      }
      return false;
    };

    const unreachablePoints = waypoints
      .map((waypoint) => [waypoint.x, waypoint.y])
      .filter((point) => !isReachable([map.start.x, map.start.y], point));

    return unreachablePoints.length === 0
      ? Either.right({ reachable: true, unreachablePoints: [] })
      : Either.left({ reachable: false, unreachablePoints });
  } catch (error) {
    return Either.left({ error: "Error checking reachability." });
  }
};

export const validateComplexGeometry = async (mapId) => {
  try {
    const map = await Map.findById(mapId);
    if (!map) {
      return Either.left({ error: "Map not found." });
    }

    const obstacles = await Obstacle.find({ map: mapId });
    const waypoints = await Waypoint.find({ map: mapId });

    const result = findOptimalPath(
      { x: map.start.x, y: map.start.y },
      { x: map.end.x, y: map.end.y },
      obstacles.map((obstacle) => ({ x: obstacle.x, y: obstacle.y })),
      waypoints.map((waypoint) => ({ x: waypoint.x, y: waypoint.y })),
      map.width,
      map.height,
      {},
      true
    );

    return result.isRight()
      ? Either.right({
          valid: true,
          message: "Algorithm can handle maps with complex geometries.",
        })
      : Either.left({
          valid: false,
          message: "Algorithm cannot handle maps with complex geometries.",
        });
  } catch (error) {
    return Either.left({ error: "Error validating complex geometry." });
  }
};

export const handleStartEqualsEnd = (start, end) => {
  const arePointsEqual = (pointA, pointB) => pointA.x === pointB.x && pointA.y === pointB.y;

  return arePointsEqual(start, end)
    ? Either.left(AppError("Start and end points cannot be the same", 400))
    : null; 
};

export const hasCyclicDependencies = (waypoints) => {
  const isCyclicUtil = (point, visited, recursionStack, neighborsFn) => {
    if (recursionStack.has(point)) return true;
    if (visited.has(point)) return false;

    const newVisited = new Set(visited).add(point);
    const newRecursionStack = new Set(recursionStack).add(point);

    const neighbors = neighborsFn(point);

    return neighbors.some((neighbor) =>
      isCyclicUtil(neighbor, newVisited, newRecursionStack, neighborsFn)
    );
  };

  const neighborsFn = (point) => point.neighbors || [];

  return waypoints.some((waypoint) => {
    const visited = new Set();
    const recursionStack = new Set();
    return isCyclicUtil(waypoint, visited, recursionStack, neighborsFn);
  });
};

export const validateAllRoutes = async mapId => {
  try {
    const map = await Map.findById(mapId);
    if (!map) {
      return Either.left({ error: "Map not found." });
    }

    const obstacles = await Obstacle.find({ map: mapId });
    const waypoints = await Waypoint.find({ map: mapId });

    const result = findOptimalPath(
      { x: map.start.x, y: map.start.y },
      { x: map.end.x, y: map.end.y },
      obstacles.map(obstacle => ({ x: obstacle.x, y: obstacle.y })),
      waypoints.map(waypoint => ({ x: waypoint.x, y: waypoint.y })),
      map.width,
      map.height,
      {},
      true
    );

    return result.isRight()
      ? Either.right({
          consideredAllRoutes: true,
          routesCount: result.getOrElse().path.length
        })
      : Either.left({ consideredAllRoutes: false, routesCount: 0 });
  } catch (error) {
    return Either.left({ error: "Error validating all routes." });
  }
};

export const validateOptimalRoute = async mapId => {
  try {
    const map = await Map.findById(mapId);
    if (!map) {
      return Either.left({ error: "Map not found." });
    }

    const obstacles = await Obstacle.find({ map: mapId });
    const waypoints = await Waypoint.find({ map: mapId });

    const result = findOptimalPath(
      { x: map.start.x, y: map.start.y },
      { x: map.end.x, y: map.end.y },
      obstacles.map(obstacle => ({ x: obstacle.x, y: obstacle.y })),
      waypoints.map(waypoint => ({ x: waypoint.x, y: waypoint.y })),
      map.width,
      map.height,
      {},
      true
    );

    return result.isRight()
      ? Either.right({ optimal: true, optimalRoute: result.getOrElse().path })
      : Either.left({ optimal: false, optimalRoute: [] });
  } catch (error) {
    return Either.left({ error: "Error validating optimal route." });
  }
};

export const validateInput = async mapId => {
  try {
    const map = await Map.findById(mapId);
    if (!map) {
      return Either.left({ error: "Map not found." });
    }

    const obstacles = await Obstacle.find({ map: mapId });
    const waypoints = await Waypoint.find({ map: mapId });

    if (!map.start || !map.end) {
      return Either.left({ error: "Invalid map data provided." });
    }

    return Either.right({ valid: true, message: "Map data is valid." });
  } catch (error) {
    return Either.left({ error: "Error validating input." });
  }
};

export const validateLargeMap = async mapId => {
  try {
    const map = await Map.findById(mapId);
    if (!map) {
      return Either.left({ error: "Map not found." });
    }

    const obstacles = await Obstacle.find({ map: mapId });
    const waypoints = await Waypoint.find({ map: mapId });

    const result = findOptimalPath(
      { x: map.start.x, y: map.start.y },
      { x: map.end.x, y: map.end.y },
      obstacles.map(obstacle => ({ x: obstacle.x, y: obstacle.y })),
      waypoints.map(waypoint => ({ x: waypoint.x, y: waypoint.y })),
      map.width,
      map.height,
      {},
      true
    );

    return result.isRight()
      ? Either.right({
          canHandleLargeMap: true,
          message:
            "Algorithm successfully handled a map with a large number of obstacles and stopping points."
        })
      : Either.left({
          canHandleLargeMap: false,
          message: "Algorithm cannot handle large maps."
        });
  } catch (error) {
    return Either.left({ error: "Error validating large map." });
  }
};

export const routeValidation = [
  body("start").isObject().withMessage("Start must be an object"),
  body("start.x")
    .isInt({ min: 0 })
    .withMessage("Start X must be a non-negative integer"),
  body("start.y")
    .isInt({ min: 0 })
    .withMessage("Start Y must be a non-negative integer"),
  body("end").isObject().withMessage("End must be an object"),
  body("end.x")
    .isInt({ min: 0 })
    .withMessage("End X must be a non-negative integer"),
  body("end.y")
    .isInt({ min: 0 })
    .withMessage("End Y must be a non-negative integer"),
  body("waypoints")
    .optional()
    .isArray()
    .withMessage("Waypoints must be an array"),
  body("userPreferences")
    .optional()
    .isObject()
    .withMessage("User preferences must be an object"),
  body()
    .custom(({ start, end }) => {
      if (start.x === end.x && start.y === end.y) {
        throw new Error("Start and end points cannot be the same");
      }
      return true;
    })
    .withMessage("Start and end points cannot be the same")
];

export const userValidation = [
  body("username")
    .isString()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
];

export const mapValidations = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("width")
    .isInt({ min: 50, max: 500 })
    .withMessage("Width must be between 50 and 500"),
  body("height")
    .isInt({ min: 50, max: 500 })
    .withMessage("Height must be between 50 and 500"),
  body("start").isObject().withMessage("Start point must be an object"),
  body("start.x")
    .isInt({ min: 0 })
    .withMessage("Start X must be a non-negative integer"),
  body("start.y")
    .isInt({ min: 0 })
    .withMessage("Start Y must be a non-negative integer"),
  body("end").isObject().withMessage("End point must be an object"),
  body("end.x")
    .isInt({ min: 0 })
    .withMessage("End X must be a non-negative integer"),
  body("end.y")
    .isInt({ min: 0 })
    .withMessage("End Y must be a non-negative integer")
];
