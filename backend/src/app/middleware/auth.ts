import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errorHelpers/ApiError.js';
import { fromNodeHeaders } from "better-auth/node";
import { Role } from '../../../generated/prisma/client/index.js';
import { prisma } from '../lib/prisma.js';
import { auth as betterAuth } from '../lib/auth.js';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../config/index.js';

import { AuthService } from '../module/auth/auth.service.js';

const auth = (...requiredRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      let sessionUser: any = null;
      let sessionData = await AuthService.getUnifiedSession(fromNodeHeaders(req.headers));

      if (sessionData?.user) {
        sessionUser = sessionData.user;
      }

      // JWT Strategy Override (Legacy Support)
      if (!sessionUser) {
        let token = req.cookies?.accessToken;
        if (!token && req.headers.authorization?.startsWith('Bearer ')) {
          token = req.headers.authorization.split(' ')[1];
        }
        if (token) {
          try {
            const decoded = jwt.verify(token, config.jwt_secret as string) as JwtPayload;
            sessionUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
          } catch(e) {}
        }
      }

      if (!sessionUser) {
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      const user = sessionUser;
      (req as any).user = user;

      if ((user as any).isSuspended) {
        throw new ApiError(httpStatus.FORBIDDEN, 'Your account is suspended');
      }

      if (requiredRoles.length && !requiredRoles.includes(user.role as Role)) {
        throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to access this resource');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let sessionUser: any = null;

    let sessionData = await AuthService.getUnifiedSession(fromNodeHeaders(req.headers));
    if (sessionData?.user) {
      sessionUser = sessionData.user;
    }

    if (!sessionUser) {
      let token = req.cookies?.accessToken;
      if (!token && req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
      }
      if (token) {
        try {
          const decoded = jwt.verify(token, config.jwt_secret as string) as JwtPayload;
          sessionUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
        } catch(e) {}
      }
    }

    if (sessionUser) {
      const user = await prisma.user.findUnique({
        where: { email: sessionUser.email },
      });
      if (user) {
        (req as any).user = user;
      }
    }
    next();
  } catch (error) {
    // Ignore errors for optional auth, just proceed as guest
    next();
  }
};

export default auth;
