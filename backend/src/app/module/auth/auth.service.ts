import status from "http-status";
import AppError from "../../errorHelpers/ApiError.js";
import { auth } from "../../lib/auth.js";
import { tokenUtils } from "../../utils/token.js";
import { ILoginUserPayload, IRegisterUserPayload } from "./auth.interface.js";

const registerUser = async (payload: IRegisterUserPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: { name, email, password: password || "" }
    });

    if (!data.user) {
        throw new AppError(status.BAD_REQUEST, "Failed to register user");
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

    return { ...data, accessToken, refreshToken };
}

const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: { email, password: password || "" }
    });

    if (!data.user) {
        throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
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

    return { ...data, accessToken, refreshToken };
}

const logoutUser = async (sessionToken: string) => {
    const result = await auth.api.signOut({
        headers: new Headers({ Authorization: `Bearer ${sessionToken}` })
    });
    return result;
}

export const AuthService = { registerUser, loginUser, logoutUser };
