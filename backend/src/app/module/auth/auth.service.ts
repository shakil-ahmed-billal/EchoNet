import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import AppError from "../../errorHelpers/ApiError.js";
import { auth } from "../../lib/auth.js";
import { tokenUtils } from "../../utils/token.js";
import { jwtUtils } from "../../utils/jwt.js";
import { prisma } from "../../lib/prisma.js";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterUserPayload } from "./auth.interface.js";
import config from "../../config/index.js";

const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, email, password } = payload;

    const response = await auth.api.signUpEmail({
        body: { name, email, password: password || "" },
        asResponse: true
    }) as Response;

    const data = await response.json();

    if (!response.ok || !data.user) {
        throw new AppError(status.BAD_REQUEST, data.message || "Failed to register user");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
    });
    
    const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];

    return { ...data, accessToken, refreshToken, __cookies: cookies };
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    let response: Response;
    let data;
    try {
        response = await auth.api.signInEmail({
            body: { email, password: password || "" },
            asResponse: true
        }) as Response;
        data = await response.json();
    } catch (error: any) {
        throw new AppError(status.UNAUTHORIZED, error?.message || "Invalid credentials");
    }

    if (!response.ok || !data || !data.user) {
        throw new AppError(status.UNAUTHORIZED, data?.message || "Invalid credentials");
    }

    const user = await prisma.user.findUnique({
        where: { id: data.user.id }
    });

    if (user?.isSuspended) {
        throw new AppError(status.FORBIDDEN, "User is suspended");
    }

    if (user?.isDeleted) {
        throw new AppError(status.NOT_FOUND, "User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: data.user.id,
        role: data.user.role,
        name: data.user.name,
        email: data.user.email,
    });

    const cookies = response.headers.getSetCookie ? response.headers.getSetCookie() : [];

    return { ...data, accessToken, refreshToken, __cookies: cookies };
}

const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });
    return result;
}

const getMe = async (headers: Headers) => {
    const sessionData = await auth.api.getSession({ headers });

    if (!sessionData || !sessionData.session || !sessionData.user) {
        throw new AppError(status.NOT_FOUND, "Session not found");
    }

    if (new Date() > sessionData.session.expiresAt) {
        throw new AppError(status.NOT_FOUND, "Session expired");
    }

    const { user, session } = sessionData;

    return { session, user };
}

const changePassword = async (payload: IChangePasswordPayload, sessionToken: string) => {
    const session = await auth.api.getSession({
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });

    if (!session) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const { currentPassword, newPassword } = payload;

    const result = await auth.api.changePassword({
        body: {
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        },
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
    });

    return {
        ...result,
        accessToken,
        refreshToken,
    }
}

const getNewToken = async (refreshToken: string, headers: Headers) => {
    const sessionData = await auth.api.getSession({ headers });

    if (!sessionData || !sessionData.session) {
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, config.jwt_secret!)

    if (!verifiedRefreshToken.success) {
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        sessionToken: sessionData.session.token,
    }
}

const verifyEmail = async (email: string, otp: string) => {
    const result = await auth.api.verifyEmailOTP({
        body: { email, otp }
    });

    if (result.status && !result.user.emailVerified) {
        await prisma.user.update({
            where: { email },
            data: { emailVerified: true }
        });
    }
}

const forgetPassword = async (email: string) => {
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    if (isUserExist.isSuspended) {
        throw new AppError(status.FORBIDDEN, "User is suspended");
    }

    await auth.api.requestPasswordResetEmailOTP({
        body: { email }
    });
}

const resetPassword = async (email: string, otp: string, newPassword: string) => {
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    });

    if (!isUserExist) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    await auth.api.resetPasswordEmailOTP({
        body: { email, otp, password: newPassword }
    });

    await prisma.session.deleteMany({
        where: { userId: isUserExist.id }
    });
}

const googleLoginSuccess = async (session: any) => {
    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
    });

    return { accessToken, refreshToken };
}

export const AuthService = { 
    registerUser, 
    loginUser, 
    logoutUser, 
    getMe, 
    getNewToken,
    changePassword,
    verifyEmail,
    forgetPassword, 
    resetPassword,
    googleLoginSuccess
};
