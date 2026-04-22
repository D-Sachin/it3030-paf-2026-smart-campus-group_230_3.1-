import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 30000);

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const rawUser = localStorage.getItem("currentUser");
  if (rawUser) {
    try {
      const user = JSON.parse(rawUser);
      if (user?.role) {
        config.headers["X-User-Role"] = user.role;
      }
      if (user?.email) {
        config.headers["X-User-Email"] = user.email;
      }
    } catch (error) {
      // Ignore malformed storage values and continue request.
    }
  }

  return config;
});

export default apiClient;
