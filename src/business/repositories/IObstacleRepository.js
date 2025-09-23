import { Either } from '../utils/either/Either.js';

const IObstacleRepository = {
    create: async (obstacleData) => Either.left(new Error('Not implemented')),
    findByMapId: async (mapId) => Either.left(new Error('Not implemented')),
    update: async (obstacleId, obstacleData) => Either.left(new Error('Not implemented')),
    delete: async (obstacleId) => Either.left(new Error('Not implemented')),
};

export default IObstacleRepository;