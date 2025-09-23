import { AppError } from '../../business/utils/errorUtils.js';

const RouteController = {
    findOptimalRoute: (routeService) => async (req, res, next) => {
        const result = await routeService.findOptimalRoute(req.params.mapId, req.body, req.user);
        result.fold(
            (error) => {
              const status = error.message.includes('No path found') || 
                            error.message.includes('out of bounds') || 
                            error.message.includes('inside an obstacle') 
                            ? 400 : 500;
              next(AppError(error.message, status));
            },
            (route) => res.status(201).json(route)
          );
    },

    getRoutesByMapId: (routeService) => async (req, res, next) => {
        const result = await routeService.getRoutesByMapId(req.params.mapId);
        result.fold(next, (routes) => res.json(routes));
    },

    getAllRoutes: (routeService) => async (req, res, next) => {
        const result = await routeService.getAllRoutes();
        result.fold(next, (routes) => res.json(routes));
    },

    getRoute: (routeService) => async (req, res, next) => {
        const result = await routeService.getRoute(req.params.routeId);
        result.fold(next, (route) => res.json(route));
    },

    deleteRoute: (routeService) => async (req, res, next) => {
        const result = await routeService.deleteRoute(req.params.routeId);
        result.fold(next, () => res.status(204).json(null));
    },
};

export default RouteController;