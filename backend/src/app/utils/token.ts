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
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
        path: '/',
    });
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: config.env === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
    });
};

export const setBetterAuthSessionCookie = (res: Response, token: string) => {
    res.cookie('better-auth.session_token', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: config.env === 'production' ? 'none' : 'lax',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
    });
};

export const tokenUtils = { getAccessToken, getRefreshToken, setAccessTokenCookie, setRefreshTokenCookie, setBetterAuthSessionCookie };
