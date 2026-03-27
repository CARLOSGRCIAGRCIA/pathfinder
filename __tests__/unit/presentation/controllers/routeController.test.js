import RouteController from '../../../../src/presentation/controllers/routeController.js';
import { AppError } from '../../../../src/business/utils/errorUtils.js';
import { Either } from '../../../../src/business/utils/either/Either.js';

describe('RouteController', () => {
  let mockRouteService;
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockRouteService = {
      findOptimalRoute: jest.fn(),
      getAllRoutes: jest.fn(),
      getRoute: jest.fn(),
      deleteRoute: jest.fn(),
    };

    mockReq = {
      params: {
        mapId: 'map123',
        routeId: 'route123',
      },
      body: {
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 },
        preferences: {
          avoidStairs: true,
          preferIndoor: true,
        },
      },
      user: {
        id: 'user123',
        role: 'standard',
      },
    };

    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  describe('findOptimalRoute', () => {
    it('should find optimal route successfully', async () => {
      const mockRoute = {
        _id: 'route123',
        mapId: 'map123',
        start: mockReq.body.startPoint,
        end: mockReq.body.endPoint,
        path: [
          { x: 0, y: 0 },
          { x: 50, y: 50 },
          { x: 100, y: 100 },
        ],
        distance: 141.42,
        cost: 10,
        createdBy: 'user123',
        createdAt: new Date(),
      };
      mockRouteService.findOptimalRoute.mockResolvedValue(Either.right(mockRoute));

      await RouteController.findOptimalRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockRouteService.findOptimalRoute).toHaveBeenCalledWith(
        'map123',
        mockReq.body,
        mockReq.user
      );
      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockRoute);
    });

    it('should handle invalid route parameters', async () => {
      const error = new AppError('Invalid route parameters', 400);
      mockRouteService.findOptimalRoute.mockResolvedValue(Either.left(error));

      await RouteController.findOptimalRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle map not found error', async () => {
      const error = new AppError('Map not found', 404);
      mockRouteService.findOptimalRoute.mockResolvedValue(Either.left(error));

      await RouteController.findOptimalRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle no route found error', async () => {
      const error = new AppError('No valid route found between points', 404);
      mockRouteService.findOptimalRoute.mockResolvedValue(Either.left(error));

      await RouteController.findOptimalRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getAllRoutes', () => {
    it('should get all routes successfully', async () => {
      const mockRoutes = [
        {
          id: 'route123',
          startPoint: { x: 0, y: 0 },
          endPoint: { x: 100, y: 100 },
          distance: 141.42,
        },
        {
          id: 'route456',
          startPoint: { x: 10, y: 10 },
          endPoint: { x: 90, y: 90 },
          distance: 113.14,
        },
      ];
      mockRouteService.getAllRoutes.mockResolvedValue(Either.right(mockRoutes));

      await RouteController.getAllRoutes(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockRouteService.getAllRoutes).toHaveBeenCalled();
      expect(mockRes.json).toHaveBeenCalledWith(mockRoutes);
    });

    it('should handle empty routes list', async () => {
      mockRouteService.getAllRoutes.mockResolvedValue(Either.right([]));

      await RouteController.getAllRoutes(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it('should handle unauthorized access to routes', async () => {
      const error = new AppError('Unauthorized access', 403);
      mockRouteService.getAllRoutes.mockResolvedValue(Either.left(error));

      await RouteController.getAllRoutes(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('getRoute', () => {
    it('should get specific route successfully', async () => {
      const mockRoute = {
        id: 'route123',
        startPoint: { x: 0, y: 0 },
        endPoint: { x: 100, y: 100 },
        path: [
          { x: 0, y: 0 },
          { x: 100, y: 100 },
        ],
        distance: 141.42,
      };
      mockRouteService.getRoute.mockResolvedValue(Either.right(mockRoute));

      await RouteController.getRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockRouteService.getRoute).toHaveBeenCalledWith('route123');
      expect(mockRes.json).toHaveBeenCalledWith(mockRoute);
    });

    it('should handle route not found', async () => {
      const error = new AppError('Route not found', 404);
      mockRouteService.getRoute.mockResolvedValue(Either.left(error));

      await RouteController.getRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle unauthorized access to specific route', async () => {
      const error = new AppError('Unauthorized access to route', 403);
      mockRouteService.getRoute.mockResolvedValue(Either.left(error));

      await RouteController.getRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteRoute', () => {
    it('should delete route successfully', async () => {
      mockRouteService.deleteRoute.mockResolvedValue(Either.right());

      await RouteController.deleteRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockRouteService.deleteRoute).toHaveBeenCalledWith('route123');
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.json).toHaveBeenCalledWith(null);
    });

    it('should handle route not found during deletion', async () => {
      const error = new AppError('Route not found', 404);
      mockRouteService.deleteRoute.mockResolvedValue(Either.left(error));

      await RouteController.deleteRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle unauthorized deletion attempt', async () => {
      const error = new AppError('Unauthorized to delete route', 403);
      mockRouteService.deleteRoute.mockResolvedValue(Either.left(error));

      await RouteController.deleteRoute(mockRouteService)(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
});
