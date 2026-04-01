import { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';
import { useAuthStore } from '../store/authStore';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { setAuth, clearAuth, refreshToken } = useAuthStore();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ── Silent session restore on page refresh ──────────────────────────────
  // If a refreshToken exists in localStorage (rehydrated by Zustand persist),
  // call the refresh endpoint to get a new access token and restore the session.
  useEffect(() => {
    const restoreSession = async () => {
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const { data } = await axios.post(
          'http://localhost:8080/api/auth/refresh',
          { refreshToken }
        );

        setAuth(data);
        setUser({
          userId: data.userId,
          displayName: data.displayName,
          role: data.role,
          faculty: data.faculty,
        });
      } catch {
        // Refresh token is expired or invalid — clear everything silently
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount only

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email, password) => {
      const { data } = await api.post('/api/auth/login', { email, password });
      setAuth(data);
      setUser({
        userId: data.userId,
        displayName: data.displayName,
        role: data.role,
        faculty: data.faculty,
      });
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
