import JwtTokenStrategy from '../../../../src/business/strategies/JwtTokenStrategy';
import { Either } from '../../../../src/business/utils/either/Either.js';
import jwt from 'jsonwebtoken';
import Environment from '../../../../src/data/config/environment.js';

jest.mock('jsonwebtoken');
jest.mock('../../../../src/data/config/environment.js');

describe('JwtTokenStrategy', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token', async () => {
      const mockToken = 'mockToken123';
      jwt.sign.mockReturnValue(mockToken);

      Environment.JWT_SECRET = 'secret';
      Environment.JWT_EXPIRES_IN = '1h';

      const userId = 'user123';
      const result = await JwtTokenStrategy.generateToken(userId);

      expect(result.isRight()).toBe(true);
      expect(result.getOrElse(null)).toBe(mockToken);

      expect(jwt.sign).toHaveBeenCalledWith({ userId }, Environment.JWT_SECRET, {
        expiresIn: Environment.JWT_EXPIRES_IN,
      });
    });

    it('should return an error if token generation fails', async () => {
      const mockError = new Error('Token generation failed');
      jwt.sign.mockImplementation(() => {
        throw mockError;
      });

      const userId = 'user123';
      const result = await JwtTokenStrategy.generateToken(userId);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error,
          () => 'Should not reach here'
        )
      ).toEqual(mockError);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid JWT token', async () => {
      const mockPayload = { userId: 'user123' };
      jwt.verify.mockReturnValue(mockPayload);

      Environment.JWT_SECRET = 'secret';

      const token = 'mockToken123';
      const result = await JwtTokenStrategy.verifyToken(token);

      expect(result.isRight()).toBe(true);
      expect(result.getOrElse(null)).toEqual(mockPayload);

      expect(jwt.verify).toHaveBeenCalledWith(token, Environment.JWT_SECRET);
    });

    it('should return an error if token verification fails', async () => {
      const mockError = new Error('Invalid token');
      jwt.verify.mockImplementation(() => {
        throw mockError;
      });

      const token = 'invalidToken';
      const result = await JwtTokenStrategy.verifyToken(token);

      expect(result.isLeft()).toBe(true);
      expect(
        result.fold(
          error => error,
          () => 'Should not reach here'
        )
      ).toEqual(mockError);
    });
  });
});
