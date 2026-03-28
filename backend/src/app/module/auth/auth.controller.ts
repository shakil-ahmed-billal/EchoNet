
import httpStatus from "http-status";
import { AuthService } from "./auth.service.js";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { CookieUtils } from "../../utils/cookie.js";
import { tokenUtils } from "../../utils/token.js";
import config from "../../config/index.js";
import { auth } from "../../lib/auth.js";
import type { Request, Response } from "express";

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const url = new URL('/api/auth/sign-up/email', config.backend_url);
    const betterAuthReq = new Request(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': config.frontend_url, 'Host': new URL(config.backend_url).host },
        body: JSON.stringify(req.body),
    });

    const betterAuthRes = await auth.handler(betterAuthReq);
    const rawText = await betterAuthRes.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        console.error("BetterAuth Registration Error (Non-JSON Response):", rawText);
        return sendResponse(res, { statusCode: 500, success: false, message: "Internal Auth Provider Error" });
    }

    if (!betterAuthRes.ok) {
        return sendResponse(res, { statusCode: betterAuthRes.status, success: false, message: data?.message || "Registration failed" });
    }

    const { accessToken, refreshToken } = await AuthService.googleLoginSuccess({ user: data.user }); // Helper building tokens

    let token = data.token || "";
    if (betterAuthRes.headers.has('set-cookie')) {
        const cookies = betterAuthRes.headers.getSetCookie();
        for (const cookie of cookies) {
            const match = cookie.match(/better-auth\.session_token=([^;]+)/);
            if (match) {
                token = match[1];
            }
        }
    }

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: "User registered successfully",
        data: { token, accessToken, refreshToken, user: data.user }
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const url = new URL('/api/auth/sign-in/email', config.backend_url);
    const betterAuthReq = new Request(url.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Origin': config.frontend_url, 'Host': new URL(config.backend_url).host },
        body: JSON.stringify(req.body),
    });

    const betterAuthRes = await auth.handler(betterAuthReq);
    const rawText = await betterAuthRes.text();
    let data;
    try {
        data = JSON.parse(rawText);
    } catch (e) {
        console.error("BetterAuth Login Error (Non-JSON Response):", rawText);
        return sendResponse(res, { statusCode: 500, success: false, message: "Internal Auth Provider Error" });
    }

    if (!betterAuthRes.ok) {
        return sendResponse(res, { statusCode: betterAuthRes.status, success: false, message: data?.message || "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await AuthService.googleLoginSuccess({ user: data.user });

    let token = data.token || "";
    if (betterAuthRes.headers.has('set-cookie')) {
        const cookies = betterAuthRes.headers.getSetCookie();
        for (const cookie of cookies) {
            const match = cookie.match(/better-auth\.session_token=([^;]+)/);
            if (match) {
                token = match[1];
            }
        }
    }

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: "User logged in successfully",
        data: { token, accessToken, refreshToken, user: data.user }
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

    // Pass the token safely as a Bearer token, bypassing header parsing issues
    const token = req.cookies?.["better-auth.session_token"];
    if (token) {
        headers.set("Authorization", `Bearer ${token}`);
    }

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
    
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
        if (value) headers.append(key, value as string);
    });

    const result = await AuthService.getNewToken(refreshToken, headers);

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
    const callbackURL = `${config.backend_url}/api/v1/auth/google/success?redirect=${encodeURIComponent(redirectPath)}`;

    // Use auth.handler() directly so BetterAuth's state cookie is properly forwarded to the browser
    const url = new URL('/api/auth/sign-in/social', config.backend_url);
    const betterAuthReq = new Request(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': req.headers.cookie || '',
            'Origin': config.frontend_url,
            'Host': new URL(config.backend_url).host,
        },
        body: JSON.stringify({ provider: 'google', callbackURL }),
    });

    const betterAuthRes = await auth.handler(betterAuthReq);

    // Forward ALL cookies BetterAuth set (contains the OAuth state token)
    betterAuthRes.headers.forEach((value, key) => {
        if (key.toLowerCase() === 'set-cookie') {
            res.append('Set-Cookie', value);
        }
    });

    // BetterAuth returns a redirect to Google OAuth
    const location = betterAuthRes.headers.get('location');
    if (location) {
        return res.redirect(location);
    }

    return res.status(500).json({ message: 'Failed to initiate Google OAuth' });
});

const googleLoginSuccess = catchAsync(async (req: Request, res: Response) => {
    const redirectPath = (req.query.redirect as string) || "/";
    const sessionToken = req.cookies["better-auth.session_token"];

    if (!sessionToken) {
        return res.redirect(`${config.frontend_url}/login?error=oauth_failed`);
    }

    // BetterAuth signs the session cookie, so a direct Prisma query on the raw cookie value will fail.
    // We must pass the raw HTTP cookie header to auth.api.getSession to decode and hash the token.
    const headers = new Headers();
    if (req.headers.cookie) {
        headers.set('cookie', req.headers.cookie);
    }

    let sessionData = null;
    try {
        sessionData = await auth.api.getSession({ headers });
    } catch (e) {
        console.error("Failed to get BetterAuth session:", e);
    }

    if (!sessionData || !sessionData.user) {
        return res.redirect(`${config.frontend_url}/login?error=no_session_found`);
    }

    const { accessToken, refreshToken } = await AuthService.googleLoginSuccess(sessionData);

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    res.redirect(`${config.frontend_url}${redirectPath}`);
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
