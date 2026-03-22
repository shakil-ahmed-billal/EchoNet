"use server";

import { httpClient } from '@/lib/axios/httpClient';
import { setTokenInCookies } from '@/lib/tokenUtils';
import { deleteCookie } from '@/lib/cookieUtils';
import { cookies } from 'next/headers';

const BASE_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getNewTokensWithRefreshToken(refreshToken: string): Promise<boolean> {
    try {
        const res = await fetch(`${BASE_API_URL}/auth/refresh-token`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Cookie: `refreshToken=${refreshToken}`
            }
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

        if (data?.sessionToken || data?.token) {
            await setTokenInCookies("better-auth.session_token", data.sessionToken || data.token, 24 * 60 * 60);
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
        const accessToken = cookieStore.get("accessToken")?.value;
        const sessionToken = cookieStore.get("better-auth.session_token")?.value;

        if (!accessToken) {
            return null;
        }

        const res = await fetch(`${BASE_API_URL}/auth/me`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`
            }
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
        // httpClient already handles returning response.data
        const response: any = await httpClient.post("/auth/login", payload);

        if (response?.success && response?.data) {
            const { accessToken, refreshToken, token } = response.data;
            
            if (accessToken) await setTokenInCookies("accessToken", accessToken);
            if (refreshToken) await setTokenInCookies("refreshToken", refreshToken);
            if (token) await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day
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

        if (response?.success && response?.data) {
            const { accessToken, refreshToken, token } = response.data;
            
            if (accessToken) await setTokenInCookies("accessToken", accessToken);
            if (refreshToken) await setTokenInCookies("refreshToken", refreshToken);
            if (token) await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day
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
        // Call backend logout
        await httpClient.post("/auth/logout", {});
        
        // Clear cookies on frontend
        await deleteCookie("accessToken");
        await deleteCookie("refreshToken");
        await deleteCookie("better-auth.session_token");

        return { success: true };
    } catch (error: any) {
        console.error("Logout failed:", error);
        // Clean up anyway
        await deleteCookie("accessToken");
        await deleteCookie("refreshToken");
        await deleteCookie("better-auth.session_token");
        return { success: false, message: "Logged out locally with errors." };
    }
}
