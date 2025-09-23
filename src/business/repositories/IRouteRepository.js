import { Either } from '../utils/either/Either.js';

const IRouteRepository = {
    create: async (routeData) => Either.left(new Error('Not implemented')),
    findAll: async () => Either.left(new Error('Not implemented')),
    findByMapId: async (mapId) => Either.left(new Error('Not implemented')),
    findById: async (routeId) => Either.left(new Error('Not implemented')),
    delete: async (routeId) => Either.left(new Error('Not implemented')),
};

export default IRouteRepository;