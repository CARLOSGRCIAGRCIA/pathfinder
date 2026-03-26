import IWaypointRepository from '../../../../src/business/repositories/IWaypointRepository.js';

describe('IWaypointRepository', () => {
  it('create should return Left with "Not implemented" error', async () => {
    const result = await IWaypointRepository.create({});
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('findByMapId should return Left with "Not implemented" error', async () => {
    const result = await IWaypointRepository.findByMapId('some-map-id');
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('update should return Left with "Not implemented" error', async () => {
    const result = await IWaypointRepository.update('some-waypoint-id', {});
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('delete should return Left with "Not implemented" error', async () => {
    const result = await IWaypointRepository.delete('some-waypoint-id');
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });
});
