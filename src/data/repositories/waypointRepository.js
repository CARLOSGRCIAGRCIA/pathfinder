import { Either } from "../../business/utils/either/Either.js";
import Waypoint from "../models/Waypoint.js";
import { AppError } from "../../business/utils/errorUtils.js";

const WaypointRepository = {
  create: async waypointData => {
    const newWaypoint = new Waypoint(waypointData);
    const validationError = newWaypoint.validateSync();

    if (validationError) {
      return Either.left(validationError);
    }

    return newWaypoint
      .save()
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  createMultiple: async waypointsData => {
    const validationErrors = waypointsData
      .map(waypointData => {
        const newWaypoint = new Waypoint(waypointData);
        return newWaypoint.validateSync();
      })
      .filter(error => error != null);

    if (validationErrors.length > 0) {
      return Either.left(validationErrors[0]);
    }

    return Waypoint.insertMany(waypointsData, { rawResult: false })
      .then(createdWaypoints => Either.right(createdWaypoints))
      .catch(error => Either.left(error));
  },

  findByMapId: async mapId => {
    return Waypoint.find({ map: mapId })
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  update: async (waypointId, waypointData) => {
    return Waypoint.findByIdAndUpdate(waypointId, waypointData, {
      new: true,
      runValidators: true
    })
      .then(
        waypoint =>
          waypoint
            ? Either.right(waypoint)
            : Either.left(AppError("Waypoint not found", 404))
      )
      .catch(error => Either.left(error));
  },

  delete: async waypointId => {
    return Waypoint.findByIdAndDelete(waypointId)
      .then(
        waypoint =>
          waypoint
            ? Either.right(waypoint)
            : Either.left(AppError("Waypoint not found", 404))
      )
      .catch(error => Either.left(error));
  }
};

export default WaypointRepository;
