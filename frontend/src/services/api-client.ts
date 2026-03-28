import axios from "axios"

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Response interceptor for handling token expiration
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log(`[API-CLIENT] 401 Unauthorized detected at ${originalRequest.url}. Attempting refresh...`);
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using the refreshToken cookie
        await axios.post(
          `${apiClient.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );
        console.log(`[API-CLIENT] Token refresh: SUCCESS. Retrying original request.`);

        // If successful, retry the original request with the new session
        return apiClient(originalRequest);
      } catch (refreshError: any) {
        console.error(`[API-CLIENT] Token refresh: FAILED (${refreshError.response?.status}). Redirecting to login.`);
        // If refresh token is also expired or invalid, redirect to login
        if (typeof window !== "undefined") {
          // Prevent redirect loop if already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login?reason=session_expired";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
