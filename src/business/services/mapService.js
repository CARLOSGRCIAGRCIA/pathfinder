import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';

const MapService = (mapRepository, searchStrategy) => ({
  getMaps: async ({ page, limit, name, location }, userId) => {
    const query = name ? { name: new RegExp(name, 'i') } : {};
    const result = await mapRepository.findAll(query, page, limit, userId);
    return result.fold(
      error => Either.left(new AppError('Error fetching maps', 500)),
      data => Either.right(data)
    );
  },

  searchMaps: async query => {
    const result = await searchStrategy.search(query);
    return result.fold(
      error => Either.left(new AppError('Error searching maps', 500)),
      data => Either.right(data)
    );
  },

  createMap: async mapData => {
    const result = await mapRepository.create(mapData);
    return result.fold(
      error =>
        Either.left(
          new AppError(
            error.message || 'Error creating map',
            error.name === 'ValidationError' ? 400 : 500,
            error
          )
        ),
      data => Either.right(data)
    );
  },

  getMap: async (id, userId) => {
    const result = await mapRepository.findById(id, userId);
    return result.fold(
      error =>
        Either.left(
          new AppError(
            error.message || 'Map not found or you have no permission to access this map',
            404
          )
        ),
      data => Either.right(data)
    );
  },

  updateMap: async (id, mapData, userId) => {
    const result = await mapRepository.update(id, mapData, userId);
    return result.fold(
      error =>
        Either.left(
          new AppError(
            error.message || 'Error updating map or you have no permission to update this map',
            404
          )
        ),
      data => Either.right(data)
    );
  },

  deleteMap: async (id, userId) => {
    const result = await mapRepository.delete(id, userId);
    return result.fold(
      error =>
        Either.left(
          new AppError(
            error.message || 'Error deleting map or you have no permission to delete this map',
            404
          )
        ),
      data => Either.right(data)
    );
  },
});

export default MapService;
