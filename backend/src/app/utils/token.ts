import { Response } from "express";
import { JwtPayload, SignOptions } from "jsonwebtoken";
import config from "../config/index.js";
import { CookieUtils } from "./cookie.js";
import { jwtUtils } from "./jwt.js";

const getAccessToken = (payload: JwtPayload) => {
    return jwtUtils.createToken(
        payload,
        config.jwt_secret as string,
        { expiresIn: '1d' } as SignOptions
    );
}

const getRefreshToken = (payload: JwtPayload) => {
    return jwtUtils.createToken(
        payload,
        config.jwt_secret as string,
        { expiresIn: '7d' } as SignOptions
    );
}

const setAccessTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'accessToken', token, {
        httpOnly: true, secure: true, sameSite: "none", path: '/', maxAge: 60 * 60 * 24 * 1000,
    });
}

const setRefreshTokenCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, 'refreshToken', token, {
        httpOnly: true, secure: true, sameSite: "none", path: '/', maxAge: 60 * 60 * 24 * 1000 * 7,
    });
}

const setBetterAuthSessionCookie = (res: Response, token: string) => {
    CookieUtils.setCookie(res, "better-auth.session_token", token, {
        httpOnly: true, secure: true, sameSite: "none", path: '/', maxAge: 60 * 60 * 24 * 1000,
    });
}

export const tokenUtils = { getAccessToken, getRefreshToken, setAccessTokenCookie, setRefreshTokenCookie, setBetterAuthSessionCookie };
