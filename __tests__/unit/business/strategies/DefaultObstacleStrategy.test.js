import DefaultObstacleStrategy from '../../../../src/business/strategies/DefaultObstacleStrategy.js';
import ObstacleRepository from '../../../../src/data/repositories/obstacleRepository.js';

jest.mock('../../../../src/data/repositories/obstacleRepository.js');

describe('DefaultObstacleStrategy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Tests para create
  test('create should return a new obstacle', async () => {
    const mapId = 'map123';
    const obstacleData = { name: 'Rock', position: { x: 10, y: 20 } };
    const expectedResult = { id: 'obstacle123', ...obstacleData, map: mapId };

    ObstacleRepository.create.mockResolvedValue(expectedResult);

    const result = await DefaultObstacleStrategy.create(mapId, obstacleData);
    expect(result).toEqual(expectedResult);
    expect(ObstacleRepository.create).toHaveBeenCalledWith({ ...obstacleData, map: mapId });
  });

  test('create should handle repository error', async () => {
    const mapId = 'map123';
    const obstacleData = { name: 'Rock', position: { x: 10, y: 20 } };
    const error = new Error('Repository error');

    ObstacleRepository.create.mockRejectedValue(error);

    await expect(DefaultObstacleStrategy.create(mapId, obstacleData)).rejects.toThrow(error);
  });

  // Tests para createMultiple
  test('createMultiple should return new obstacles', async () => {
    const mapId = 'map123';
    const obstaclesData = [
      { name: 'Rock', position: { x: 10, y: 20 } },
      { name: 'Tree', position: { x: 15, y: 25 } },
    ];
    const expectedResult = obstaclesData.map((obstacle, index) => ({
      id: `obstacle${index + 1}`,
      ...obstacle,
      map: mapId,
    }));

    ObstacleRepository.createMultiple.mockResolvedValue(expectedResult);

    const result = await DefaultObstacleStrategy.createMultiple(mapId, obstaclesData);
    expect(result).toEqual(expectedResult);
    expect(ObstacleRepository.createMultiple).toHaveBeenCalledWith(
      obstaclesData.map((obstacle) => ({ ...obstacle, map: mapId }))
    );
  });

  test('createMultiple should handle repository error', async () => {
    const mapId = 'map123';
    const obstaclesData = [
      { name: 'Rock', position: { x: 10, y: 20 } },
      { name: 'Tree', position: { x: 15, y: 25 } },
    ];
    const error = new Error('Repository error');

    ObstacleRepository.createMultiple.mockRejectedValue(error);

    await expect(DefaultObstacleStrategy.createMultiple(mapId, obstaclesData)).rejects.toThrow(error);
  });

  // Tests para findByMapId
  test('findByMapId should return obstacles for a map', async () => {
    const mapId = 'map123';
    const expectedResult = [{ id: 'obstacle123', name: 'Rock', position: { x: 10, y: 20 }, map: mapId }];

    ObstacleRepository.findByMapId.mockResolvedValue(expectedResult);

    const result = await DefaultObstacleStrategy.findByMapId(mapId);
    expect(result).toEqual(expectedResult);
    expect(ObstacleRepository.findByMapId).toHaveBeenCalledWith(mapId);
  });

  test('findByMapId should handle repository error', async () => {
    const mapId = 'map123';
    const error = new Error('Repository error');

    ObstacleRepository.findByMapId.mockRejectedValue(error);

    await expect(DefaultObstacleStrategy.findByMapId(mapId)).rejects.toThrow(error);
  });

  // Tests para update
  test('update should return the updated obstacle', async () => {
    const obstacleId = 'obstacle123';
    const obstacleData = { name: 'Updated Rock', position: { x: 15, y: 25 } };
    const expectedResult = { id: obstacleId, ...obstacleData };

    ObstacleRepository.update.mockResolvedValue(expectedResult);

    const result = await DefaultObstacleStrategy.update(obstacleId, obstacleData);
    expect(result).toEqual(expectedResult);
    expect(ObstacleRepository.update).toHaveBeenCalledWith(obstacleId, obstacleData);
  });

  test('update should handle repository error', async () => {
    const obstacleId = 'obstacle123';
    const obstacleData = { name: 'Updated Rock', position: { x: 15, y: 25 } };
    const error = new Error('Repository error');

    ObstacleRepository.update.mockRejectedValue(error);

    await expect(DefaultObstacleStrategy.update(obstacleId, obstacleData)).rejects.toThrow(error);
  });

  // Tests para delete
  test('delete should return the deleted obstacle', async () => {
    const obstacleId = 'obstacle123';
    const expectedResult = { id: obstacleId, name: 'Rock', position: { x: 10, y: 20 } };

    ObstacleRepository.delete.mockResolvedValue(expectedResult);

    const result = await DefaultObstacleStrategy.delete(obstacleId);
    expect(result).toEqual(expectedResult);
    expect(ObstacleRepository.delete).toHaveBeenCalledWith(obstacleId);
  });

  test('delete should handle repository error', async () => {
    const obstacleId = 'obstacle123';
    const error = new Error('Repository error');

    ObstacleRepository.delete.mockRejectedValue(error);

    await expect(DefaultObstacleStrategy.delete(obstacleId)).rejects.toThrow(error);
  });
});