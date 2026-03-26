import { jest } from '@jest/globals';
import MapService from '../../../../src/business/services/mapService.js';
import { Either } from '../../../../src/business/utils/either/Either.js';
import { AppError } from '../../../../src/business/utils/errorUtils.js';

describe('MapService', () => {
  let mockMapRepository;
  let mockSearchStrategy;
  let mapService;

  beforeEach(() => {
    mockMapRepository = {
      findAll: jest.fn(),
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockSearchStrategy = {
      search: jest.fn(),
    };

    mapService = MapService(mockMapRepository, mockSearchStrategy);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMaps', () => {
    const userId = 'user123';
    const params = { page: 1, limit: 10 };

    test('should return list of maps correctly', async () => {
      const mockMaps = [
        { id: 'map1', name: 'Map 1' },
        { id: 'map2', name: 'Map 2' },
      ];
      mockMapRepository.findAll.mockResolvedValue(Either.right(mockMaps));

      const result = await mapService.getMaps(params, userId);

      expect(mockMapRepository.findAll).toHaveBeenCalledWith({}, 1, 10, 'user123');
      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          err => err,
          data => data
        )
      ).toEqual(mockMaps);
    });

    test('should filter by name if provided', async () => {
      const paramsWithName = { ...params, name: 'test' };
      const mockMaps = [{ id: 'map1', name: 'Test Map' }];
      mockMapRepository.findAll.mockResolvedValue(Either.right(mockMaps));

      const result = await mapService.getMaps(paramsWithName, userId);

      expect(mockMapRepository.findAll).toHaveBeenCalledWith(
        { name: new RegExp('test', 'i') },
        1,
        10,
        'user123'
      );
      expect(result.isRight()).toBe(true);
    });

    test('should handle errors correctly', async () => {
      mockMapRepository.findAll.mockResolvedValue(Either.left(new Error('Database error')));

      const result = await mapService.getMaps(params, userId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.statusCode,
          _ => null
        )
      ).toBe(500);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('Error fetching maps');
    });
  });

  describe('searchMaps', () => {
    test('should search maps correctly', async () => {
      const query = 'mountain';
      const mockResults = [{ id: 'map1', name: 'Mountain Map' }];
      mockSearchStrategy.search.mockResolvedValue(Either.right(mockResults));

      const result = await mapService.searchMaps(query);

      expect(mockSearchStrategy.search).toHaveBeenCalledWith(query);
      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          err => err,
          data => data
        )
      ).toEqual(mockResults);
    });

    test('should handle search errors correctly', async () => {
      const query = 'mountain';
      mockSearchStrategy.search.mockResolvedValue(Either.left(new Error('Search failed')));

      const result = await mapService.searchMaps(query);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.statusCode,
          _ => null
        )
      ).toBe(500);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('Error searching maps');
    });
  });

  describe('createMap', () => {
    const mapData = { name: 'New Map', description: 'Description', userId: 'user123' };

    test('should create a map correctly', async () => {
      const createdMap = { id: 'map123', ...mapData };
      mockMapRepository.create.mockResolvedValue(Either.right(createdMap));

      const result = await mapService.createMap(mapData);

      expect(mockMapRepository.create).toHaveBeenCalledWith(mapData);
      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          err => err,
          data => data
        )
      ).toEqual(createdMap);
    });

    test('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError.name = 'ValidationError';
      mockMapRepository.create.mockResolvedValue(Either.left(validationError));

      const result = await mapService.createMap(mapData);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.statusCode,
          _ => null
        )
      ).toBe(400);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('Validation failed');
    });

    test('should handle other errors when creating', async () => {
      mockMapRepository.create.mockResolvedValue(Either.left(new Error('Database error')));

      const result = await mapService.createMap(mapData);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.statusCode,
          _ => null
        )
      ).toBe(500);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('Database error');
    });
  });

  describe('getMap', () => {
    const mapId = 'map123';
    const userId = 'user123';

    test('should get a map by ID correctly', async () => {
      const mockMap = { id: mapId, name: 'Test Map', userId };
      mockMapRepository.findById.mockResolvedValue(Either.right(mockMap));

      const result = await mapService.getMap(mapId, userId);

      expect(mockMapRepository.findById).toHaveBeenCalledWith(mapId, userId);
      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          err => err,
          data => data
        )
      ).toEqual(mockMap);
    });

    test('should handle errors when searching by ID', async () => {
      mockMapRepository.findById.mockResolvedValue(Either.left(new Error('Map not found')));

      const result = await mapService.getMap(mapId, userId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.statusCode,
          _ => null
        )
      ).toBe(404);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('Map not found');
    });
  });

  describe('updateMap', () => {
    const mapId = 'map123';
    const userId = 'user123';
    const updateData = { name: 'Updated Map Name' };

    test('should update a map correctly', async () => {
      const updatedMap = { id: mapId, name: 'Updated Map Name', userId };
      mockMapRepository.update.mockResolvedValue(Either.right(updatedMap));

      const result = await mapService.updateMap(mapId, updateData, userId);

      expect(mockMapRepository.update).toHaveBeenCalledWith(mapId, updateData, userId);
      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          err => err,
          data => data
        )
      ).toEqual(updatedMap);
    });

    test('should handle errors when updating', async () => {
      mockMapRepository.update.mockResolvedValue(Either.left(new Error('No permission')));

      const result = await mapService.updateMap(mapId, updateData, userId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.statusCode,
          _ => null
        )
      ).toBe(404);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('No permission');
    });

    test('should use default message if no error message is provided', async () => {
      mockMapRepository.update.mockResolvedValue(Either.left(new Error()));

      const result = await mapService.updateMap(mapId, updateData, userId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('Error updating map or you have no permission to update this map');
    });
  });

  describe('deleteMap', () => {
    const mapId = 'map123';
    const userId = 'user123';

    test('should delete a map correctly', async () => {
      const deleteResult = { deleted: true, id: mapId };
      mockMapRepository.delete.mockResolvedValue(Either.right(deleteResult));

      const result = await mapService.deleteMap(mapId, userId);

      expect(mockMapRepository.delete).toHaveBeenCalledWith(mapId, userId);
      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          err => err,
          data => data
        )
      ).toEqual(deleteResult);
    });

    test('should handle errors when deleting', async () => {
      mockMapRepository.delete.mockResolvedValue(Either.left(new Error('No permission to delete')));

      const result = await mapService.deleteMap(mapId, userId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.statusCode,
          _ => null
        )
      ).toBe(404);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('No permission to delete');
    });

    test('should use default message if no error message is provided', async () => {
      mockMapRepository.delete.mockResolvedValue(Either.left(new Error()));

      const result = await mapService.deleteMap(mapId, userId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          err => err.message,
          _ => null
        )
      ).toBe('Error deleting map or you have no permission to delete this map');
    });
  });
});
