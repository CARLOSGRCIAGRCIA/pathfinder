import { AppError } from '../../business/utils/errorUtils.js';

const ObstacleController = {
  createObstacle: (obstacleService) => async (req, res, next) => {
    const result = await obstacleService.createObstacles(req.params.mapId, req.body);
    result.fold(
      (error) => next(error),
      (obstacles) => res.status(201).json(obstacles)
    );
  },

  getObstacles: (obstacleService) => async (req, res, next) => {
    const result = await obstacleService.getObstaclesByMapId(req.params.mapId);
    result.fold(
      (error) => next(error),
      (obstacles) => res.json(obstacles)
    );
  },

  updateObstacle: (obstacleService) => async (req, res, next) => {  
    const result = await obstacleService.updateObstacle(req.params.obstacleId, req.body);
    result.fold(
      (error) => next(error),
      (obstacle) => {
        res.json(obstacle);
      }
    );
  },

  deleteObstacle: (obstacleService) => async (req, res, next) => {
    const result = await obstacleService.deleteObstacle(req.params.obstacleId);
    result.fold(
      (error) => next(error),
      () => res.status(204).json(null)
    );
  },
};

export default ObstacleController;