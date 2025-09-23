import mongoose from 'mongoose';
import Map from '../../../../src/data/models/Map';
import MapRepository from '../../../../src/data/repositories/mapRepository';
import { Either } from '../../../../src/business/utils/either/Either';

jest.mock('../../../../src/data/models/Map');

describe('MapRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should create a map successfully', async () => {
            const mapData = { name: 'Test Map', creator: 'user123' };
            const savedMap = { ...mapData, _id: 'map123' };

            const mockMap = {
                validateSync: jest.fn().mockReturnValue(null),
                save: jest.fn().mockResolvedValue(savedMap)
            };

            Map.mockImplementation(() => mockMap);

            const result = await MapRepository.create(mapData);

            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(savedMap);
        });

        it('should return Left when validation fails', async () => {
            const mapData = { name: 'Test Map', creator: 'user123' };
            const validationError = new Error('Validation failed');

            const mockMap = {
                validateSync: jest.fn().mockReturnValue(validationError),
                save: jest.fn()
            };

            Map.mockImplementation(() => mockMap);

            const result = await MapRepository.create(mapData);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(validationError);
        });

        it('should return Left when save operation fails', async () => {
            const mapData = { name: 'Test Map', creator: 'user123' };
            const saveError = new Error('Database connection failed');

            const mockMap = {
                validateSync: jest.fn().mockReturnValue(null),
                save: jest.fn().mockRejectedValue(saveError)
            };

            Map.mockImplementation(() => mockMap);

            const result = await MapRepository.create(mapData);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(saveError);
        });
    });

    describe('findById', () => {
        it('should find a map by id successfully', async () => {
            const mapId = 'map123';
            const userId = 'user123';
            const foundMap = { _id: mapId, name: 'Test Map', creator: userId };

            Map.findOne.mockResolvedValue(foundMap);

            const result = await MapRepository.findById(mapId, userId);

            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(foundMap);
        });

        it('should return Left when map is not found', async () => {
            const mapId = 'nonexistent';
            const userId = 'user123';

            Map.findOne.mockResolvedValue(null);

            const result = await MapRepository.findById(mapId, userId);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error.message,
                value => value
            )).toBe('Map not found or you have no permission to access this map');
        });

        it('should return Left when database query fails', async () => {
            const mapId = 'map123';
            const userId = 'user123';
            const dbError = new Error('Database connection failed');

            Map.findOne.mockRejectedValue(dbError);

            const result = await MapRepository.findById(mapId, userId);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(dbError);
        });
    });

    describe('update', () => {
        it('should update a map successfully', async () => {
            const mapId = 'map123';
            const userId = 'user123';
            const mapData = { name: 'Updated Map' };
            const updatedMap = { _id: mapId, ...mapData, creator: userId };

            Map.findOne.mockResolvedValue(updatedMap);
            Map.findByIdAndUpdate.mockResolvedValue(updatedMap);

            const result = await MapRepository.update(mapId, mapData, userId);

            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(updatedMap);
        });

        it('should return Left when map does not exist', async () => {
            const mapId = 'nonexistent';
            const userId = 'user123';
            const mapData = { name: 'Updated Map' };

            Map.findOne.mockResolvedValue(null);

            const result = await MapRepository.update(mapId, mapData, userId);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error.message,
                value => value
            )).toBe('Map not found or you have no permission to update this map');
        });

        it('should return Left when validation fails during update', async () => {
            const mapId = 'map123';
            const userId = 'user123';
            const mapData = { name: 'Updated Map' };
            const validationError = new Error('Validation failed');

            Map.findOne.mockResolvedValue({ _id: mapId, creator: userId });
            Map.findByIdAndUpdate.mockRejectedValue(validationError);

            const result = await MapRepository.update(mapId, mapData, userId);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(validationError);
        });
    });

    describe('findAll', () => {
        it('should return paginated maps successfully', async () => {
            const userId = 'user123';
            const maps = [
                { _id: 'map1', name: 'Map 1', creator: userId },
                { _id: 'map2', name: 'Map 2', creator: userId }
            ];
            const mockExec = jest.fn().mockResolvedValue(maps);
            const mockLimit = jest.fn().mockReturnValue({ skip: () => ({ exec: mockExec }) });

            Map.find.mockReturnValue({ limit: mockLimit });
            Map.countDocuments.mockResolvedValue(2);

            const result = await MapRepository.findAll({}, 1, 10, userId);

            expect(result.isRight()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual({
                maps,
                totalPages: 1,
                currentPage: 1
            });
        });

        it('should return Left when database query fails', async () => {
            const userId = 'user123';
            const dbError = new Error('Database connection failed');
            const mockExec = jest.fn().mockRejectedValue(dbError);
            const mockLimit = jest.fn().mockReturnValue({ skip: () => ({ exec: mockExec }) });

            Map.find.mockReturnValue({ limit: mockLimit });

            const result = await MapRepository.findAll({}, 1, 10, userId);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(dbError);
        });

        it('should return Left when count query fails', async () => {
            const userId = 'user123';
            const maps = [];
            const countError = new Error('Count operation failed');
            const mockExec = jest.fn().mockResolvedValue(maps);
            const mockLimit = jest.fn().mockReturnValue({ skip: () => ({ exec: mockExec }) });

            Map.find.mockReturnValue({ limit: mockLimit });
            Map.countDocuments.mockRejectedValue(countError);

            const result = await MapRepository.findAll({}, 1, 10, userId);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                value => value
            )).toEqual(countError);
        });
    });
});