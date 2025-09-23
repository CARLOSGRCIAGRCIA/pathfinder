import jwt from "jsonwebtoken";
import environment from "./environment";

const TokenService = {
  generateToken: (userId, secret = environment.JWT_SECRET, expiresIn = environment.JWT_EXPIRES_IN) => {
    return jwt.sign({ userId }, secret, { expiresIn });
  },

  verifyToken: (token, secret = environment.JWT_SECRET) => {
    return jwt.verify(token, secret);
  },
};

export default TokenService;