import { Either } from '../../../../src/business/utils/either/Either.js';
import { AppError } from '../../../../src/business/utils/errorUtils.js';
import RouteService from '../../../../src/business/services/routeService.js';
import { findOptimalPath } from '../../../../src/business/services/pathFinderService.js';

jest.mock('../../../../src/business/services/pathFinderService.js', () => ({
    findOptimalPath: jest.fn(),
}));

describe('RouteService', () => {
    let routeRepository, mapRepository, obstacleRepository, waypointRepository, routeService;

    beforeEach(() => {
        routeRepository = {
            create: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
        };
        mapRepository = {
            findById: jest.fn(),
        };
        obstacleRepository = {
            findByMapId: jest.fn(),
        };
        waypointRepository = {
            findByMapId: jest.fn(),
        };

        routeService = RouteService(
            routeRepository,
            mapRepository,
            obstacleRepository,
            waypointRepository
        );

        jest.clearAllMocks();
    });

    describe('createRoute', () => {
        it('should return a Right with the created route', async () => {
            const mockRoute = { id: '1', mapId: 'map-id', path: [], distance: 10 };
            routeRepository.create.mockResolvedValue(Either.right(mockRoute));

            const result = await routeService.createRoute('map-id', [], 10, 'user-id');
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(mockRoute);
        });

        it('should return a Left with an error if repository fails', async () => {
            routeRepository.create.mockResolvedValue(Either.left(AppError('Error creating route', 500)));
            const result = await routeService.createRoute('map-id', [], 10, 'user-id');
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error creating route');
        });
    });

    describe('findOptimalRoute', () => {
        it('should return a Right with the created route if everything succeeds', async () => {
            const mockMap = { id: 'map-id', width: 10, height: 10 };
            const mockObstacles = [{ x: 5, y: 5 }]; 
            const mockWaypoints = [{ x: 3, y: 3 }]; 
            const mockPathResult = { path: [{ x: 0, y: 0 }], distance: 10 };
            const mockRoute = { id: '1', mapId: 'map-id', path: mockPathResult.path, distance: 10 };

            mapRepository.findById.mockResolvedValue(Either.right(mockMap));
            obstacleRepository.findByMapId.mockResolvedValue(Either.right(mockObstacles));
            waypointRepository.findByMapId.mockResolvedValue(Either.right(mockWaypoints));
            findOptimalPath.mockResolvedValue(Either.right(mockPathResult));
            routeRepository.create.mockResolvedValue(Either.right(mockRoute));

            const result = await routeService.findOptimalRoute('map-id', {
                start: { x: 0, y: 0 },
                end: { x: 9, y: 9 },
            }, { _id: 'user-id' });

            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(mockRoute);
        });

        it('should return a Left if start or end points are missing', async () => {
            const result = await routeService.findOptimalRoute('map-id', {}, { _id: 'user-id' });
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error finding optimal route');
        });

        it('should return a Left if map is not found', async () => {
            mapRepository.findById.mockResolvedValue(Either.left(AppError('Map not found', 404)));
            const result = await routeService.findOptimalRoute('map-id', {
                start: { x: 0, y: 0 },
                end: { x: 9, y: 9 },
            }, { _id: 'user-id' });
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error finding optimal route');
        });

        it('should return a Left if fetching obstacles or waypoints fails', async () => {
            const mockMap = { id: 'map-id', width: 10, height: 10 };
            mapRepository.findById.mockResolvedValue(Either.right(mockMap));
            obstacleRepository.findByMapId.mockResolvedValue(Either.left(AppError('Error fetching obstacles or waypoints', 500)));
            const result = await routeService.findOptimalRoute('map-id', {
                start: { x: 0, y: 0 },
                end: { x: 9, y: 9 },
            }, { _id: 'user-id' });
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error finding optimal route');
        });

        it('should return a Left if there are no obstacles', async () => {
            const mockMap = { id: 'map-id', width: 10, height: 10 };
            mapRepository.findById.mockResolvedValue(Either.right(mockMap));
            obstacleRepository.findByMapId.mockResolvedValue(Either.right([]));
            waypointRepository.findByMapId.mockResolvedValue(Either.right([{ x: 3, y: 3 }]));

            const result = await routeService.findOptimalRoute('map-id', {
                start: { x: 0, y: 0 },
                end: { x: 9, y: 9 },
            }, { _id: 'user-id' });

            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error finding optimal route');
        });

        it('should return a Left if there are no waypoints', async () => {
            const mockMap = { id: 'map-id', width: 10, height: 10 };
            mapRepository.findById.mockResolvedValue(Either.right(mockMap));
            obstacleRepository.findByMapId.mockResolvedValue(Either.right([{ x: 5, y: 5 }]));
            waypointRepository.findByMapId.mockResolvedValue(Either.right([]));

            const result = await routeService.findOptimalRoute('map-id', {
                start: { x: 0, y: 0 },
                end: { x: 9, y: 9 },
            }, { _id: 'user-id' });

            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error finding optimal route');
        });
    });

    describe('getAllRoutes', () => {
        it('should return a Right with a list of routes', async () => {
            const mockRoutes = [{ id: '1', mapId: 'map-id', path: [], distance: 10 }];
            routeRepository.findAll.mockResolvedValue(Either.right(mockRoutes));
            const result = await routeService.getAllRoutes();
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(mockRoutes);
        });

        it('should return a Left if repository fails', async () => {
            routeRepository.findAll.mockResolvedValue(Either.left(AppError('Error fetching routes', 500)));
            const result = await routeService.getAllRoutes();
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error fetching routes');
        });
    });

    describe('getRoute', () => {
        it('should return a Right with the route if found', async () => {
            const mockRoute = { id: '1', mapId: 'map-id', path: [], distance: 10 };
            routeRepository.findById.mockResolvedValue(Either.right(mockRoute));
            const result = await routeService.getRoute('1');
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(mockRoute);
        });

        it('should return a Left if route is not found', async () => {
            routeRepository.findById.mockResolvedValue(Either.left(AppError('Route not found', 404)));
            const result = await routeService.getRoute('1');
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Route not found');
        });
    });

    describe('deleteRoute', () => {
        it('should return a Right with the deleted route', async () => {
            const mockRoute = { id: '1', mapId: 'map-id', path: [], distance: 10 };
            routeRepository.delete.mockResolvedValue(Either.right(mockRoute));
            const result = await routeService.deleteRoute('1');
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(mockRoute);
        });

        it('should return a Left if repository fails', async () => {
            routeRepository.delete.mockResolvedValue(Either.left(AppError('Error deleting route', 500)));
            const result = await routeService.deleteRoute('1');
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('Error deleting route');
        });
    });
});