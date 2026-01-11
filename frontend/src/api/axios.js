import axios from "axios";

const api = axios.create({
  // ALWAYS call Django API directly
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    const authFree =
      config.url.includes("/auth/token") ||
      config.url.includes("/login") ||
      config.url.includes("/register");

    if (token && !authFree) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
