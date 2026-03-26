"use server";

import { cookies } from "next/headers";

export const setCookie = async (
    name : string,
    value : string,
    maxAgeInSeconds : number,
) => {
    const cookieStore = await cookies();

    cookieStore.set(name, value, {
        httpOnly : true,
        secure : process.env.NODE_ENV === "production",
        sameSite : "lax", // 'lax' helps with OAuth redirects and basic next routing.
        path : "/",
        maxAge : maxAgeInSeconds,
    });
}

export const getCookie = async (name : string) => {
    const cookieStore = await cookies();
    return cookieStore.get(name)?.value;
}

export const deleteCookie = async (name : string) => {
    const cookieStore = await cookies();
    cookieStore.delete(name);
}
