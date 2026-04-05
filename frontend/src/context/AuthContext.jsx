import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export const AuthContext = createContext(null);

const BASE_URL = 'http://localhost:8080';

/**
 * After we have a valid accessToken + userId, fetch the full user profile
 * from /api/users/{userId}/profile and merge profilePicUrl into the Zustand store.
 * This ensures the Navbar avatar is always correct across refreshes.
 */
async function hydrateProfilePic(userId, setAuth) {
  try {
    const { data } = await api.get(`/api/users/${userId}/profile`);
    if (data.profilePicUrl) {
      // Merge — only update profilePicUrl; don't touch tokens or other fields
      useAuthStore.setState((s) => ({ ...s, profilePicUrl: data.profilePicUrl }));
    }
  } catch {
    // Non-fatal — worst case the navbar shows initials instead
  }
}

export function AuthProvider({ children }) {
  const { setAuth, clearAuth, refreshToken } = useAuthStore();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ── Silent session restore on page refresh ──────────────────────────────
  useEffect(() => {
    const restoreSession = async () => {
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });

        // Pass userType explicitly — students always restore as STUDENT
        setAuth({ ...data, userType: 'STUDENT' });
        setUser({
          userId:      data.userId,
          displayName: data.displayName,
          role:        data.role,
          faculty:     data.faculty,
          userType:    'STUDENT',
        });

        // Fetch full profile to restore profilePicUrl (not in refresh response)
        await hydrateProfilePic(data.userId, setAuth);
      } catch {
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/api/auth/login', { email, password });

      setAuth(data);
      setUser({
        userId:      data.userId,
        displayName: data.displayName,
        role:        data.role,
        faculty:     data.faculty,
      });

      // Populate profilePicUrl right after login so Navbar shows the photo immediately
      await hydrateProfilePic(data.userId, setAuth);

      return data;
    },
    [setAuth]
  );

  // ── Logout ───────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
    navigate('/login', { replace: true });
  }, [clearAuth, navigate]);

  const value = { user, login, logout, isLoading };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
