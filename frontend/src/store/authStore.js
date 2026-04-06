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
      userType: null,        // "STUDENT" | "STAFF"
      profilePicUrl: null,
      isAuthenticated: false,

      // ── Actions ────────────────────────────────────────────────────────

      /**
       * Call after a successful login or register API response.
       * Accepts the full AuthResponseDTO shape.
       */
      setAuth: (authData) =>
        set({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken ?? null,
          userId: authData.userId ?? null,
          displayName: authData.displayName,
          role: authData.role,
          faculty: authData.faculty ?? null,
          userType: authData.userType ?? 'STUDENT',
          profilePicUrl: authData.profilePicUrl ?? null,
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
          userType: null,
          profilePicUrl: null,
          isAuthenticated: false,
        }),
    }),
    {
      name: 'sliit-auth', // localStorage key
      storage: createJSONStorage(() => localStorage),
      // Persist: refreshToken (required for session restore) + role/userType (required for
      // role-based UI rendering during the brief window before the silent token refresh completes).
      // accessToken is intentionally NOT persisted — it stays in memory only.
      partialize: (state) => ({
        refreshToken: state.refreshToken,
        userType:     state.userType,
        role:         state.role,
        userId:       state.userId,
        displayName:  state.displayName,
        faculty:      state.faculty,
      }),
    }
  )
);

export { useAuthStore };
export default useAuthStore;
