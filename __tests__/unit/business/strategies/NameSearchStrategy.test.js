import NameSearchStrategy from '../../../../src/business/strategies/NameSearchStrategy.js';
import { Either } from '../../../../src/business/utils/either/Either.js';
import Map from '../../../../src/data/models/Map.js';

jest.mock('../../../../src/data/models/Map.js');

describe('NameSearchStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('search', () => {
    it('should return a list of maps matching the name query', async () => {
      const mockMaps = [
        { _id: 'map1', name: 'Map 1' },
        { _id: 'map2', name: 'Map 2' },
      ];
      Map.find.mockResolvedValue(mockMaps);

      const query = { name: 'Map' };
      const result = await NameSearchStrategy.search(query);

      expect(result.isRight()).toBe(true);
      expect(result.getOrElse(null)).toEqual(mockMaps);

      expect(Map.find).toHaveBeenCalledWith({ name: new RegExp(query.name, 'i') });
    });

    it('should return an empty list if no maps match the name query', async () => {
      const mockMaps = [];
      Map.find.mockResolvedValue(mockMaps);

      const query = { name: 'NonExistentMap' };
      const result = await NameSearchStrategy.search(query);

      expect(result.isRight()).toBe(true);
      expect(result.getOrElse(null)).toEqual(mockMaps);

      expect(Map.find).toHaveBeenCalledWith({ name: new RegExp(query.name, 'i') });
    });
  });
});
