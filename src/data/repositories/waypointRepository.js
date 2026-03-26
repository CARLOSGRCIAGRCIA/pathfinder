import { Either } from '../../business/utils/either/Either.js';
import Waypoint from '../models/Waypoint.js';
import { AppError } from '../../business/utils/errorUtils.js';

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
      .sort({ order: 1 })
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  findById: async waypointId => {
    return Waypoint.findById(waypointId)
      .then(waypoint =>
        waypoint ? Either.right(waypoint) : Either.left(new AppError('Waypoint not found', 404))
      )
      .catch(error => Either.left(error));
  },

  findNearPoint: async (x, y, radius, mapId = null) => {
    const query = {
      $expr: {
        $let: {
          vars: {
            xDiff: { $subtract: ['$x', x] },
            yDiff: { $subtract: ['$y', y] },
          },
          in: {
            $lte: [
              {
                $add: [
                  { $multiply: ['$$xDiff', '$$xDiff'] },
                  { $multiply: ['$$yDiff', '$$yDiff'] },
                ],
              },
              radius * radius,
            ],
          },
        },
      },
    };

    if (mapId) {
      query.map = mapId;
    }

    return Waypoint.find(query)
      .limit(20)
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  findWithinBounds: async (minX, minY, maxX, maxY, mapId = null) => {
    const query = {
      x: { $gte: minX, $lte: maxX },
      y: { $gte: minY, $lte: maxY },
    };

    if (mapId) {
      query.map = mapId;
    }

    return Waypoint.find(query)
      .sort({ order: 1 })
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  findByType: async (mapId, type) => {
    return Waypoint.find({ map: mapId, type })
      .sort({ order: 1 })
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  findByBoundingBox: async (mapId, box) => {
    const { minX, minY, maxX, maxY } = box;
    return Waypoint.find({
      map: mapId,
      x: { $gte: minX, $lte: maxX },
      y: { $gte: minY, $lte: maxY },
    })
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  update: async (waypointId, waypointData) => {
    return Waypoint.findByIdAndUpdate(waypointId, waypointData, {
      new: true,
      runValidators: true,
    })
      .then(waypoint =>
        waypoint ? Either.right(waypoint) : Either.left(new AppError('Waypoint not found', 404))
      )
      .catch(error => Either.left(error));
  },

  delete: async waypointId => {
    return Waypoint.findByIdAndDelete(waypointId)
      .then(waypoint =>
        waypoint ? Either.right(waypoint) : Either.left(new AppError('Waypoint not found', 404))
      )
      .catch(error => Either.left(error));
  },

  deleteByMapId: async mapId => {
    return Waypoint.deleteMany({ map: mapId })
      .then(result => Either.right({ deleted: result.deletedCount }))
      .catch(error => Either.left(error));
  },

  countByMapId: async mapId => {
    return Waypoint.countDocuments({ map: mapId })
      .then(count => Either.right(count))
      .catch(error => Either.left(error));
  },
};

export default WaypointRepository;
