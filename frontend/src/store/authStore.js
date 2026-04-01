import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ── Zustand auth store ─────────────────────────────────────────────────────
// accessToken lives only in memory (never localStorage) for security.
// refreshToken is persisted to localStorage so the user stays logged in
// across page refreshes.

const useAuthStore = create(
  persist(
    (set) => ({
      // ── State ──────────────────────────────────────────────────────────
      accessToken: null,
      refreshToken: null,
      userId: null,
      displayName: null,
      role: null,
      faculty: null,
      isAuthenticated: false,

      // ── Actions ────────────────────────────────────────────────────────

      /**
       * Call after a successful login or register API response.
       * Accepts the full AuthResponseDTO shape.
       */
      setAuth: (authData) =>
        set({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken,
          userId: authData.userId,
          displayName: authData.displayName,
          role: authData.role,
          faculty: authData.faculty,
          isAuthenticated: true,
        }),

      /**
       * Call on logout or when a token refresh fails.
       * Wipes everything back to the unauthenticated default.
       */
      clearAuth: () =>
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          displayName: null,
          role: null,
          faculty: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'sliit-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Only persist the refreshToken — access token stays in memory only.
      partialize: (state) => ({ refreshToken: state.refreshToken }),
    }
  )
);

export { useAuthStore };
export default useAuthStore;
