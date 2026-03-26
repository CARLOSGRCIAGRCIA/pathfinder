import { AppError } from '../../business/utils/errorUtils.js';

const WaypointController = {
  createWaypoint: waypointService => async (req, res, next) => {
    const result = await waypointService.createWaypoints(req.params.mapId, req.body);
    result.fold(
      error => next(error),
      waypoints => res.status(201).json(waypoints)
    );
  },

  getWaypoints: waypointService => async (req, res, next) => {
    const result = await waypointService.getWaypointsByMapId(req.params.mapId);
    result.fold(
      error => next(error),
      waypoints => res.json(waypoints)
    );
  },

  updateWaypoint: waypointService => async (req, res, next) => {
    const result = await waypointService.updateWaypoint(req.params.waypointId, req.body);
    result.fold(
      error => next(error),
      waypoint => res.json(waypoint)
    );
  },

  deleteWaypoint: waypointService => async (req, res, next) => {
    const result = await waypointService.deleteWaypoint(req.params.waypointId);
    result.fold(
      error => next(error),
      () => res.status(204).json(null)
    );
  },
};

export default WaypointController;
