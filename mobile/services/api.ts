import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { API_CONFIG, STORAGE_KEYS } from '@/constants/config';
import { secureStorage } from '@/utils/storage';

const api: AxiosInstance = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = await secureStorage.get(STORAGE_KEYS.REFRESH_TOKEN);
        if (refreshToken) {
          const { data } = await axios.post(`${API_CONFIG.BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          await secureStorage.set(STORAGE_KEYS.AUTH_TOKEN, data.token);
          originalRequest.headers.Authorization = `Bearer ${data.token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        await secureStorage.remove(STORAGE_KEYS.AUTH_TOKEN);
        await secureStorage.remove(STORAGE_KEYS.REFRESH_TOKEN);
        // Navigate to login
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// ML API instance
export const mlApi = axios.create({
  baseURL: API_CONFIG.ML_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

mlApi.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await secureStorage.get(STORAGE_KEYS.AUTH_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
