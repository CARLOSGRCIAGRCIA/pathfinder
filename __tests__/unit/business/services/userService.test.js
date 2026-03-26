import User from '../../../../src/data/models/User.js';
import authService from '../../../../src/business/services/authService.js';
import { AppError } from '../../../../src/business/utils/errorUtils.js';
import { Either } from '../../../../src/business/utils/either/Either.js';
import userService from '../../../../src/business/services/userService.js';

jest.mock('../../../../src/data/models/User.js');
jest.mock('../../../../src/business/services/authService.js');
jest.mock('../../../../src/business/utils/errorUtils.js');
jest.mock('../../../../src/business/utils/either/Either.js');

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    AppError.mockImplementation((message, code) => ({
      message,
      code,
    }));
    Either.left.mockImplementation(value => ({
      fold: leftFn => leftFn(value),
      map: () => Either.left(value),
      flatMap: () => Either.left(value),
    }));
    Either.right.mockImplementation(value => ({
      fold: (_, rightFn) => rightFn(value),
      map: fn => Either.right(fn(value)),
      flatMap: fn => fn(value),
    }));
  });

  describe('login', () => {
    it('should handle invalid credentials', async () => {
      User.findOne.mockResolvedValue(null);

      Either.left.mockImplementation(value => ({
        fold: leftFn => leftFn(value),
      }));

      AppError.mockImplementation((message, code) => ({ message, code }));

      const result = await userService.login('testuser', 'password');

      expect(result.fold).toBeDefined();
      result.fold(
        error => {
          expect(error).toEqual(AppError('Invalid credentials', 401));
        },
        () => fail('Should not have succeeded')
      );
    });
  });

  describe('getProfile', () => {
    it('should get user profile successfully', async () => {
      const mockUser = { _id: '123', username: 'testuser' };

      User.findById.mockResolvedValue(mockUser);

      Either.right.mockImplementation(value => ({
        fold: (_, rightFn) => rightFn(value),
      }));

      const result = await userService.getProfile('123');

      expect(result.fold).toBeDefined();
      result.fold(
        () => fail('Should not have failed'),
        value => {
          expect(value).toEqual(mockUser);
        }
      );
    });

    it('should handle user not found', async () => {
      User.findById.mockResolvedValue(null);

      Either.left.mockImplementation(value => ({
        fold: leftFn => leftFn(value),
      }));

      AppError.mockImplementation((message, code) => ({ message, code }));

      const result = await userService.getProfile('123');

      expect(result.fold).toBeDefined();
      result.fold(
        error => {
          expect(error).toEqual(AppError('User not found', 404));
        },
        () => fail('Should not have succeeded')
      );
    });
  });

  describe('refreshUserToken', () => {
    it('should refresh user token successfully', async () => {
      const mockNewToken = 'newToken';

      authService.refreshToken.mockResolvedValue(Either.right(mockNewToken));

      Either.right.mockImplementation(value => ({
        fold: (_, rightFn) => rightFn(value),
      }));

      const result = await userService.refreshUserToken('oldToken');

      expect(result.fold).toBeDefined();
      result.fold(
        () => fail('Should not have failed'),
        value => {
          expect(value).toEqual(mockNewToken);
        }
      );
    });

    it('should handle refresh token error', async () => {
      authService.refreshToken.mockResolvedValue(
        Either.left(AppError('Error refreshing token', 500))
      );

      Either.left.mockReturnValue({
        fold: leftFn => leftFn({ message: 'Error refreshing token', code: 500 }),
      });

      const result = await userService.refreshUserToken('oldToken');

      result.fold(
        error => {
          expect(error).toEqual(
            expect.objectContaining({
              message: 'Error refreshing token',
              code: 500,
            })
          );
        },
        () => fail('Should not have succeeded')
      );
    });

    it('should handle missing refresh token', async () => {
      authService.refreshToken.mockResolvedValue(
        Either.left(AppError('Refresh token is required', 400))
      );

      Either.left.mockReturnValue({
        fold: leftFn => leftFn({ message: 'Refresh token is required', code: 400 }),
      });

      const result = await userService.refreshUserToken(null);

      result.fold(
        error => {
          expect(error).toEqual(
            expect.objectContaining({
              message: 'Refresh token is required',
              code: 400,
            })
          );
        },
        () => fail('Should not have succeeded')
      );
    });
  });
});
