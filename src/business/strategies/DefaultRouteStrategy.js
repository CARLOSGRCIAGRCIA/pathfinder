import { Either } from '../utils/either/Either.js';
import { findOptimalPath } from '../services/pathFinderService.js';

const DefaultRouteStrategy = (mapRepository, obstacleRepository, waypointRepository, routeRepository) => {
    const strategy = {
        create: async (mapId, path, distance, createdBy) => {
            const routeData = {
                mapId,
                start: path[0],
                end: path[path.length - 1],
                path,
                distance,
                createdBy
            };
            
            return routeRepository.create(routeData);
        },

        validateMapConfiguration: async (mapId) => {
            const obstaclesResult = await obstacleRepository.findByMapId(mapId);
            if (obstaclesResult.isLeft()) return Either.left('Error fetching obstacles');
            const obstacles = obstaclesResult.getOrElse([]);

            const waypointsResult = await waypointRepository.findByMapId(mapId);
            if (waypointsResult.isLeft()) return Either.left('Error fetching waypoints');
            const waypoints = waypointsResult.getOrElse([]);

            if (obstacles.length === 0) {
                return Either.left('The map must have at least one obstacle');
            }

            if (waypoints.length === 0) {
                return Either.left('The map must have at least one waypoint');
            }

            return Either.right({ obstacles, waypoints });
        },

        findOptimalRoute: async (mapId, body, user) => {
            const { start, end, waypoints: waypointsFromBody, userPreferences } = body;

            if (!start || !end) return Either.left('Start and end points are required');

            const mapResult = await mapRepository.findById(mapId, user._id);
            if (mapResult.isLeft()) return Either.left('Map not found or you have no permission to access this map');
            const map = mapResult.getOrElse(null);

            const validationResult = await strategy.validateMapConfiguration(mapId);
            if (validationResult.isLeft()) {
                return validationResult;
            }

            const { obstacles, waypoints: waypointsFromDB } = validationResult.getOrElse({});

            const waypoints = waypointsFromBody || waypointsFromDB;

            const pathResult = await findOptimalPath(
                start,
                end,
                obstacles,
                waypoints,
                map.width,
                map.height,
                userPreferences,
            );

            if (pathResult.isLeft()) {
                return pathResult;
            }

            const { path, distance } = pathResult.getOrElse({});
            return strategy.create(mapId, path, distance, user._id);
        },

        findAll: async () => {
            return routeRepository.findAll();
        },
        
        findByMapId: async (mapId) => {
            return routeRepository.findByMapId(mapId);
        },

        findById: async (routeId) => {
            return routeRepository.findById(routeId);
        },

        delete: async (routeId) => {
            return routeRepository.delete(routeId);
        }
    };

    return strategy;
};

export default DefaultRouteStrategy;