import { AppError } from '../../business/utils/errorUtils.js';
import socketService from '../socket/socketService.js';

const WaypointController = {
  createWaypoint: waypointService => async (req, res, next) => {
    const waypointData = req.body.waypoints || req.body;
    const mapId = req.params.mapId;
    const result = await waypointService.createWaypoints(mapId, waypointData);
    result.fold(
      error => next(error),
      waypoints => {
        if (Array.isArray(waypoints)) {
          waypoints.forEach(wp => socketService.emitWaypointCreated(mapId, wp));
        } else {
          socketService.emitWaypointCreated(mapId, waypoints);
        }
        res.status(201).json(waypoints);
      }
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
    const mapId = req.params.mapId;
    const result = await waypointService.updateWaypoint(req.params.waypointId, req.body);
    result.fold(
      error => next(error),
      waypoint => {
        socketService.emitWaypointUpdated(mapId, waypoint);
        res.json(waypoint);
      }
    );
  },

  deleteWaypoint: waypointService => async (req, res, next) => {
    const mapId = req.params.mapId;
    const waypointId = req.params.waypointId;
    const result = await waypointService.deleteWaypoint(waypointId);
    result.fold(
      error => next(error),
      () => {
        socketService.emitWaypointDeleted(mapId, waypointId);
        res.status(204).json(null);
      }
    );
  },
};

export default WaypointController;
