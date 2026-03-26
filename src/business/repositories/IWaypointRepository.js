import { Either } from '../utils/either/Either.js';

const IWaypointRepository = {
  create: async waypointData => Either.left(new Error('Not implemented')),
  findByMapId: async mapId => Either.left(new Error('Not implemented')),
  update: async (waypointId, waypointData) => Either.left(new Error('Not implemented')),
  delete: async waypointId => Either.left(new Error('Not implemented')),
};

export default IWaypointRepository;
