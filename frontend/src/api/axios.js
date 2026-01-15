import axios from "axios";

// Read optional base URL from environment; avoid a base of "/api" which
// will cause double-prefixing when callers already use "/api/..." paths.
const rawBaseUrl = process.env.REACT_APP_API_BASE_URL;
let baseURL = rawBaseUrl ? rawBaseUrl.replace(/\/$/, "") : undefined;
if (baseURL === "/api") baseURL = undefined;

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Centralize path normalization so callers can use legacy or short paths
// and still resolve to canonical endpoints.
function normalizeApiPath(inputUrl) {
  if (!inputUrl) return inputUrl;
  // Leave absolute URLs untouched
  if (/^https?:\/\//i.test(inputUrl)) return inputUrl;

  let u = inputUrl;
  if (!u.startsWith("/")) u = "/" + u;
  // Collapse repeated slashes
  u = u.replace(/\/\/+/g, "/");

  // Legacy trimmed API: /v1/... -> /api/v1/...
  u = u.replace(/^\/v1(\/|$)/, "/api/v1$1");
  // Collapse accidental double API prefix: /api/api/... -> /api/...
  u = u.replace(/^\/api\/api(\/|$)/, "/api/$1");
  // Accidental /api/admin-api/... -> /admin-api/...
  u = u.replace(/^\/api\/admin-api(\/|$)/, "/admin-api$1");

  return u;
}

api.interceptors.request.use((config) => {
  // Support both new key name and older key if present
  const token = localStorage.getItem("access_token") || localStorage.getItem("access");

  const requestUrlRaw = config.url || "";
  const normalizedUrl = normalizeApiPath(requestUrlRaw);
  config.url = normalizedUrl;

  // Match auth endpoints by substring so both legacy (/v1/auth/...) and
  // canonical (/api/v1/auth/...) forms are treated as authFree
  // NOTE: admin-api routes should ALWAYS require auth
  const isAdminApi = normalizedUrl.includes('/admin-api');
  const authFreePatterns = ["/auth/token", "/auth/register", "/login", "/register", "/token"];
  // Public API patterns - only match public routes, not admin routes
  const publicApiPatterns = ["/api/v1/hotels", "/api/v1/rooms"];
  const isAuthEndpoint = authFreePatterns.some((pat) => normalizedUrl.includes(pat));
  const isPublicApi = !isAdminApi && publicApiPatterns.some((pat) => normalizedUrl.startsWith(pat));
  const isAuthFree = isAuthEndpoint || isPublicApi;

  if (token && (!isAuthFree || isAdminApi)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (!isAdminApi) {
    // No JWT token; fall back to email token if present and endpoint is booking-related
    const emailToken = localStorage.getItem("email_token");
    if (emailToken && normalizedUrl.includes('/bookings')) {
      // Use a custom auth scheme for email sessions
      config.headers.Authorization = `EmailToken ${emailToken}`;
      config.headers['X-Email-Token'] = emailToken;
    } else {
      delete config.headers.Authorization;
    }
  }

  return config;
});

export default api;
