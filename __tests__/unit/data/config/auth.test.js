import jwt from 'jsonwebtoken';
import TokenService from '../../../../src/data/config/auth.js';
import environment from '../../../../src/data/config/environment.js';

jest.mock('jsonwebtoken');

describe('TokenService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token', () => {
      const mockToken = 'mock-token';
      jwt.sign.mockReturnValue(mockToken);

      const result = TokenService.generateToken('user-id');
      expect(result).toBe(mockToken);
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 'user-id' }, environment.JWT_SECRET, {
        expiresIn: environment.JWT_EXPIRES_IN,
      });
    });
  });

  describe('verifyToken', () => {
    it('should verify a token', () => {
      const mockDecoded = { userId: 'user-id' };
      jwt.verify.mockReturnValue(mockDecoded);

      const result = TokenService.verifyToken('mock-token');
      expect(result).toEqual(mockDecoded);
      expect(jwt.verify).toHaveBeenCalledWith('mock-token', environment.JWT_SECRET);
    });

    it('should throw an error if token is invalid', () => {
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      expect(() => TokenService.verifyToken('invalid-token')).toThrow('Invalid token');
    });
  });
});
