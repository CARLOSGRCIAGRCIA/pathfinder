import mongoose from 'mongoose';
import Map from '../../../../src/data/models/Map.js';
import MapRepository from '../../../../src/data/repositories/mapRepository.js';

jest.mock('../../../../src/data/models/Map.js');

describe('MapRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a map successfully', async () => {
      const mapData = { name: 'Test Map', creator: 'user123' };
      const savedMap = { ...mapData, _id: 'map123' };

      const mockMapInstance = {
        validateSync: jest.fn().mockReturnValue(null),
        save: jest.fn().mockResolvedValue(savedMap),
      };

      Map.mockImplementation(() => mockMapInstance);

      const result = await MapRepository.create(mapData);

      expect(result.isRight()).toBe(true);
      result.fold(
        error => fail(`Expected success but got error: ${error}`),
        value => expect(value).toEqual(savedMap)
      );
    });
  });

  describe('findById', () => {
    it('should find map by id', async () => {
      const mockMap = { _id: '1', name: 'Test Map' };
      Map.findOne.mockResolvedValue(mockMap);

      const result = await MapRepository.findById('1', 'user123');

      expect(result.isRight()).toBe(true);
      result.fold(
        error => fail(`Expected success but got error: ${error}`),
        value => expect(value).toEqual(mockMap)
      );
    });

    it('should return left when map not found', async () => {
      Map.findOne.mockResolvedValue(null);

      const result = await MapRepository.findById('nonexistent', 'user123');

      expect(result.isLeft()).toBe(true);
    });
  });
});
