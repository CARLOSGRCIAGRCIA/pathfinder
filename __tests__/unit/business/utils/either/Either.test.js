import { Either } from '../../../../../src/business/utils/either/Either';

describe('Either', () => {
    describe('left', () => {
        it('should create a Left instance', () => {
            const leftInstance = Either.left('error');
            expect(leftInstance.isLeft()).toBe(true);
            expect(leftInstance.isRight()).toBe(false);
        });

        it('should fold correctly for Left', () => {
            const leftInstance = Either.left('error');
            const result = leftInstance.fold(
                (error) => `Error: ${error}`,
                () => 'Success'
            );
            expect(result).toBe('Error: error');
        });

        it('should map correctly for Left', () => {
            const leftInstance = Either.left('error');
            const mapped = leftInstance.map((value) => value.toUpperCase());
            expect(mapped.isLeft()).toBe(true);
            expect(mapped.fold((e) => e, () => null)).toBe('error');
        });

        it('should flatMap correctly for Left', () => {
            const leftInstance = Either.left('error');
            const flatMapped = leftInstance.flatMap(() => Either.right('success'));
            expect(flatMapped.isLeft()).toBe(true);
            expect(flatMapped.fold((e) => e, () => null)).toBe('error');
        });
    });

    describe('right', () => {
        it('should create a Right instance', () => {
            const rightInstance = Either.right('success');
            expect(rightInstance.isLeft()).toBe(false);
            expect(rightInstance.isRight()).toBe(true);
        });

        it('should fold correctly for Right', () => {
            const rightInstance = Either.right('success');
            const result = rightInstance.fold(
                () => 'Error',
                (value) => `Success: ${value}`
            );
            expect(result).toBe('Success: success');
        });

        it('should map correctly for Right', () => {
            const rightInstance = Either.right('success');
            const mapped = rightInstance.map((value) => value.toUpperCase());
            expect(mapped.isRight()).toBe(true);
            expect(mapped.fold(() => null, (v) => v)).toBe('SUCCESS');
        });

        it('should flatMap correctly for Right', () => {
            const rightInstance = Either.right('success');
            const flatMapped = rightInstance.flatMap((value) =>
                Either.right(value.toUpperCase())
            );
            expect(flatMapped.isRight()).toBe(true);
            expect(flatMapped.fold(() => null, (v) => v)).toBe('SUCCESS');
        });
    });

    describe('fromNullable', () => {
        it('should return Right for non-null values', () => {
            const result = Either.fromNullable('value');
            expect(result.isRight()).toBe(true);
            expect(result.fold(() => null, (v) => v)).toBe('value');
        });

        it('should return Left for null or undefined', () => {
            const resultNull = Either.fromNullable(null);
            const resultUndefined = Either.fromNullable(undefined);
            expect(resultNull.isLeft()).toBe(true);
            expect(resultUndefined.isLeft()).toBe(true);
        });
    });

    describe('tryCatch', () => {
        it('should return Right if the function succeeds', async () => {
            const result = await Either.tryCatch(() => 'success');
            expect(result.isRight()).toBe(true);
            expect(result.fold(() => null, (v) => v)).toBe('success');
        });

        it('should return Left if the function throws an error', async () => {
            const result = await Either.tryCatch(() => {
                throw new Error('error');
            });
            expect(result.isLeft()).toBe(true);
            expect(result.fold((e) => e.message, () => null)).toBe('error');
        });
    });
});