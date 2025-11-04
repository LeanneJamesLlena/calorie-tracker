// client/src/store/authStore.js
import { create } from 'zustand';
import { loginApi, registerApi, logoutApi } from '../services/auth.api';
import { setAccessToken } from '../services/api';

// Try to rehydrate user from localStorage on load
const storedUser = (() => {
  try { return JSON.parse(localStorage.getItem('user')); }
  catch { return null; }
})();

function parseApiError(err, fallback) {
  const res = err?.response;
  const data = res?.data;

  // Common patterns
  const message =
    data?.message ||
    data?.error ||
    (Array.isArray(data?.errors) && (data.errors[0]?.msg || data.errors[0])) ||
    err?.message ||
    fallback;
    
  if (res?.status === 401 && (res.config?.url || '').includes('/auth/login')) {
    return 'Invalid email or password.';
  }

  // Friendly hint for conflict responses (email taken)
  if (res?.status === 409 || /exist|taken|already/i.test(String(message))) {
    return 'Email is already registered.';
  }

  return String(message || fallback);
}

const useAuthStore = create((set) => ({
  user: storedUser || null,
  loading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const user = await registerApi(payload); // returns user
      set({ user, loading: false });
      localStorage.setItem('user', JSON.stringify(user));
      return { ok: true, user };
    } catch (err) {
      const msg = parseApiError(err, 'Registration failed');
      set({ loading: false, error: msg });
      return { ok: false, error: msg };
    }
  },

  login: async (payload) => {
    set({ loading: true, error: null });
    try {
      const user = await loginApi(payload); // returns user
      set({ user, loading: false });
      localStorage.setItem('user', JSON.stringify(user));
      return { ok: true, user };
    } catch (err) {
      const msg = parseApiError(err, 'Login failed');
      set({ loading: false, error: msg });
      return { ok: false, error: msg };
    }
  },

  logout: async () => {
    try {
      await logoutApi();
    } finally {
      setAccessToken(null);
      localStorage.removeItem('user');
      set({ user: null, error: null });
    }
  },
}));

export default useAuthStore;
