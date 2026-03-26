import DefaultWaypointStrategy from '../../../../src/business/strategies/DefaultWaypointStrategy.js';
import WaypointRepository from '../../../../src/data/repositories/waypointRepository.js';

jest.mock('../../../../src/data/repositories/waypointRepository.js');

describe('DefaultWaypointStrategy', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  test('create should return a new waypoint', async () => {
    const mapId = 'map123';
    const waypointData = { name: 'Waypoint 1', position: { x: 5, y: 5 } };
    const expectedResult = { id: 'waypoint123', ...waypointData, map: mapId };

    WaypointRepository.create.mockResolvedValue(expectedResult);

    const result = await DefaultWaypointStrategy.create(mapId, waypointData);
    expect(result).toEqual(expectedResult);
    expect(WaypointRepository.create).toHaveBeenCalledWith({ ...waypointData, map: mapId });
  });

  test('create should handle repository error', async () => {
    const mapId = 'map123';
    const waypointData = { name: 'Waypoint 1', position: { x: 5, y: 5 } };
    const error = new Error('Repository error');

    WaypointRepository.create.mockRejectedValue(error);

    await expect(DefaultWaypointStrategy.create(mapId, waypointData)).rejects.toThrow(error);
  });

  test('createMultiple should return new waypoints', async () => {
    const mapId = 'map123';
    const waypointsData = [
      { name: 'Waypoint 1', position: { x: 5, y: 5 } },
      { name: 'Waypoint 2', position: { x: 10, y: 10 } },
    ];
    const expectedResult = waypointsData.map((waypoint, index) => ({
      id: `waypoint${index + 1}`,
      ...waypoint,
      map: mapId,
    }));

    WaypointRepository.createMultiple.mockResolvedValue(expectedResult);

    const result = await DefaultWaypointStrategy.createMultiple(mapId, waypointsData);
    expect(result).toEqual(expectedResult);
    expect(WaypointRepository.createMultiple).toHaveBeenCalledWith(
      waypointsData.map(waypoint => ({ ...waypoint, map: mapId }))
    );
  });

  test('createMultiple should handle repository error', async () => {
    const mapId = 'map123';
    const waypointsData = [
      { name: 'Waypoint 1', position: { x: 5, y: 5 } },
      { name: 'Waypoint 2', position: { x: 10, y: 10 } },
    ];
    const error = new Error('Repository error');

    WaypointRepository.createMultiple.mockRejectedValue(error);

    await expect(DefaultWaypointStrategy.createMultiple(mapId, waypointsData)).rejects.toThrow(
      error
    );
  });

  test('findByMapId should return waypoints for a map', async () => {
    const mapId = 'map123';
    const expectedResult = [
      { id: 'waypoint123', name: 'Waypoint 1', position: { x: 5, y: 5 }, map: mapId },
    ];

    WaypointRepository.findByMapId.mockResolvedValue(expectedResult);

    const result = await DefaultWaypointStrategy.findByMapId(mapId);
    expect(result).toEqual(expectedResult);
    expect(WaypointRepository.findByMapId).toHaveBeenCalledWith(mapId);
  });

  test('findByMapId should handle repository error', async () => {
    const mapId = 'map123';
    const error = new Error('Repository error');

    WaypointRepository.findByMapId.mockRejectedValue(error);

    await expect(DefaultWaypointStrategy.findByMapId(mapId)).rejects.toThrow(error);
  });

  test('update should return the updated waypoint', async () => {
    const waypointId = 'waypoint123';
    const waypointData = { name: 'Updated Waypoint', position: { x: 15, y: 15 } };
    const expectedResult = { id: waypointId, ...waypointData };

    WaypointRepository.update.mockResolvedValue(expectedResult);

    const result = await DefaultWaypointStrategy.update(waypointId, waypointData);
    expect(result).toEqual(expectedResult);
    expect(WaypointRepository.update).toHaveBeenCalledWith(waypointId, waypointData);
  });

  test('update should handle repository error', async () => {
    const waypointId = 'waypoint123';
    const waypointData = { name: 'Updated Waypoint', position: { x: 15, y: 15 } };
    const error = new Error('Repository error');

    WaypointRepository.update.mockRejectedValue(error);

    await expect(DefaultWaypointStrategy.update(waypointId, waypointData)).rejects.toThrow(error);
  });

  test('delete should return the deleted waypoint', async () => {
    const waypointId = 'waypoint123';
    const expectedResult = { id: waypointId, name: 'Waypoint 1', position: { x: 5, y: 5 } };

    WaypointRepository.delete.mockResolvedValue(expectedResult);

    const result = await DefaultWaypointStrategy.delete(waypointId);
    expect(result).toEqual(expectedResult);
    expect(WaypointRepository.delete).toHaveBeenCalledWith(waypointId);
  });

  test('delete should handle repository error', async () => {
    const waypointId = 'waypoint123';
    const error = new Error('Repository error');

    WaypointRepository.delete.mockRejectedValue(error);

    await expect(DefaultWaypointStrategy.delete(waypointId)).rejects.toThrow(error);
  });
});
