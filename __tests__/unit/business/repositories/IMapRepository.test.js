import IMapRepository from '../../../../src/business/repositories/IMapRepository.js';

describe('IMapRepository', () => {
  it('create should return Left with "Not implemented" error', async () => {
    const result = await IMapRepository.create({});
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('findById should return Left with "Not implemented" error', async () => {
    const result = await IMapRepository.findById('some-id');
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('update should return Left with "Not implemented" error', async () => {
    const result = await IMapRepository.update('some-id', {});
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('delete should return Left with "Not implemented" error', async () => {
    const result = await IMapRepository.delete('some-id');
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });

  it('findAll should return Left with "Not implemented" error', async () => {
    const result = await IMapRepository.findAll({}, 1, 10);
    expect(result.isLeft()).toBe(true);
    result.fold(
      error => expect(error).toEqual(new Error('Not implemented')),
      () => fail('Expected Left but got Right')
    );
  });
});
