import { Either } from '../utils/either/Either.js';
import Map from '../../data/models/Map.js';

const NameSearchStrategy = {
  search: async query => {
    const maps = await Map.find({ name: new RegExp(query.name, 'i') });
    return Either.right(maps);
  },
};

export default NameSearchStrategy;
