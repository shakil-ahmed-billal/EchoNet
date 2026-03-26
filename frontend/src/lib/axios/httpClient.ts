import axios from 'axios';
import { cookies, headers } from 'next/headers';
import { isTokenExpiringSoon } from '../tokenUtils';

// We'll import this later to break circular dependencies or just handle it.
// import { getNewTokensWithRefreshToken } from '@/services/auth.actions';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

async function tryRefreshToken(
    accessToken: string,
    refreshToken: string
): Promise<void>
{
    if(!await isTokenExpiringSoon(accessToken)) {
        return;
    }

    const requestHeader = await headers();

    if (requestHeader.get("x-token-refreshed") === "1") {
        return; 
    }

    try {
        // Dynamic import to avoid circular dependency
        const { getNewTokensWithRefreshToken } = await import('../../services/auth.actions');
        await getNewTokensWithRefreshToken(refreshToken);
    } catch (error : any) {
        console.error("Error refreshing token in http client:", error);
    }
}

export const axiosInstance = async () => {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const refreshToken = cookieStore.get("refreshToken")?.value;

    if(accessToken && refreshToken){
        await tryRefreshToken(accessToken, refreshToken);
    }

    const cookieHeader = cookieStore
                                .getAll()
                                .map((cookie) => `${cookie.name}=${cookie.value}`)
                                .join("; ");    

    const instance = axios.create({
        baseURL : API_BASE_URL,
        timeout : 30000,
        headers:{
            Cookie : cookieHeader
        }
    })

    return instance;
}

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<TData> => {
    try {     
        const instance = await axiosInstance();   
        // Expecting EchoNet API response shape { success, data, message }
        // We will return data directly, or the whole response. Let's return the whole data payload to be versatile.
        const response = await instance.get<any>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {       
        console.error(`GET request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPost = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<TData> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.post<any>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`POST request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPut = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<TData> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.put<any>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PUT request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpPatch = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<TData> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.patch<any>(endpoint, data, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`PATCH request to ${endpoint} failed:`, error);
        throw error;
    }
}

const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<TData> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.delete<any>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        console.error(`DELETE request to ${endpoint} failed:`, error);
        throw error;
    }
}

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
}
