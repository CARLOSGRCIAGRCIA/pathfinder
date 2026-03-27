import { AppError } from '../../business/utils/errorUtils.js';
import socketService from '../socket/socketService.js';

const MapController = {
  getAllMaps: mapService => async (req, res, next) => {
    const { page = 1, limit = 10, name } = req.query;
    const userId = req.user._id;
    const result = await mapService.getMaps({ page, limit, name }, userId);

    result.fold(
      error => next(error),
      maps => res.json(maps)
    );
  },

  createMap: mapService => async (req, res, next) => {
    const mapData = { ...req.body, creator: req.user._id };
    const result = await mapService.createMap(mapData);

    result.fold(
      error => next(error),
      newMap => {
        socketService.emitMapCreated(newMap);
        res.status(201).json(newMap);
      }
    );
  },

  getMap: mapService => async (req, res, next) => {
    const userId = req.user._id;
    const result = await mapService.getMap(req.params.mapId, userId);

    result.fold(
      error => next(error),
      map => res.json(map)
    );
  },

  updateMap: mapService => async (req, res, next) => {
    const userId = req.user._id;
    const result = await mapService.updateMap(req.params.mapId, req.body, userId);

    result.fold(
      error => next(error),
      updatedMap => {
        socketService.emitMapUpdated(updatedMap);
        res.json(updatedMap);
      }
    );
  },

  deleteMap: mapService => async (req, res, next) => {
    const userId = req.user._id;
    const mapId = req.params.mapId;
    const result = await mapService.deleteMap(mapId, userId);

    result.fold(
      error => next(error),
      () => {
        socketService.emitMapDeleted(mapId);
        res.status(204).send();
      }
    );
  },
};

export default MapController;
