import api from './api';
import { secureStorage } from '@/utils/storage';
import { STORAGE_KEYS } from '@/constants/config';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    currency: string;
    createdAt: string;
  };
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/login', payload);
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>('/auth/register', payload);
    return data;
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/forgot-password', { email });
    return data;
  },

  async verifyOTP(email: string, otp: string): Promise<{ token: string }> {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    return data;
  },

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const { data } = await api.post('/auth/reset-password', { token, password });
    return data;
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
      await secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
      await secureStorage.remove(STORAGE_KEYS.USER_DATA);
    }
  },

  async getProfile(): Promise<AuthResponse['user']> {
    const { data } = await api.get('/auth/profile');
    return data;
  },

  async updateProfile(payload: Partial<AuthResponse['user']>): Promise<AuthResponse['user']> {
    const { data } = await api.put('/auth/profile', payload);
    return data;
  },
};
