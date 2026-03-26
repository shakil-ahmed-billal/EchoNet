import { Request, Response } from "express";
import httpStatus from "http-status";
import { AuthService } from "./auth.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { CookieUtils } from "../../utils/cookie.js";
import { tokenUtils } from "../../utils/token.js";
import config from "../../config/index.js";
import { auth } from "../../lib/auth.js";

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

const getMe = catchAsync(async (req: Request, res: Response) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value as string);
    });

    const result = await AuthService.getMe(headers);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User session retrieved successfully",
        data: result
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.forgetPassword(email);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset OTP sent to email successfully",
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    await AuthService.resetPassword(email, otp, newPassword);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password reset successfully",
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies?.["better-auth.session_token"] || "";
    const result = await AuthService.changePassword(req.body, betterAuthSessionToken);
    
    const { accessToken, refreshToken } = result as Record<string, any>;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Password changed successfully",
        data: result
    });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken || "";
    const betterAuthSessionToken = req.cookies?.["better-auth.session_token"] || "";
    const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

    const { accessToken, refreshToken: newRefreshToken } = result as Record<string, any>;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Token refreshed successfully",
        data: result
    });
});

const verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const { email, otp } = req.body;
    await AuthService.verifyEmail(email, otp);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "Email verified successfully",
    });
});

const googleLogin = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/";
    const callbackURL = `${config.env === "production" ? "https://yourdomain.com" : "http://localhost:8000"}/api/v1/auth/google/success?redirect=${encodeURIComponent(redirectPath)}`;

    res.render("googleRedirect", {
        callbackURL,
        betterAuthUrl: "http://localhost:8000",
    });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/";
    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
        return res.redirect(`http://localhost:3000/login?error=oauth_failed`);
    }

    const session = await auth.api.getSession({
        headers: new Headers({ "Cookie": `better-auth.session_token=${sessionToken}` })
    });

    if (!session || !session.user) {
        return res.redirect(`http://localhost:3000/login?error=no_session_found`);
    }

    const { accessToken, refreshToken } = await AuthService.googleLoginSuccess(session);

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    res.redirect(`http://localhost:3000?redirect=${encodeURIComponent(redirectPath)}`);
});

export const AuthController = { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getMe, 
    forgetPassword, 
    resetPassword,
    googleLogin,
    googleLoginSuccess,
    changePassword,
    getNewToken,
    verifyEmail
};
