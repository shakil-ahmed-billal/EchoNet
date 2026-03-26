import axios from "axios"

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Optional: Add request/response interceptors here for handling tokens or errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401s, etc.
    return Promise.reject(error)
  }
)
