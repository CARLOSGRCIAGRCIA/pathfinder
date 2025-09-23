import RefreshTokenStrategy from '../../../../src/business/strategies/RefreshTokenStrategy.js';
import { Either } from '../../../../src/business/utils/either/Either.js';
import jwt from 'jsonwebtoken';
import Environment from '../../../../src/data/config/environment.js';

jest.mock('jsonwebtoken');
jest.mock('../../../../src/data/config/environment.js');

describe('RefreshTokenStrategy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateToken', () => {
        it('should generate a valid refresh token', async () => {
            const mockToken = 'mockRefreshToken123';
            jwt.sign.mockReturnValue(mockToken);

            Environment.REFRESH_TOKEN_SECRET = 'refreshSecret';
            Environment.REFRESH_TOKEN_EXPIRES_IN = '7d';

            const userId = 'user123';
            const result = await RefreshTokenStrategy.generateToken(userId);

            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toBe(mockToken);

            expect(jwt.sign).toHaveBeenCalledWith(
                { userId },
                Environment.REFRESH_TOKEN_SECRET,
                { expiresIn: Environment.REFRESH_TOKEN_EXPIRES_IN }
            );
        });

        it('should return an error if token generation fails', async () => {
            const mockError = new Error('Token generation failed');
            jwt.sign.mockImplementation(() => {
                throw mockError;
            });

            const userId = 'user123';
            const result = await RefreshTokenStrategy.generateToken(userId); 

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                () => 'Should not reach here'
            )).toEqual(mockError);
        });
    });

    describe('verifyToken', () => {
        it('should verify a valid refresh token', async () => {
            const mockPayload = { userId: 'user123' };
            jwt.verify.mockReturnValue(mockPayload);

            Environment.REFRESH_TOKEN_SECRET = 'refreshSecret';

            const token = 'mockRefreshToken123';
            const result = await RefreshTokenStrategy.verifyToken(token);

            expect(result.isRight()).toBe(true);
            expect(result.getOrElse(null)).toEqual(mockPayload);

            expect(jwt.verify).toHaveBeenCalledWith(token, Environment.REFRESH_TOKEN_SECRET);
        });

        it('should return an error if token verification fails', async () => {
            const mockError = new Error('Invalid token');
            jwt.verify.mockImplementation(() => {
                throw mockError;
            });

            const token = 'invalidRefreshToken';
            const result = await RefreshTokenStrategy.verifyToken(token);

            expect(result.isLeft()).toBe(true);
            expect(result.fold(
                error => error,
                () => 'Should not reach here'
            )).toEqual(mockError);
        });
    });
});