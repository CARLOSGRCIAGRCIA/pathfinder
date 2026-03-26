import WaypointController from '../../../../src/presentation/controllers/waypointController';
import { Either } from '../../../../src/business/utils/either/Either';
import { AppError } from '../../../../src/business/utils/errorUtils';

describe('WaypointController', () => {
  let mockWaypointService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockWaypointService = {
      createWaypoints: jest.fn(),
      getWaypointsByMapId: jest.fn(),
      updateWaypoint: jest.fn(),
      deleteWaypoint: jest.fn(),
    };

    mockReq = {
      params: {
        mapId: 'test-map-id',
        waypointId: 'test-waypoint-id',
      },
      body: {},
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createWaypoint', () => {
    const mockWaypointData = {
      name: 'Test Waypoint',
      coordinates: { lat: 40.7128, lng: -74.006 },
    };

    test('should successfully create a single waypoint', async () => {
      const mockWaypointData = { name: 'Test Waypoint', x: 10, y: 20 };
      mockReq.body = mockWaypointData;
      const mockWaypoint = { id: 'new-waypoint-id', ...mockWaypointData };
      mockWaypointService.createWaypoints.mockResolvedValue(Either.right([mockWaypoint]));

      await WaypointController.createWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockWaypointService.createWaypoints).toHaveBeenCalledWith(
        'test-map-id',
        mockWaypointData
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith([mockWaypoint]);
      expect(mockNext).not.toHaveBeenCalled();
    });
    test('should successfully create multiple waypoints', async () => {
      const mockWaypointsData = [
        { name: 'Waypoint 1', x: 10, y: 20 },
        { name: 'Waypoint 2', x: 15, y: 25 },
      ];
      mockReq.body = mockWaypointsData;
      const mockWaypoints = mockWaypointsData.map((data, index) => ({
        id: `new-waypoint-id-${index}`,
        ...data,
      }));
      mockWaypointService.createWaypoints.mockResolvedValue(Either.right(mockWaypoints));

      await WaypointController.createWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockWaypointService.createWaypoints).toHaveBeenCalledWith(
        'test-map-id',
        mockWaypointsData
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockWaypoints);
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle validation errors during creation', async () => {
      const mockWaypointData = { name: 'Test Waypoint', x: 10, y: 20 };
      mockReq.body = mockWaypointData;
      const error = new AppError('Invalid waypoint data', 400);
      mockWaypointService.createWaypoints.mockResolvedValue(Either.left(error));

      await WaypointController.createWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
    test('should handle validation errors during creation', async () => {
      const mockWaypointData = { name: 'Test Waypoint', x: 10, y: 20 };
      mockReq.body = mockWaypointData;
      const error = new AppError('Invalid waypoint data', 400);
      mockWaypointService.createWaypoints.mockResolvedValue(Either.left(error));

      await WaypointController.createWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('getWaypoints', () => {
    test('should successfully retrieve waypoints for a map', async () => {
      const mockWaypoints = [
        { id: 'wp1', name: 'Waypoint 1' },
        { id: 'wp2', name: 'Waypoint 2' },
      ];
      mockWaypointService.getWaypointsByMapId.mockResolvedValue(Either.right(mockWaypoints));

      await WaypointController.getWaypoints(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockWaypointService.getWaypointsByMapId).toHaveBeenCalledWith('test-map-id');
      expect(mockRes.json).toHaveBeenCalledWith(mockWaypoints);
    });

    test('should handle map not found error when retrieving waypoints', async () => {
      const error = new AppError('Map not found', 404);
      mockWaypointService.getWaypointsByMapId.mockResolvedValue(Either.left(error));

      await WaypointController.getWaypoints(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('updateWaypoint', () => {
    const mockUpdateData = {
      name: 'Updated Waypoint',
      coordinates: { lat: 40.7128, lng: -74.006 },
    };

    test('should successfully update a waypoint', async () => {
      mockReq.body = mockUpdateData;
      const mockUpdatedWaypoint = { id: 'test-waypoint-id', ...mockUpdateData };
      mockWaypointService.updateWaypoint.mockResolvedValue(Either.right(mockUpdatedWaypoint));

      await WaypointController.updateWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockWaypointService.updateWaypoint).toHaveBeenCalledWith(
        'test-waypoint-id',
        mockUpdateData
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockUpdatedWaypoint);
    });

    test('should handle waypoint not found error during update', async () => {
      mockReq.body = mockUpdateData;
      const error = new AppError('Waypoint not found', 404);
      mockWaypointService.updateWaypoint.mockResolvedValue(Either.left(error));

      await WaypointController.updateWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('should handle validation errors during update', async () => {
      mockReq.body = { name: '' };
      const error = new AppError('Invalid waypoint data', 400);
      mockWaypointService.updateWaypoint.mockResolvedValue(Either.left(error));

      await WaypointController.updateWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });

  describe('deleteWaypoint', () => {
    test('should successfully delete a waypoint', async () => {
      mockWaypointService.deleteWaypoint.mockResolvedValue(Either.right(null));

      await WaypointController.deleteWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockWaypointService.deleteWaypoint).toHaveBeenCalledWith('test-waypoint-id');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith(null);
    });

    test('should handle waypoint not found error during deletion', async () => {
      const error = new AppError('Waypoint not found', 404);
      mockWaypointService.deleteWaypoint.mockResolvedValue(Either.left(error));

      await WaypointController.deleteWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });

    test('should handle unauthorized deletion attempt', async () => {
      const error = new AppError('Unauthorized to delete waypoint', 403);
      mockWaypointService.deleteWaypoint.mockResolvedValue(Either.left(error));

      await WaypointController.deleteWaypoint(mockWaypointService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockRes.json).not.toHaveBeenCalled();
    });
  });
});
