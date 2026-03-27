import { AppError } from '../../business/utils/errorUtils.js';
import socketService from '../socket/socketService.js';

const ObstacleController = {
  createObstacle: obstacleService => async (req, res, next) => {
    const obstacleData = req.body.obstacles || req.body;
    const mapId = req.params.mapId;
    const result = await obstacleService.createObstacles(mapId, obstacleData);
    result.fold(
      error => next(error),
      obstacles => {
        if (Array.isArray(obstacles)) {
          obstacles.forEach(obs => socketService.emitObstacleCreated(mapId, obs));
        } else {
          socketService.emitObstacleCreated(mapId, obstacles);
        }
        res.status(201).json(obstacles);
      }
    );
  },

  getObstacles: obstacleService => async (req, res, next) => {
    const result = await obstacleService.getObstaclesByMapId(req.params.mapId);
    result.fold(
      error => next(error),
      obstacles => res.json(obstacles)
    );
  },

  updateObstacle: obstacleService => async (req, res, next) => {
    const mapId = req.params.mapId;
    const result = await obstacleService.updateObstacle(req.params.obstacleId, req.body);
    result.fold(
      error => next(error),
      obstacle => {
        socketService.emitObstacleUpdated(mapId, obstacle);
        res.json(obstacle);
      }
    );
  },

  deleteObstacle: obstacleService => async (req, res, next) => {
    const mapId = req.params.mapId;
    const obstacleId = req.params.obstacleId;
    const result = await obstacleService.deleteObstacle(obstacleId);
    result.fold(
      error => next(error),
      () => {
        socketService.emitObstacleDeleted(mapId, obstacleId);
        res.status(204).json(null);
      }
    );
  },
};

export default ObstacleController;
