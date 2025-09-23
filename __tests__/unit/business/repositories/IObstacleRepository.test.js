import IObstacleRepository from '../../../../src/business/repositories/IObstacleRepository.js';

describe('IObstacleRepository', () => {
    it('create should return Left with "Not implemented" error', async () => {
        const result = await IObstacleRepository.create({});
        expect(result.isLeft()).toBe(true);
        result.fold(
            (error) => expect(error).toEqual(new Error('Not implemented')),
            () => fail('Expected Left but got Right')
        );
    });

    it('findByMapId should return Left with "Not implemented" error', async () => {
        const result = await IObstacleRepository.findByMapId('some-map-id');
        expect(result.isLeft()).toBe(true);
        result.fold(
            (error) => expect(error).toEqual(new Error('Not implemented')),
            () => fail('Expected Left but got Right')
        );
    });

    it('update should return Left with "Not implemented" error', async () => {
        const result = await IObstacleRepository.update('some-obstacle-id', {});
        expect(result.isLeft()).toBe(true);
        result.fold(
            (error) => expect(error).toEqual(new Error('Not implemented')),
            () => fail('Expected Left but got Right')
        );
    });

    it('delete should return Left with "Not implemented" error', async () => {
        const result = await IObstacleRepository.delete('some-obstacle-id');
        expect(result.isLeft()).toBe(true);
        result.fold(
            (error) => expect(error).toEqual(new Error('Not implemented')),
            () => fail('Expected Left but got Right')
        );
    });
});
