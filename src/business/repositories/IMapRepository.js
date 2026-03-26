import { Either } from '../utils/either/Either.js';

const IMapRepository = {
  create: async mapData => Either.left(new Error('Not implemented')),
  findById: async id => Either.left(new Error('Not implemented')),
  update: async (id, mapData) => Either.left(new Error('Not implemented')),
  delete: async id => Either.left(new Error('Not implemented')),
  findAll: async (query, page, limit) => Either.left(new Error('Not implemented')),
};

export default IMapRepository;
