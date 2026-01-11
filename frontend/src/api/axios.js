import axios from "axios";
const baseUrl = process.env.REACT_APP_API_BASE_URL;
const api = axios.create({
  // If REACT_APP_API_BASE_URL is provided at build time, use it.
  // Otherwise leave baseURL undefined so we can selectively prefix `/api` for v1 endpoints only.
  baseURL: baseUrl ? baseUrl.replace(/\/$/, "") : undefined,
});

// Normalize URLs and attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  // 🚫 NEVER send token to auth endpoints
  const authFreeEndpoints = ["/login", "/register", "/token"];

  const isAuthFree = authFreeEndpoints.some((url) =>
    config.url.includes(url)
  );

  if (token && !isAuthFree) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

export default api;
