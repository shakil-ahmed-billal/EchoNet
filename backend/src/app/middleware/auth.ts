import { NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import ApiError from '../errorHelpers/ApiError.js';
import { fromNodeHeaders } from "better-auth/node";
import { Role } from '../../../generated/prisma/client/index.js';
import { prisma } from '../lib/prisma.js';
import { auth as betterAuth } from '../lib/auth.js';

const auth = (...requiredRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const headers = fromNodeHeaders(req.headers);
      let session = await betterAuth.api.getSession({
        headers: headers,
      });

      // Manual fallback if Better-Auth fails to find session via headers/cookies
      if (!session) {
        const token = req.cookies['better-auth.session_token'];
        if (token) {
          const dbSession = await prisma.session.findUnique({
            where: { token },
            include: { user: true }
          });
          if (dbSession && !dbSession.user.isDeleted && !dbSession.user.isSuspended) {
            session = { session: dbSession, user: dbSession.user };
          }
        }
      }

      if (!session || !session.user) {
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

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let session = await betterAuth.api.getSession({ headers: fromNodeHeaders(req.headers) });
    
    if (!session) {
      const token = req.cookies['better-auth.session_token'];
      if (token) {
        const dbSession = await prisma.session.findUnique({
          where: { token },
          include: { user: true }
        });
        if (dbSession && !dbSession.user.isDeleted && !dbSession.user.isSuspended) {
          session = { session: dbSession, user: dbSession.user };
        }
      }
    }

    if (session && session.user) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
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
