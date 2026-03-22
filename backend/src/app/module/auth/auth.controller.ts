import { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthService } from "./auth.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { CookieUtils } from "../../utils/cookie.js";
import { tokenUtils } from "../../utils/token.js";
import config from "../../config/index.js";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.registerUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result as Record<string, any>;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: { token, accessToken, refreshToken, ...rest }
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const result = await AuthService.loginUser(req.body);
    const { accessToken, refreshToken, token, ...rest } = result as Record<string, any>;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    console.log('Login successful - Token:', token);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: { token, accessToken, refreshToken, ...rest }
    });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies?.["better-auth.session_token"] || "";
    const result = await AuthService.logoutUser(betterAuthSessionToken);

    const isProd = config.env === 'production';
    const cookieOptions = { 
        httpOnly: true, 
        secure: isProd, 
        sameSite: isProd ? "none" : "lax" as any,
        path: '/'
    };

    CookieUtils.clearCookie(res, 'accessToken', cookieOptions);
    CookieUtils.clearCookie(res, 'refreshToken', cookieOptions);
    CookieUtils.clearCookie(res, 'better-auth.session_token', cookieOptions);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged out successfully",
        data: result
    });
});

import { fromNodeHeaders } from "better-auth/node";

const getMe = catchAsync(async (req: Request, res: Response) => {
    // Disable caching for this request
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');

    // The middleware already populated req.user and confirmed the session
    const user = (req as any).user;

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User session retrieved successfully",
        data: { user, session: { user } } // Matching the session object structure expected
    });
});

export const AuthController = { registerUser, loginUser, logoutUser, getMe };
