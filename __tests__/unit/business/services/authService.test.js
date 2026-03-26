import { Either } from '../../../../src/business/utils/either/Either.js';
import { createError } from '../../../../src/business/utils/errorUtils.js';
import JwtTokenStrategy from '../../../../src/business/strategies/JwtTokenStrategy.js';
import RefreshTokenStrategy from '../../../../src/business/strategies/RefreshTokenStrategy.js';
import { createAuthService } from '../../../../src/business/services/authService.js';

jest.mock('../../../../src/business/strategies/JwtTokenStrategy.js');
jest.mock('../../../../src/business/strategies/RefreshTokenStrategy.js');

const mockTokenStrategy = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
};

const mockRefreshTokenStrategy = {
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
};

const authService = createAuthService(mockTokenStrategy, mockRefreshTokenStrategy);

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token for a valid userId', () => {
      mockTokenStrategy.generateToken.mockReturnValue('mockedToken');
      const token = authService.generateToken('user123');
      expect(token).toBe('mockedToken');
      expect(mockTokenStrategy.generateToken).toHaveBeenCalledWith('user123');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a refresh token for a valid userId', () => {
      mockRefreshTokenStrategy.generateToken.mockReturnValue('mockedRefreshToken');
      const token = authService.generateRefreshToken('user123');
      expect(token).toBe('mockedRefreshToken');
      expect(mockRefreshTokenStrategy.generateToken).toHaveBeenCalledWith('user123');
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      mockTokenStrategy.verifyToken.mockReturnValue('decodedPayload');
      const result = authService.verifyToken('validToken');
      expect(result).toBe('decodedPayload');
      expect(mockTokenStrategy.verifyToken).toHaveBeenCalledWith('validToken');
    });
  });

  describe('refreshToken', () => {
    it('should return an error if no refresh token is provided', async () => {
      const result = await authService.refreshToken(null);
      expect(result.isLeft()).toBe(true);
      result.fold(
        err => {
          expect(err.message).toBe('Refresh token is required');
          expect(err.statusCode).toBe(400);
        },
        _ => fail('Should not reach here')
      );
    });

    it('should return an error if refresh token verification fails', async () => {
      mockRefreshTokenStrategy.verifyToken.mockResolvedValue(
        Either.left(createError('Invalid token', 401))
      );
      const result = await authService.refreshToken('invalidToken');
      expect(result.isLeft()).toBe(true);
      result.fold(
        err => {
          expect(err.message).toBe('Invalid token');
          expect(err.statusCode).toBe(401);
        },
        _ => fail('Should not reach here')
      );
    });

    it('should generate a new access token if refresh token is valid', async () => {
      mockRefreshTokenStrategy.verifyToken.mockResolvedValue(Either.right({ userId: 'user123' }));
      mockTokenStrategy.generateToken.mockReturnValue(Either.right('newAccessToken'));

      const result = await authService.refreshToken('validRefreshToken');
      expect(result.isRight()).toBe(true);
      result.fold(
        _ => fail('Should not reach here'),
        val =>
          expect(val).toEqual({ accessToken: 'newAccessToken', refreshToken: 'validRefreshToken' })
      );
    });
  });
});
