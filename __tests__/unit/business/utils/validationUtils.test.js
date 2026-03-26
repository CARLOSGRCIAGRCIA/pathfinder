import { body, validationResult } from 'express-validator';
import {
  validate,
  obstacleValidation,
  waypointValidation,
  validateIdFormat,
  validateIdExistence,
  validateStoppingPoints,
  checkReachability,
  validateComplexGeometry,
  routeValidation,
  userValidation,
  mapValidations,
} from '../../../../src/business/utils/validationUtils';
import { findOptimalPath } from '../../../../src/business/services/pathFinderService.js';
import Map from '../../../../src/data/models/Map.js';
import Waypoint from '../../../../src/data/models/Waypoint.js';
import Obstacle from '../../../../src/data/models/Obstacle.js';
import Route from '../../../../src/data/models/Route.js';
import { Either } from '../../../../src/business/utils/either/Either.js';

jest.mock('../../../../src/data/models/Map.js');
jest.mock('../../../../src/data/models/Waypoint.js');
jest.mock('../../../../src/data/models/Obstacle.js');
jest.mock('../../../../src/data/models/Route.js');
jest.mock('../../../../src/business/services/pathFinderService.js');

describe('validationUtils', () => {
  describe('validate', () => {
    it('should call next if validation passes', async () => {
      const mockReq = { body: {} };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate([])(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 with errors if validation fails', async () => {
      const mockReq = { body: {} };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate([body('field').notEmpty()])(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('obstacleValidation', () => {
    it('should validate obstacle fields correctly', async () => {
      const mockReq = { body: [{ x: 1, y: 2 }] };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(obstacleValidation)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error if x is not a non-negative integer', async () => {
      const mockReq = { body: [{ x: -1, y: 2 }] };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(obstacleValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'X must be a non-negative integer' }),
        ]),
      });
    });

    it('should return error if y is not a non-negative integer', async () => {
      const mockReq = { body: [{ x: 1, y: -2 }] };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(obstacleValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Y must be a non-negative integer' }),
        ]),
      });
    });

    it('should return error if size is not between 1 and 3', async () => {
      const mockReq = { body: [{ x: 1, y: 2, size: 4 }] };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(obstacleValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Size must be between 1 and 3' }),
        ]),
      });
    });
  });

  describe('waypointValidation', () => {
    it('should validate waypoint fields correctly', async () => {
      const mockReq = { body: [{ x: 1, y: 2, name: 'Waypoint 1' }] };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(waypointValidation)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error if x is not a non-negative integer', async () => {
      const mockReq = { body: [{ x: -1, y: 2, name: 'Waypoint 1' }] };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(waypointValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'X must be a non-negative integer' }),
        ]),
      });
    });

    it('should return error if y is not a non-negative integer', async () => {
      const mockReq = { body: [{ x: 1, y: -2, name: 'Waypoint 1' }] };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(waypointValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({ msg: 'Y must be a non-negative integer' }),
        ]),
      });
    });

    it('should return error if name is missing', async () => {
      const mockReq = { body: [{ x: 1, y: 2 }] };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(waypointValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([expect.objectContaining({ msg: 'Name is required' })]),
      });
    });
  });

  describe('validateIdFormat', () => {
    it('should validate ID format correctly', async () => {
      const mockReq = { params: { id: '507f1f77bcf86cd799439011' } };
      const mockRes = {};
      const mockNext = jest.fn();

      await validateIdFormat('id')(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('validateIdFormat should pass for a valid ID', async () => {
      const mockReq = { params: { id: '507f1f77bcf86cd799439011' } };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate([validateIdFormat('id')])(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('validateIdFormat should fail for an ID with less than 24 characters', async () => {
      const mockReq = { params: { id: '123' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate([validateIdFormat('id')])(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([expect.objectContaining({ msg: 'Invalid ID format' })]),
      });
    });

    it('validateIdFormat should fail for an ID with non-hexadecimal characters', async () => {
      const mockReq = { params: { id: 'zzzzzzzzzzzzzzzzzzzzzzzz' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate([validateIdFormat('id')])(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([expect.objectContaining({ msg: 'Invalid ID format' })]),
      });
    });

    it('should return error if ID format is invalid', async () => {
      const mockReq = { params: { id: 'invalid-id' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate([validateIdFormat('id')])(mockReq, mockRes, mockNext);

      expect(mockRes.status).toHaveBeenCalledWith(400);

      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Invalid ID format',
          }),
        ]),
      });
    });
  });

  describe('validateIdExistence', () => {
    it('should validate ID existence correctly', async () => {
      const mockReq = { params: { id: '507f1f77bcf86cd799439011' } };
      const mockRes = {};
      const mockNext = jest.fn();

      Map.findById.mockResolvedValue(true);

      await validateIdExistence('id', Map)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('validateIdExistence should pass for an existing ID', async () => {
      const mockReq = { params: { id: '507f1f77bcf86cd799439011' } };
      const mockRes = {};
      const mockNext = jest.fn();

      Map.findById.mockResolvedValue(true);

      await validate([validateIdExistence('id', Map)])(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('validateIdExistence should fail for a non-existing ID', async () => {
      const mockReq = { params: { id: '507f1f77bcf86cd799439011' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      Map.findById.mockResolvedValue(false);

      await validate([validateIdExistence('id', Map)])(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([expect.objectContaining({ msg: 'ID does not exist' })]),
      });
    });

    it('should return error if ID does not exist', async () => {
      const mockReq = { params: { id: '507f1f77bcf86cd799439011' } };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      Map.findById.mockResolvedValue(false);

      await validate([validateIdExistence('id', Map)])(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('routeValidation', () => {
    it('should validate route fields correctly', async () => {
      const mockReq = {
        body: {
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
          waypoints: [],
          userPreferences: {},
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(routeValidation)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('validateStoppingPoints should pass for a map with at least one waypoint', async () => {
      const mapId = '507f1f77bcf86cd799439011';
      Waypoint.find.mockResolvedValue([{ x: 5, y: 5, name: 'Waypoint 1' }]);

      const result = await validateStoppingPoints(mapId);
      expect(result.isRight()).toBe(true);
      expect(result.getOrElse()).toEqual({
        valid: true,
        message: 'Map contains at least one valid stopping point.',
      });
    });

    it('checkReachability should pass if all waypoints are reachable', async () => {
      const mapId = '507f1f77bcf86cd799439011';
      const map = { start: { x: 0, y: 0 }, end: { x: 9, y: 9 } };
      const obstacles = [];
      const waypoints = [{ x: 5, y: 5 }];

      Map.findById.mockResolvedValue(map);
      Obstacle.find.mockResolvedValue(obstacles);
      Waypoint.find.mockResolvedValue(waypoints);

      const result = await checkReachability(mapId);
      expect(result.isRight()).toBe(true);
      expect(result.getOrElse()).toEqual({
        reachable: true,
        unreachablePoints: [],
      });
    });

    it('validateComplexGeometry should pass for a map with complex geometry', async () => {
      const mapId = '507f1f77bcf86cd799439011';
      const map = { start: { x: 0, y: 0 }, end: { x: 9, y: 9 }, width: 10, height: 10 };
      const obstacles = [{ x: 1, y: 1 }];
      const waypoints = [{ x: 5, y: 5 }];

      Map.findById.mockResolvedValue(map);
      Obstacle.find.mockResolvedValue(obstacles);
      Waypoint.find.mockResolvedValue(waypoints);
      findOptimalPath.mockReturnValue(Either.right({ path: [] }));

      const result = await validateComplexGeometry(mapId);
      expect(result.isRight()).toBe(true);
      expect(result.getOrElse()).toEqual({
        valid: true,
        message: 'Algorithm can handle maps with complex geometries.',
      });
    });

    it('should return error if start is missing', async () => {
      const mockReq = {
        body: {
          end: { x: 9, y: 9 },
          waypoints: [],
          userPreferences: {},
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(routeValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return error if end is missing', async () => {
      const mockReq = {
        body: {
          start: { x: 0, y: 0 },
          waypoints: [],
          userPreferences: {},
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(routeValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });
    it('should return error if start and end points are the same', async () => {
      const mockReq = {
        body: {
          start: { x: 5, y: 5 },
          end: { x: 5, y: 5 },
          waypoints: [],
          userPreferences: {},
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(routeValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        errors: expect.arrayContaining([
          expect.objectContaining({
            msg: 'Start and end points cannot be the same',
          }),
        ]),
      });
    });

    it('should validate optional waypoints array', async () => {
      const mockReq = {
        body: {
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
          waypoints: [{ x: 5, y: 5, name: 'Midpoint' }],
          userPreferences: {},
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(routeValidation)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should validate optional userPreferences object', async () => {
      const mockReq = {
        body: {
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
          waypoints: [],
          userPreferences: { avoidStairs: true },
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(routeValidation)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('userValidation', () => {
    it('should validate user fields correctly', async () => {
      const mockReq = {
        body: {
          username: 'testuser',
          password: 'password123',
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(userValidation)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error if username is too short', async () => {
      const mockReq = {
        body: {
          username: 'tu',
          password: 'password123',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(userValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return error if password is too short', async () => {
      const mockReq = {
        body: {
          username: 'testuser',
          password: 'pass',
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(userValidation)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });

  describe('mapValidations', () => {
    it('should validate map fields correctly', async () => {
      const mockReq = {
        body: {
          name: 'Map 1',
          width: 100,
          height: 100,
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(mapValidations)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error if name is missing', async () => {
      const mockReq = {
        body: {
          width: 10,
          height: 10,
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(mapValidations)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });

    it('should return error if width is out of range', async () => {
      const mockReq = {
        body: {
          name: 'Map 1',
          width: 0,
          height: 10,
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(mapValidations)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });
    it('should trim whitespace from name', async () => {
      const mockReq = {
        body: {
          name: '  Map 1  ',
          width: 100,
          height: 100,
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
        },
      };
      const mockRes = {};
      const mockNext = jest.fn();

      await validate(mapValidations)(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return error if height is out of range', async () => {
      const mockReq = {
        body: {
          name: 'Map 1',
          width: 10,
          height: 101,
          start: { x: 0, y: 0 },
          end: { x: 9, y: 9 },
        },
      };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const mockNext = jest.fn();

      await validate(mapValidations)(mockReq, mockRes, mockNext);
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalled();
    });
  });
});
