// client/src/services/auth.api.js
import api, { setAccessToken } from './api';

export async function registerApi({ email, password }) {
  const { data } = await api.post('/auth/register', { email, password });
  // response: { accessToken, user }
  setAccessToken(data.accessToken);
  return data.user;
}

export async function loginApi({ email, password }) {
  const { data } = await api.post('/auth/login', { email, password });
  setAccessToken(data.accessToken);
  return data.user;
}

export async function logoutApi() {
  try {
    await api.post('/auth/logout'); // clears refresh cookie server-side
  } finally {
    setAccessToken(null);
  }
}
