import { Either } from '../utils/either/Either.js';
import { AppError } from '../utils/errorUtils.js';
import JwtTokenStrategy from '../strategies/JwtTokenStrategy.js';
import RefreshTokenStrategy from '../strategies/RefreshTokenStrategy.js';

const createAuthService = (tokenStrategy, refreshTokenStrategy) => ({
  generateToken: (userId) => tokenStrategy.generateToken(userId),

  generateRefreshToken: (userId) => refreshTokenStrategy.generateToken(userId),

  verifyToken: (token) => tokenStrategy.verifyToken(token),

  refreshToken: async (refreshToken) => {
    if (!refreshToken) {
      return Either.left(AppError('Refresh token is required', 400));
    }

    const decodedResult = await refreshTokenStrategy.verifyToken(refreshToken);
    return decodedResult.flatMap(async (decoded) => {
      const newAccessTokenResult = await tokenStrategy.generateToken(decoded.userId);
      return newAccessTokenResult.map((newAccessToken) => ({
        accessToken: newAccessToken,
        refreshToken,
      }));
    });
  },
});
export { createAuthService };
export default createAuthService(JwtTokenStrategy, RefreshTokenStrategy);