import { registerUser, loginUser, getUserProfile, refreshUserTokenHandler } from '../../../../src/presentation/controllers/userController';
import userService from '../../../../src/business/services/userService';
import { Either } from '../../../../src/business/utils/either/Either';
import { AppError } from '../../../../src/business/utils/errorUtils';

jest.mock('../../../../src/business/services/userService', () => ({
    register: jest.fn(),
    login: jest.fn(),
    getProfile: jest.fn(),
    refreshUserToken: jest.fn()
}));

describe('UserController', () => {
    let mockReq;
    let mockRes;
    let mockNext;

    beforeEach(() => {
        mockReq = {
            body: {},
            user: { id: 'test-user-id' }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('registerUser', () => {
        const mockUserData = {
            username: 'testuser',
            email: 'test@test.com',
            password: 'password123'
        };

        test('should successfully register a new user', async () => {
            mockReq.body = mockUserData;
            const mockUser = { id: 1, ...mockUserData };
            userService.register.mockResolvedValue(Either.right(mockUser));

            await registerUser(mockReq, mockRes, mockNext);

            expect(userService.register).toHaveBeenCalledWith(mockUserData);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(mockUser);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should handle validation errors during registration', async () => {
            mockReq.body = mockUserData;
            const error = new AppError('Validation failed', 400);
            userService.register.mockResolvedValue(Either.left(error));

            await registerUser(mockReq, mockRes, mockNext);

            expect(userService.register).toHaveBeenCalledWith(mockUserData);
            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
        });

    });

    describe('loginUser', () => {
        const mockCredentials = {
            username: 'testuser',
            password: 'password123'
        };

        test('should successfully login a user', async () => {
            mockReq.body = mockCredentials;
            const mockTokens = { accessToken: 'access-token', refreshToken: 'refresh-token' };
            userService.login.mockResolvedValue(Either.right(mockTokens));

            await loginUser(mockReq, mockRes, mockNext);

            expect(userService.login).toHaveBeenCalledWith(mockCredentials.username, mockCredentials.password);
            expect(mockRes.json).toHaveBeenCalledWith(mockTokens);
            expect(mockNext).not.toHaveBeenCalled();
        });

        test('should handle invalid credentials', async () => {
            mockReq.body = mockCredentials;
            const error = new AppError('Invalid credentials', 401);
            userService.login.mockResolvedValue(Either.left(error));

            await loginUser(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('getUserProfile', () => {
        test('should successfully retrieve user profile', async () => {
            const mockUser = { id: 'test-user-id', username: 'testuser', email: 'test@test.com' };
            userService.getProfile.mockResolvedValue(Either.right(mockUser));

            await getUserProfile(mockReq, mockRes, mockNext);

            expect(userService.getProfile).toHaveBeenCalledWith('test-user-id');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith(mockUser);
        });

        test('should handle user not found error', async () => {
            const error = new AppError('User not found', 404);
            userService.getProfile.mockResolvedValue(Either.left(error));

            await getUserProfile(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });

    describe('refreshUserTokenHandler', () => {
        test('should successfully refresh user token', async () => {
            mockReq.body = { refreshToken: 'valid-refresh-token' };
            const mockTokens = { accessToken: 'new-access-token', refreshToken: 'new-refresh-token' };
            userService.refreshUserToken.mockResolvedValue(Either.right(mockTokens));

            await refreshUserTokenHandler(mockReq, mockRes, mockNext);

            expect(userService.refreshUserToken).toHaveBeenCalledWith('valid-refresh-token');
            expect(mockRes.json).toHaveBeenCalledWith(mockTokens);
        });

        test('should handle invalid refresh token', async () => {
            mockReq.body = { refreshToken: 'invalid-refresh-token' };
            const error = new AppError('Invalid refresh token', 401);
            userService.refreshUserToken.mockResolvedValue(Either.left(error));

            await refreshUserTokenHandler(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(error);
            expect(mockRes.json).not.toHaveBeenCalled();
        });
    });
});