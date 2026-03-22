import { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthService } from "./auth.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { CookieUtils } from "../../utils/cookie.js";
import { tokenUtils } from "../../utils/token.js";

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

    CookieUtils.clearCookie(res, 'accessToken', { httpOnly: true, secure: true, sameSite: "none" });
    CookieUtils.clearCookie(res, 'refreshToken', { httpOnly: true, secure: true, sameSite: "none" });
    CookieUtils.clearCookie(res, 'better-auth.session_token', { httpOnly: true, secure: true, sameSite: "none" });

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged out successfully",
        data: result
    });
});

export const AuthController = { registerUser, loginUser, logoutUser };
