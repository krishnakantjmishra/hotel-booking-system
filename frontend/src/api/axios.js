import axios from "axios";
const baseUrl = process.env.REACT_APP_API_BASE_URL;
const api = axios.create({
  // If REACT_APP_API_BASE_URL is provided at build time, use it.
  // Otherwise leave baseURL undefined so we can selectively prefix `/api` for v1 endpoints only.
  baseURL: baseUrl ? baseUrl.replace(/\/$/, "") : undefined,
});

// Normalize URLs and attach token if present
api.interceptors.request.use((config) => {
  // If a request targets a public v1 endpoint like `/v1/...`, prefix with `/api` so it becomes `/api/v1/...`.
  // Leave admin endpoints like `/admin-api/` unchanged.
  if (config.url && config.url.startsWith('/v1') && !config.url.startsWith('/api/v1')) {
    config.url = `/api${config.url}`;
  }

  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
