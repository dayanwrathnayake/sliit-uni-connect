import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useThemeStore = create(
  persist(
    (set) => ({
      isDark: true, // default to dark

      toggleTheme: () =>
        set((state) => {
          const next = !state.isDark;
          document.documentElement.classList.toggle('dark', next);
          return { isDark: next };
        }),

      applyTheme: (isDark) => {
        document.documentElement.classList.toggle('dark', isDark);
      },
    }),
    {
      name: 'sliit-theme',
      partialize: (s) => ({ isDark: s.isDark }),
    }
  )
);

export { useThemeStore };
export default useThemeStore;
