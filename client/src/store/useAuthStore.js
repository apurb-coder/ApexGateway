import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (userData, jwtToken) => set({
        user: userData,
        token: jwtToken,
        isAuthenticated: true,
      }),
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
      }),
      updateProfile: (updatedData) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedData } : null,
      })),
    }),
    {
      name: 'apex-auth-storage',
    }
  )
);
