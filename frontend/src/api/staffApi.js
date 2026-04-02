import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api';

/**
 * Staff login — uses plain axios (no auth header needed).
 * Only staff endpoint that is public.
 *
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ accessToken, staffId, displayName, role, faculty }>}
 */
export async function staffLogin({ email, password }) {
  const { data } = await axios.post(`${BASE_URL}/staff/auth/login`, {
    email,
    password,
  });
  return data;
}
