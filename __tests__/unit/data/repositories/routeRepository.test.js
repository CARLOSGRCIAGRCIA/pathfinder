import RouteRepository from '../../../../src/data/repositories/routeRepository.js';
import Route from '../../../../src/data/models/Route.js';
import { Either } from '../../../../src/business/utils/either/Either.js';
import { AppError } from '../../../../src/business/utils/errorUtils.js';

jest.mock('../../../../src/data/models/Route', () => {
  return {
    __esModule: true,
    default: jest.fn(),
  };
});

describe('RouteRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a route successfully', async () => {
      const routeData = { name: 'Test Route', points: [] };
      const savedRoute = { ...routeData, _id: 'route123' };

      const mockValidateSync = jest.fn().mockReturnValue(null);
      const mockSave = jest.fn().mockResolvedValue(savedRoute);
      Route.mockImplementation(() => ({
        validateSync: mockValidateSync,
        save: mockSave,
      }));

      const result = await RouteRepository.create(routeData);

      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(savedRoute);
      expect(mockSave).toHaveBeenCalled();
    });

    it('should return Left when validation fails', async () => {
      const routeData = { name: 'Test Route', points: [] };
      const validationError = new Error('Validation failed');

      const mockValidateSync = jest.fn().mockReturnValue(validationError);
      Route.mockImplementation(() => ({
        validateSync: mockValidateSync,
      }));

      const result = await RouteRepository.create(routeData);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(validationError);
    });

    it('should return Left when save fails', async () => {
      const routeData = { name: 'Test Route', points: [] };
      const error = new Error('Save failed');

      const mockValidateSync = jest.fn().mockReturnValue(null);
      const mockSave = jest.fn().mockRejectedValue(error);
      Route.mockImplementation(() => ({
        validateSync: mockValidateSync,
        save: mockSave,
      }));

      const result = await RouteRepository.create(routeData);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(error);
    });
  });

  describe('findAll', () => {
    it('should find all routes successfully', async () => {
      const routes = [
        { _id: 'route1', name: 'Route 1' },
        { _id: 'route2', name: 'Route 2' },
      ];

      Route.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(routes),
      });

      const result = await RouteRepository.findAll();

      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(routes);
    });

    it('should return Left when find fails', async () => {
      const error = new Error('Find failed');

      Route.find = jest.fn().mockReturnValue({
        lean: jest.fn().mockRejectedValue(error),
      });

      const result = await RouteRepository.findAll();

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(error);
    });
  });

  describe('findById', () => {
    it('should find route by id successfully', async () => {
      const routeId = 'route123';
      const route = { _id: routeId, name: 'Test Route' };

      Route.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(route),
      });

      const result = await RouteRepository.findById(routeId);

      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(route);
    });

    it('should return Left when route not found', async () => {
      const routeId = 'nonexistent';

      Route.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      const result = await RouteRepository.findById(routeId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error.message,
          value => value
        )
      ).toBe('Route not found');
    });
  });

  describe('delete', () => {
    it('should delete route successfully', async () => {
      const routeId = 'route123';
      const deletedRoute = { _id: routeId, name: 'Deleted Route' };

      Route.findByIdAndDelete = jest.fn().mockResolvedValue(deletedRoute);

      const result = await RouteRepository.delete(routeId);

      expect(result.isRight()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(deletedRoute);
    });

    it('should return Left when route not found for deletion', async () => {
      const routeId = 'nonexistent';

      Route.findByIdAndDelete = jest.fn().mockResolvedValue(null);

      const result = await RouteRepository.delete(routeId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error.message,
          value => value
        )
      ).toBe('Route not found');
    });

    it('should return Left when delete fails', async () => {
      const routeId = 'route123';
      const error = new Error('Delete failed');

      Route.findByIdAndDelete = jest.fn().mockRejectedValue(error);

      const result = await RouteRepository.delete(routeId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error,
          value => value
        )
      ).toEqual(error);
    });
  });
});
