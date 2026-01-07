import axios from "axios";
nconst baseUrl = process.env.REACT_APP_API_BASE_URL;
const api = axios.create({
  // If REACT_APP_API_BASE_URL is provided at build time, use it.
  // Otherwise leave baseURL undefined so requests like `/api/...` go to the same origin (works behind Nginx).
  baseURL: baseUrl ? baseUrl.replace(/\/$/, "") : undefined,
});

n// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
