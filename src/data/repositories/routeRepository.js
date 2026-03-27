import { Either } from '../../business/utils/either/Either.js';
import Route from '../models/Route.js';
import IRouteRepository from '../../business/repositories/IRouteRepository.js';
import { AppError } from '../../business/utils/errorUtils.js';
import mongoose from 'mongoose';

const RouteRepository = {
  ...IRouteRepository,

  create: async routeData => {
    try {
      const newRoute = new Route(routeData);
      const validationError = newRoute.validateSync();

      if (validationError) {
        return Either.left(validationError);
      }

      const saved = await newRoute.save();
      return Either.right(saved);
    } catch (err) {
      return Either.left(err);
    }
  },

  findAll: async () => {
    return Route.find().lean().then(Either.right).catch(Either.left);
  },

  findByMapId: async mapId => {
    if (typeof mapId === 'string') {
      const routes = await Route.find({
        $or: [{ mapId: mapId }, { mapId: new mongoose.Types.ObjectId(mapId) }],
      }).lean();
      return Either.right(routes);
    }
    return Route.find({ mapId }).lean().then(Either.right).catch(Either.left);
  },

  findById: async routeId => {
    return Route.findById(routeId)
      .lean()
      .then(route =>
        route ? Either.right(route) : Either.left(new AppError('Route not found', 404))
      )
      .catch(Either.left);
  },

  delete: async routeId => {
    return Route.findByIdAndDelete(routeId)
      .then(route =>
        route ? Either.right(route) : Either.left(new AppError('Route not found', 404))
      )
      .catch(Either.left);
  },
};

export default RouteRepository;
