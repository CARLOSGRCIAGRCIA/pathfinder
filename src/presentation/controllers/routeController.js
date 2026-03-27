import { AppError } from '../../business/utils/errorUtils.js';
import socketService from '../socket/socketService.js';

const RouteController = {
  findOptimalRoute: routeService => async (req, res, next) => {
    const mapId = req.params.mapId;
    const result = await routeService.findOptimalRoute(mapId, req.body, req.user);
    result.fold(
      error => {
        const status =
          error.message.includes('No path found') ||
          error.message.includes('out of bounds') ||
          error.message.includes('inside an obstacle')
            ? 400
            : 500;
        next(AppError(error.message, status));
      },
      route => {
        const response = {
          _id: route._id,
          mapId: route.mapId,
          start: route.start,
          end: route.end,
          path: route.path,
          distance: route.distance,
          cost: route.cost,
          createdBy: route.createdBy,
          createdAt: route.createdAt,
        };
        socketService.emitRouteCreated(mapId, response);
        res.status(201).json(response);
      }
    );
  },

  getRoutesByMapId: routeService => async (req, res, next) => {
    const result = await routeService.getRoutesByMapId(req.params.mapId);
    result.fold(next, routes => res.json(routes));
  },

  getAllRoutes: routeService => async (req, res, next) => {
    const result = await routeService.getAllRoutes();
    result.fold(next, routes => res.json(routes));
  },

  getRoute: routeService => async (req, res, next) => {
    const result = await routeService.getRoute(req.params.routeId);
    result.fold(next, route => res.json(route));
  },

  deleteRoute: routeService => async (req, res, next) => {
    const mapId = req.body.mapId || req.params.routeId;
    const routeId = req.params.routeId;
    const result = await routeService.deleteRoute(routeId);
    result.fold(
      error => next(error),
      () => {
        socketService.emitRouteDeleted(mapId, routeId);
        res.status(204).json(null);
      }
    );
  },
};

export default RouteController;
