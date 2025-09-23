import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';
import DefaultRouteStrategy from '../strategies/DefaultRouteStrategy.js';

const createRouteService = (routeRepository, mapRepository, obstacleRepository, waypointRepository) => {
    const routeStrategy = DefaultRouteStrategy(mapRepository, obstacleRepository, waypointRepository, routeRepository);

    return {
        createRoute: async (mapId, path, distance, createdBy) => {
            const result = await routeStrategy.create(mapId, path, distance, createdBy);
            return result.fold(
                (error) => Either.left(AppError(error.message || 'Error creating route', 500)),
                (data) => Either.right(data)
            );
        },

        findOptimalRoute: async (mapId, body, user) => {
            const result = await routeStrategy.findOptimalRoute(mapId, body, user);
            return result.fold(
                (error) => Either.left(AppError(error.message || 'Error finding optimal route', 500)),
                (data) => Either.right(data)
            );
        },

        getAllRoutes: async () => {
            const result = await routeStrategy.findAll();
            return result.fold(
                (error) => Either.left(AppError(error.message || 'Error fetching routes', 500)),
                (data) => Either.right(data)
            );
        },
        
        getRoutesByMapId: async (mapId) => {
            const result = await routeStrategy.findByMapId(mapId);
            return result.fold(
                (error) => Either.left(AppError(error.message || 'Error fetching routes for map', 500)),
                (data) => Either.right(data)
            );
        },

        getRoute: async (routeId) => {
            const result = await routeStrategy.findById(routeId);
            return result.fold(
                (error) => Either.left(AppError(error.message || 'Route not found', 404)),
                (data) => Either.right(data)
            );
        },

        deleteRoute: async (routeId) => {
            const result = await routeStrategy.delete(routeId);
            return result.fold(
                (error) => Either.left(AppError(error.message || 'Error deleting route', 500)),
                (data) => Either.right(data)
            );
        },
    };
};

export default createRouteService;