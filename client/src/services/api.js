// client/src/services/api.js
import axios from 'axios';

/**
 * Access token lives here (and mirrors localStorage).
 * We avoid reading localStorage on every request for perf & clarity.
 */
let accessToken = localStorage.getItem('accessToken') || null;

/**
 * A single shared promise while a refresh is in progress.
 * Any 401s that happen during a refresh will wait on this.
 */
let refreshPromise = null;

const api = axios.create({
  baseURL: 'http://localhost:4000/api', // matches your backend
  withCredentials: true,                // send/receive the HTTP-only refresh cookie
});

// ---- helpers ---------------------------------------------------------------

export function setAccessToken(token) {
  accessToken = token || null;
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}

function attachAuth(cfg) {
  if (accessToken) {
    cfg.headers = cfg.headers || {};
    cfg.headers.Authorization = `Bearer ${accessToken}`;
  }
  return cfg;
}

async function refreshAccessToken() {
  // If a refresh is already happening, reuse it.
  if (!refreshPromise) {
    refreshPromise = api.post('/auth/refresh') // cookie is auto-sent
      .then(({ data }) => {
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .catch((err) => {
        // On refresh failure, clear auth and bubble up
        setAccessToken(null);
        throw err;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

// ---- interceptors ----------------------------------------------------------

// Add Authorization header if we have a token
api.interceptors.request.use(attachAuth);

// On 401, try a single refresh then retry the original request
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (!error.response || original?._retry) throw error;

    const status = error.response.status;
    const url = original?.url || '';

    // Only handle 401s for protected endpoints.
    const isAuthEndpoint =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/logout') ||
      url.includes('/auth/refresh');

    if (status !== 401 || isAuthEndpoint) {
      // Bubble up login/register errors (e.g., invalid credentials)
      throw error;
    }

    // If we don't have a token yet, there's nothing to refresh.
    if (!accessToken) throw error;

    try {
      original._retry = true;
      const newToken = await refreshAccessToken();
      original.headers = original.headers || {};
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      throw e;
    }
  }
);


export default api;
