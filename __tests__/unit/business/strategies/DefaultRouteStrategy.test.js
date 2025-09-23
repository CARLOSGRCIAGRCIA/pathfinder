import DefaultRouteStrategy from '../../../../src/business/strategies/DefaultRouteStrategy.js';
import { Either } from '../../../../src/business/utils/either/Either.js';

const mockMapRepository = {
    findById: jest.fn(),
};

const mockObstacleRepository = {
    findByMapId: jest.fn(),
};

const mockWaypointRepository = {
    findByMapId: jest.fn(),
};

const mockRouteRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findById: jest.fn(),
    delete: jest.fn(),
};

jest.mock('../../../../src/business/services/pathFinderService.js', () => ({
    findOptimalPath: jest.fn(),
}));

import { findOptimalPath } from '../../../../src/business/services/pathFinderService.js';

describe('DefaultRouteStrategy', () => {
    let strategy;

    beforeEach(() => {
        strategy = DefaultRouteStrategy(
            mockMapRepository,
            mockObstacleRepository,
            mockWaypointRepository,
            mockRouteRepository
        );
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a route with the provided data', async () => {
            const routeData = {
                mapId: 'map1',
                start: { x: 0, y: 0 },
                end: { x: 10, y: 10 },
                path: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
                distance: 14.14,
                createdBy: 'user1'
            };

            mockRouteRepository.create.mockResolvedValue(Either.right(routeData));

            const result = await strategy.create('map1', routeData.path, routeData.distance, 'user1');

            expect(mockRouteRepository.create).toHaveBeenCalledWith(routeData);
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(routeData);
        });
    });

    describe('findOptimalRoute', () => {
        it('should return an error if start or end points are missing', async () => {
            const result = await strategy.findOptimalRoute('map1', {}, 'user1');

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                () => 'Should not reach here'
            )).toEqual('Start and end points are required');
        });

        it('should return an error if map is not found', async () => {
            mockMapRepository.findById.mockResolvedValue(Either.left('Map not found'));

            const result = await strategy.findOptimalRoute('map1', { start: { x: 0, y: 0 }, end: { x: 10, y: 10 } }, 'user1');

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                () => 'Should not reach here'
            )).toEqual('Map not found or you have no permission to access this map');
        });

        it('should return an error if obstacles cannot be fetched', async () => {
            mockMapRepository.findById.mockResolvedValue(Either.right({ width: 100, height: 100 }));
            mockObstacleRepository.findByMapId.mockResolvedValue(Either.left('Error fetching obstacles'));

            const result = await strategy.findOptimalRoute('map1', { start: { x: 0, y: 0 }, end: { x: 10, y: 10 } }, { _id: 'user1' });

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                () => 'Should not reach here'
            )).toEqual('Error fetching obstacles');
        });

        it('should return an error if waypoints cannot be fetched', async () => {
            mockMapRepository.findById.mockResolvedValue(Either.right({ width: 100, height: 100 }));
            mockObstacleRepository.findByMapId.mockResolvedValue(Either.right([]));
            mockWaypointRepository.findByMapId.mockResolvedValue(Either.left('Error fetching waypoints'));

            const result = await strategy.findOptimalRoute('map1', { start: { x: 0, y: 0 }, end: { x: 10, y: 10 } }, { _id: 'user1' });

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                () => 'Should not reach here'
            )).toEqual('Error fetching waypoints');
        });

        it('should return an error if path finding fails', async () => {
            mockMapRepository.findById.mockResolvedValue(Either.right({ width: 100, height: 100 }));
            mockObstacleRepository.findByMapId.mockResolvedValue(Either.right([{ x: 5, y: 5 }]));
            mockWaypointRepository.findByMapId.mockResolvedValue(Either.right([{ x: 3, y: 3 }]));
            findOptimalPath.mockResolvedValue(Either.left('No path found'));

            const result = await strategy.findOptimalRoute('map1', { start: { x: 0, y: 0 }, end: { x: 10, y: 10 } }, { _id: 'user1' });

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                () => 'Should not reach here'
            )).toEqual('No path found');
        });

        it('should create and return a route if path finding succeeds', async () => {
            const routeData = {
                mapId: 'map1',
                start: { x: 0, y: 0 },
                end: { x: 10, y: 10 },
                path: [{ x: 0, y: 0 }, { x: 10, y: 10 }],
                distance: 14.14,
                createdBy: 'user1',
            };

            mockMapRepository.findById.mockResolvedValue(Either.right({ width: 100, height: 100 }));
            mockObstacleRepository.findByMapId.mockResolvedValue(Either.right([{ x: 5, y: 5 }]));
            mockWaypointRepository.findByMapId.mockResolvedValue(Either.right([{ x: 3, y: 3 }]));
            findOptimalPath.mockResolvedValue(Either.right({ path: routeData.path, distance: routeData.distance }));
            mockRouteRepository.create.mockResolvedValue(Either.right(routeData));

            const result = await strategy.findOptimalRoute('map1', { start: { x: 0, y: 0 }, end: { x: 10, y: 10 } }, { _id: 'user1' });

            expect(result.isRight()).toBe(true);
            result.fold(
                () => fail('Expected a Right but got a Left'),
                (route) => {
                    expect(route).toEqual(routeData);
                }
            );
        });
    });

    describe('findAll', () => {
        it('should return all routes', async () => {
            const routes = [{ id: 'route1' }, { id: 'route2' }];
            mockRouteRepository.findAll.mockResolvedValue(Either.right(routes));

            const result = await strategy.findAll();

            expect(mockRouteRepository.findAll).toHaveBeenCalled();
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(routes);
        });
    });

    describe('findById', () => {
        it('should return a route by id', async () => {
            const route = { id: 'route1' };
            mockRouteRepository.findById.mockResolvedValue(Either.right(route));

            const result = await strategy.findById('route1');

            expect(mockRouteRepository.findById).toHaveBeenCalledWith('route1');
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(route);
        });
    });

    describe('delete', () => {
        it('should delete a route by id', async () => {
            mockRouteRepository.delete.mockResolvedValue(Either.right(true));

            const result = await strategy.delete('route1');

            expect(mockRouteRepository.delete).toHaveBeenCalledWith('route1');
            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toBe(true);
        });
    });
});