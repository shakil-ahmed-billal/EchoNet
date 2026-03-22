import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errorHelpers/ApiError.js';
import { fromNodeHeaders } from "better-auth/node";
import { Role } from '../../../generated/prisma/client/index.js';
import { prisma } from '../lib/prisma.js';
import { auth as betterAuth } from '../lib/auth.js';

const auth = (...requiredRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log(`Auth middleware triggered for: ${req.method} ${req.url}`);
    try {
      const headers = fromNodeHeaders(req.headers);
      console.log('Auth middleware - Headers for getSession:', headers);
      let session = await betterAuth.api.getSession({
        headers: headers,
      });

      // Manual fallback if Better-Auth fails to find session via headers/cookies
      if (!session) {
        console.log('Auth middleware - Better-Auth getSession failed. Trying manual DB lookup...');
        const token = req.cookies['better-auth.session_token'];
        if (token) {
          const dbSession = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
          });
          if (dbSession && !dbSession.user.isDeleted && !dbSession.user.isSuspended) {
            console.log('Auth middleware - Manual session found for user:', dbSession.user.email);
            session = { session: dbSession, user: dbSession.user };
          }
        }
      }

      console.log('Auth middleware - Session found:', !!session);
      if (!session || !session.user) {
        console.log('Auth middleware - Available cookies:', req.headers.cookie);
        throw new ApiError(httpStatus.UNAUTHORIZED, 'You are not authorized');
      }

      const user = session.user;
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

export default auth;
