import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';

const createToken = (payload: Record<string, unknown>, secret: string, options: SignOptions) => {
  return jwt.sign(payload, secret, options);
};

const verifyToken = (token: string, secret: string) => {
  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded as JwtPayload };
  } catch (error) {
    return { success: false, error };
  }
};

export const jwtUtils = { createToken, verifyToken };
