import { create } from 'zustand';
import { supabase } from '../services/supabase';
import apiClient from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  // Initialize and listen to auth changes
  initAuth: () => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        const isEmailUnconfirmed = session.user?.email && !session.user?.email_confirmed_at && !session.user?.confirmed_at;
        if (isEmailUnconfirmed) {
          set({ user: null, token: null, isAuthenticated: false, loading: false });
        } else {
          get().handleSession(session);
        }
      } else {
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    });

    // Listen to changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const isEmailUnconfirmed = session.user?.email && !session.user?.email_confirmed_at && !session.user?.confirmed_at;
        if (isEmailUnconfirmed) {
          set({ user: null, token: null, isAuthenticated: false, loading: false });
          return;
        }
        await get().handleSession(session);
      } else {
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  },

  // Helper to sync session state
  handleSession: async (session) => {
    const token = session.access_token;
    if (get().token === token && get().isAuthenticated) {
      return;
    }

    // Preemptively set token to block concurrent requests and supply to interceptor
    set({ token });

    try {
      // Fetch user profile (with role) from backend using Supabase JWT
      const res = await apiClient.get('/auth/me');
      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false
      });
    } catch (err) {
      // Backend lookup failed (e.g. not synced yet)
      // We will provision user with metadata role on backend or create locally
      // For fallback, use Supabase user details
      const role = session.user?.user_metadata?.role || 'CONSUMER';
      set({
        user: {
          id: session.user.id,
          email: session.user.email,
          role
        },
        isAuthenticated: true,
        loading: false
      });
    }
  },

  // Sign up with Email + Password + Role
  signUp: async (email, password, role) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role
          }
        }
      });
      if (error) throw error;

      const session = data.session;
      const user = data.user;

      if (user && session) {
        // Call backend to register/sync the user with selected role
        // Only if session is present (email confirmation disabled)
        await apiClient.post('/auth/register', {
          id: user.id,
          email: user.email,
          role: role
        }, {
          headers: { Authorization: `Bearer ${session.access_token}` }
        });
      }

      set({ loading: false });
      return { data, error: null };
    } catch (err) {
      set({ loading: false });
      return { data: null, error: err };
    }
  },

  // Log in with Email + Password
  login: async (email, password) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      await get().handleSession(data.session);
      return { data, error: null };
    } catch (err) {
      set({ loading: false });
      return { data: null, error: err };
    }
  },



  // Forgot Password email trigger
  forgotPassword: async (email) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      set({ loading: false });
      return { data, error: null };
    } catch (err) {
      set({ loading: false });
      return { data: null, error: err };
    }
  },

  // Reset Password for logged in / recovery flow redirected user
  resetPassword: async (newPassword) => {
    set({ loading: true });
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      set({ loading: false });
      return { data, error: null };
    } catch (err) {
      set({ loading: false });
      return { data: null, error: err };
    }
  },

  // Sign out
  logout: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
    } catch (err) {
      // Ignore signOut errors
    } finally {
      set({ user: null, token: null, isAuthenticated: false, loading: false });
    }
  },

  updateProfile: (updatedData) => set((state) => ({
    user: state.user ? { ...state.user, ...updatedData } : null,
  })),
}));
