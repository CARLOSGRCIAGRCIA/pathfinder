import { Either } from '../utils/either/Either.js';
import ObstacleRepository from '../../data/repositories/obstacleRepository.js';

const DefaultObstacleStrategy = {
  create: async (mapId, obstacleData) => {
    const obstacleWithMap = { ...obstacleData, map: mapId };
    return ObstacleRepository.create(obstacleWithMap);
  },

  createMultiple: async (mapId, obstaclesData) => {
    const obstaclesWithMap = obstaclesData.map(obstacle => ({
      ...obstacle,
      map: mapId,
    }));
    return ObstacleRepository.createMultiple(obstaclesWithMap);
  },

  findByMapId: async mapId => {
    return ObstacleRepository.findByMapId(mapId);
  },

  update: async (obstacleId, obstacleData) => {
    return ObstacleRepository.update(obstacleId, obstacleData);
  },

  delete: async obstacleId => {
    return ObstacleRepository.delete(obstacleId);
  },
};

export default DefaultObstacleStrategy;
