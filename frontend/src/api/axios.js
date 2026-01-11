import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token to every request except auth endpoints
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access");

    const url = config.url || "";

    const isAuth =
      url.includes("/login") ||
      url.includes("/register") ||
      url.includes("/token");

    if (token && !isAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
