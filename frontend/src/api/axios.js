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

  // Defensive: some callers may not set config.url (e.g., when using absolute URLs)
  const requestUrl = config.url || "";

  const isAuthFree = authFreeEndpoints.some((url) =>
    requestUrl.includes(url)
  );

  if (token && !isAuthFree) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
});

// SPA-safe response interceptor: do NOT perform hard navigation here (no window.location)
// Instead, emit a CustomEvent that an application-level listener can react to and perform
// react-router navigation and/or logout via context. This keeps side-effects in the UI layer.
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      if (typeof window !== "undefined") {
        // NOTE: don't include sensitive info in the event detail
        window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: { status: 401 } }));
      }
    }
    return Promise.reject(err);
  }
);

export default api;
