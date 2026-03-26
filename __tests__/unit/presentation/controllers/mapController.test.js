import MapController from '../../../../src/presentation/controllers/mapController.js';
import { Either } from '../../../../src/business/utils/either/Either.js';

const mockMapService = {
  getMaps: jest.fn(),
  createMap: jest.fn(),
  getMap: jest.fn(),
  updateMap: jest.fn(),
  deleteMap: jest.fn(),
};

const mockReq = {
  query: {},
  params: {},
  body: {},
  user: { _id: 'userId123' },
};

const mockRes = {
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
  send: jest.fn(),
};

const mockNext = jest.fn();

describe('MapController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllMaps', () => {
    it('should return maps successfully with default pagination', async () => {
      const mockMaps = [{ _id: 'map1', name: 'Map 1' }];
      mockMapService.getMaps.mockResolvedValue(Either.right(mockMaps));

      await MapController.getAllMaps(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockMapService.getMaps).toHaveBeenCalledWith(
        { page: 1, limit: 10, name: undefined },
        'userId123'
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockMaps);
    });

    it('should handle empty results', async () => {
      mockMapService.getMaps.mockResolvedValue(Either.right([]));

      await MapController.getAllMaps(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should handle service error', async () => {
      const mockError = new Error('Service error');
      mockMapService.getMaps.mockResolvedValue(Either.left(mockError));

      await MapController.getAllMaps(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('createMap', () => {
    it('should create map successfully', async () => {
      const mockMapData = { name: 'New Map', creator: 'userId123' };
      const mockNewMap = { _id: 'map1', ...mockMapData };
      mockReq.body = { name: 'New Map' };
      mockMapService.createMap.mockResolvedValue(Either.right(mockNewMap));

      await MapController.createMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockMapService.createMap).toHaveBeenCalledWith(mockMapData);
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockNewMap);
    });

    it('should handle validation error from service', async () => {
      const mockError = new Error('Validation error');
      mockReq.body = { name: 'Invalid Map' };
      mockMapService.createMap.mockResolvedValue(Either.left(mockError));

      await MapController.createMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });

    it('should handle duplicate map name error', async () => {
      const mockError = new Error('Duplicate map name');
      mockReq.body = { name: 'Duplicate Map' };
      mockMapService.createMap.mockResolvedValue(Either.left(mockError));

      await MapController.createMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(mockError);
    });
  });

  describe('getMap', () => {
    it('should return specific map successfully', async () => {
      const mockMap = { _id: 'map1', name: 'Map 1' };
      mockReq.params.mapId = 'map1';
      mockMapService.getMap.mockResolvedValue(Either.right(mockMap));

      await MapController.getMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockMapService.getMap).toHaveBeenCalledWith('map1', 'userId123');
      expect(mockRes.json).toHaveBeenCalledWith(mockMap);
    });

    it('should handle non-existent map', async () => {
      mockReq.params.mapId = 'nonexistent';
      mockMapService.getMap.mockResolvedValue(Either.left(new Error('Map not found')));

      await MapController.getMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle invalid map ID format', async () => {
      mockReq.params.mapId = 'invalidId';
      mockMapService.getMap.mockResolvedValue(Either.left(new Error('Invalid ID format')));

      await MapController.getMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('updateMap', () => {
    it('should update map successfully', async () => {
      const mockUpdatedMap = { _id: 'map1', name: 'Updated Map' };
      mockReq.params.mapId = 'map1';
      mockReq.body = { name: 'Updated Map' };
      mockMapService.updateMap.mockResolvedValue(Either.right(mockUpdatedMap));

      await MapController.updateMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockMapService.updateMap).toHaveBeenCalledWith(
        'map1',
        { name: 'Updated Map' },
        'userId123'
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedMap);
    });

    it('should handle non-existent map update', async () => {
      mockReq.params.mapId = 'nonexistent';
      mockReq.body = { name: 'Updated Map' };
      mockMapService.updateMap.mockResolvedValue(Either.left(new Error('Map not found')));

      await MapController.updateMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle validation error during update', async () => {
      mockReq.params.mapId = 'map1';
      mockReq.body = { name: '' };
      mockMapService.updateMap.mockResolvedValue(Either.left(new Error('Validation error')));

      await MapController.updateMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe('deleteMap', () => {
    it('should delete map successfully', async () => {
      mockReq.params.mapId = 'map1';
      mockMapService.deleteMap.mockResolvedValue(Either.right({}));

      await MapController.deleteMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockMapService.deleteMap).toHaveBeenCalledWith('map1', 'userId123');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it('should handle non-existent map deletion', async () => {
      mockReq.params.mapId = 'nonexistent';
      mockMapService.deleteMap.mockResolvedValue(Either.left(new Error('Map not found')));

      await MapController.deleteMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });

    it('should handle map with dependencies', async () => {
      mockReq.params.mapId = 'map1';
      mockMapService.deleteMap.mockResolvedValue(Either.left(new Error('Map has dependencies')));

      await MapController.deleteMap(mockMapService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
