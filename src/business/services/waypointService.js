import { Either } from "../utils/either/Either.js";
import { AppError } from "../utils/errorUtils.js";
import DefaultWaypointStrategy from "../strategies/DefaultWaypointStrategy.js";

const createWaypointService = waypointStrategy => ({
  createWaypoints: async (mapId, waypointData) => {
    const waypointsData = Array.isArray(waypointData)
      ? waypointData
      : [waypointData];

    const result = await waypointStrategy.createMultiple(mapId, waypointsData);

    return result.fold(
      error =>
        Either.left(AppError(error.message || "Error creating waypoints", 500)),
      createdWaypoints => Either.right(createdWaypoints)
    );
  },

  getWaypointsByMapId: async mapId => {
    const result = await waypointStrategy.findByMapId(mapId);
    return result.fold(
      error =>
        Either.left(AppError(error.message || "Error fetching waypoints", 500)),
      data => Either.right(data)
    );
  },

  updateWaypoint: async (waypointId, waypointData) => {
    const result = await waypointStrategy.update(waypointId, waypointData);
    return result.fold(
      error =>
        Either.left(AppError(error.message || "Error updating waypoint", 500)),
      data => Either.right(data)
    );
  },

  deleteWaypoint: async waypointId => {
    const result = await waypointStrategy.delete(waypointId);
    return result.fold(
      error =>
        Either.left(AppError(error.message || "Error deleting waypoint", 500)),
      data => Either.right(data)
    );
  }
});

export default createWaypointService(DefaultWaypointStrategy);
