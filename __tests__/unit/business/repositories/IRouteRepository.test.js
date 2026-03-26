import IRouteRepository from '../../../../src/business/repositories/IRouteRepository';

describe('IRouteRepository', () => {
  it('create should return Left with "Not implemented" error', async () => {
    const result = await IRouteRepository.create({});
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('findAll should return Left with "Not implemented" error', async () => {
    const result = await IRouteRepository.findAll();
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('findById should return Left with "Not implemented" error', async () => {
    const result = await IRouteRepository.findById('some-route-id');
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('delete should return Left with "Not implemented" error', async () => {
    const result = await IRouteRepository.delete('some-route-id');
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });
});
