import { Either } from "../utils/either/Either.js";
import WaypointRepository from "../../data/repositories/waypointRepository.js";

const DefaultWaypointStrategy = {
  create: async (mapId, waypointData) => {
    const waypointWithMap = { ...waypointData, map: mapId };
    return WaypointRepository.create(waypointWithMap);
  },

  createMultiple: async (mapId, waypointsData) => {
    const waypointsWithMap = waypointsData.map(waypoint => ({
      ...waypoint,
      map: mapId
    }));
    return WaypointRepository.createMultiple(waypointsWithMap);
  },

  findByMapId: async mapId => {
    return WaypointRepository.findByMapId(mapId);
  },

  update: async (waypointId, waypointData) => {
    return WaypointRepository.update(waypointId, waypointData);
  },

  delete: async waypointId => {
    return WaypointRepository.delete(waypointId);
  }
};

export default DefaultWaypointStrategy;
