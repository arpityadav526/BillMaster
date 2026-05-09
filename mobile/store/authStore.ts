import { create } from 'zustand';
import { authService, AuthResponse } from '@/services/auth.service';
import { secureStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/config';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login({ email, password });
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register({ name, email, password });
      set({ user: response.user, isAuthenticated: true, isLoading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        const user = await authService.getProfile();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  updateUser: (data) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...data } });
    }
  },

  clearError: () => set({ error: null }),
}));
