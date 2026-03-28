"use server";

import { httpClient } from '@/lib/axios/httpClient';
import { setTokenInCookies } from '@/lib/tokenUtils';
import { deleteCookie } from '@/lib/cookieUtils';
import { cookies, headers } from 'next/headers';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: await headers(),
            body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
            return false;
        }

        const payload = await res.json();
        const data = payload.data;

        if (data?.accessToken) {
            await setTokenInCookies("accessToken", data.accessToken);
        }

        if (data?.refreshToken) {
            await setTokenInCookies("refreshToken", data.refreshToken);
        }

        return true;
    } catch (error) {
        console.error("Error refreshing token:", error);
        return false;
    }
}

export async function getUserInfo() {
    try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll().map(c => c.name);
        console.log(`[AUTH] getUserInfo available cookies: ${allCookies.join(", ")}`);

        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        if (!accessToken) {
            return null;
        }

        const reqHeaders = await headers();
        const userAgent = reqHeaders.get("user-agent") || "";
        const host = reqHeaders.get("host") || "echo-net-bd.vercel.app";
        const proto = reqHeaders.get("x-forwarded-proto") || "https";
        const cookieString = cookieStore.toString();

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Cookie": cookieString,
                "Accept": "application/json",
                "User-Agent": userAgent,
                "X-Forwarded-Host": host,
                "X-Forwarded-Proto": proto
            },
            cache: "no-store",
        });

        if (!res.ok) {
            console.error("Failed to fetch user info:", res.status, res.statusText);
            return null;
        }

        const payload = await res.json();
        return payload.data;
    } catch (error) {
        console.error("Error fetching user info:", error);
        return null;
    }
}

export const loginAction = async (payload: any) => {
    try {
        const response: any = await httpClient.post("/auth/login", payload);
        console.log("LOGIN ACTION RESPONSE:", response);

        if (response?.success && response?.data) {
            const { accessToken, refreshToken, token } = response.data;
            
            if (accessToken) {
                await deleteCookie("accessToken");
                await setTokenInCookies("accessToken", accessToken);
            }
            if (refreshToken) {
                await deleteCookie("refreshToken");
                await setTokenInCookies("refreshToken", refreshToken);
            }
            if (token) {
                await deleteCookie("better-auth.session_token");
                await setTokenInCookies("better-auth.session_token", token);
            }
        }

        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error.message || "Login failed"
        };
    }
}

export const registerAction = async (payload: any) => {
    try {
        const response: any = await httpClient.post("/auth/register", payload);
        console.log("REGISTER ACTION RESPONSE:", response);

        if (response?.success && response?.data) {
            const { accessToken, refreshToken, token } = response.data;
            
            if (accessToken) {
                await deleteCookie("accessToken");
                await setTokenInCookies("accessToken", accessToken);
            }
            if (refreshToken) {
                await deleteCookie("refreshToken");
                await setTokenInCookies("refreshToken", refreshToken);
            }
            if (token) {
                await deleteCookie("better-auth.session_token");
                await setTokenInCookies("better-auth.session_token", token);
            }
        }

        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error.message || "Registration failed"
        };
    }
}

export const logoutAction = async () => {
    try {
        await httpClient.post("/auth/logout", {});
        await deleteCookie("accessToken");
        await deleteCookie("refreshToken");
        await deleteCookie("better-auth.session_token");
        return { success: true };
    } catch (error: any) {
        console.error("Logout failed:", error);
        await deleteCookie("accessToken");
        await deleteCookie("refreshToken");
        await deleteCookie("better-auth.session_token");
        return { success: false, message: "Logged out locally." };
    }
}

export const forgetPasswordAction = async (payload: { email: string }) => {
    try {
        const response: any = await httpClient.post("/auth/forget-password", payload);
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error.message || "Failed to send OTP"
        };
    }
}

export const resetPasswordAction = async (payload: any) => {
    try {
        const response: any = await httpClient.post("/auth/reset-password", payload);
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error.message || "Failed to reset password"
        };
    }
}

export const changePasswordAction = async (payload: any) => {
    try {
        const response: any = await httpClient.post("/auth/change-password", payload);

        if (response?.success && response?.data) {
            const { accessToken, refreshToken } = response.data;
            if (accessToken) await setTokenInCookies("accessToken", accessToken);
            if (refreshToken) await setTokenInCookies("refreshToken", refreshToken);
        }

        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error.message || "Failed to change password"
        };
    }
}

export const verifyEmailAction = async (payload: { email: string; otp: string }) => {
    try {
        const response: any = await httpClient.post("/auth/verify-email", payload);
        return response;
    } catch (error: any) {
        return {
            success: false,
            message: error?.response?.data?.message || error.message || "Failed to verify email"
        };
    }
}
