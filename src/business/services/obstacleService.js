import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';
import DefaultObstacleStrategy from '../strategies/DefaultObstacleStrategy.js';

export const createObstacleService = obstacleStrategy => ({
  createObstacles: async (mapId, obstacleData) => {
    const obstaclesData = Array.isArray(obstacleData) ? obstacleData : [obstacleData];

    const result = await obstacleStrategy.createMultiple(mapId, obstaclesData);

    return result.fold(
      error => Either.left(AppError(error.message || 'Error creating obstacles', 500)),
      createdObstacles => Either.right(createdObstacles)
    );
  },

  getObstaclesByMapId: async mapId => {
    const result = await obstacleStrategy.findByMapId(mapId);
    return result.fold(
      error => Either.left(AppError(error.message || 'Error fetching obstacles', 500)),
      data => Either.right(data)
    );
  },

  updateObstacle: async (obstacleId, obstacleData) => {
    const result = await obstacleStrategy.update(obstacleId, obstacleData);
    return result.fold(
      error => Either.left(AppError(error.message || 'Error updating obstacle', 500)),
      data => {
        return Either.right(data);
      }
    );
  },

  deleteObstacle: async obstacleId => {
    const result = await obstacleStrategy.delete(obstacleId);
    return result.fold(
      error => Either.left(AppError(error.message || 'Error deleting obstacle', 500)),
      data => Either.right(data)
    );
  },
});

export default createObstacleService(DefaultObstacleStrategy);
