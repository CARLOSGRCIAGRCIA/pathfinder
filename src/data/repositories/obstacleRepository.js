import { Either } from '../../business/utils/either/Either.js';
import Obstacle from '../models/Obstacle.js';
import { AppError } from '../../business/utils/errorUtils.js';

const ObstacleRepository = {
  create: async obstacleData => {
    const newObstacle = new Obstacle(obstacleData);
    const validationError = newObstacle.validateSync();

    if (validationError) {
      return Either.left(validationError);
    }

    return newObstacle
      .save()
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  createMultiple: async obstaclesData => {
    const validationErrors = obstaclesData
      .map(obstacleData => {
        const newObstacle = new Obstacle(obstacleData);
        return newObstacle.validateSync();
      })
      .filter(error => error != null);

    if (validationErrors.length > 0) {
      return Either.left(validationErrors[0]);
    }

    return Obstacle.insertMany(obstaclesData, { rawResult: false })
      .then(createdObstacles => Either.right(createdObstacles))
      .catch(error => Either.left(error));
  },

  findByMapId: async mapId => {
    return Obstacle.find({ map: mapId })
      .then(Either.right)
      .catch(error => Either.left(error));
  },

  update: async (obstacleId, obstacleData) => {
    return Obstacle.findByIdAndUpdate(
      obstacleId,
      { $set: obstacleData },
      { new: true, runValidators: true }
    )
      .then(obstacle => {
        if (!obstacle) {
          return Either.left(new AppError('Obstacle not found', 404));
        }
        return Either.right(obstacle);
      })
      .catch(error => {
        return Either.left(error);
      });
  },

  delete: async obstacleId => {
    return Obstacle.findByIdAndDelete(obstacleId)
      .then(obstacle =>
        obstacle ? Either.right(obstacle) : Either.left(new AppError('Obstacle not found', 404))
      )
      .catch(error => Either.left(error));
  },
};

export default ObstacleRepository;
