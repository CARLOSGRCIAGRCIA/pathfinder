import { AppError } from '../../business/utils/errorUtils.js';
import userService from '../../business/services/userService.js';

export const registerUser = async (req, res, next) => {
  const result = await userService.register(req.body);
  result.fold(
    (error) => next(error),
    (user) => res.status(201).json(user)
  );
};

export const loginUser = async (req, res, next) => {
  const { username, password } = req.body;
  const result = await userService.login(username, password);
  result.fold(
    (error) => next(error),
    (tokens) => res.json(tokens)
  );
};

export const getUserProfile = async (req, res, next) => {
  const result = await userService.getProfile(req.user.id);
  result.fold(
    (error) => next(error),
    (user) => res.status(200).json(user)
  );
};

export const refreshUserTokenHandler = async (req, res, next) => {
  const { refreshToken } = req.body;
  const result = await userService.refreshUserToken(refreshToken);
  result.fold(
    (error) => next(error),
    (tokens) => res.json(tokens)
  );
};