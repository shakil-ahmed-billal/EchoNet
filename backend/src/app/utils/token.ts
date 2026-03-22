import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config/index.js";
import { CookieUtils } from "./cookie.js";
import { jwtUtils } from "./jwt.js";

const getAccessToken = (payload: JwtPayload) => {
    return jwtUtils.createToken(
        payload,
        config.jwt_secret as string,
        { expiresIn: config.jwt_access_expires_in } as SignOptions
    );
}

const getRefreshToken = (payload: JwtPayload) => {
    return jwtUtils.createToken(
        payload,
        config.jwt_secret as string,
        { expiresIn: config.jwt_refresh_expires_in } as SignOptions
    );
}

export const setAccessTokenCookie = (res: Response, token: string) => {
    res.cookie('accessToken', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: config.env === 'production' ? 'none' : 'lax',
        maxAge: 3600000, // 1 hour
        path: '/',
    });
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: config.env === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        path: '/',
    });
};

export const setBetterAuthSessionCookie = (res: Response, token: string) => {
    res.cookie('better-auth.session_token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: config.env === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });
};

export const tokenUtils = { getAccessToken, getRefreshToken, setAccessTokenCookie, setRefreshTokenCookie, setBetterAuthSessionCookie };
