export const API_CONFIG = {
  BASE_URL: 'http://localhost:5001/api', // Updated to 5001 based on project context
  ML_URL: 'http://localhost:8000',
  SOCKET_URL: 'http://localhost:5001',
  TIMEOUT: 15000,
} as const;

export const APP_CONFIG = {
  APP_NAME: 'BillMaster',
  VERSION: '1.0.0',
  CURRENCY: 'USD',
  DATE_FORMAT: 'MMM dd, yyyy',
  MAX_UPLOAD_SIZE: 10 * 1024 * 1024, // 10MB
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'billmaster_auth_token',
  REFRESH_TOKEN: 'billmaster_refresh_token',
  USER_DATA: 'billmaster_user_data',
  THEME: 'billmaster_theme',
  ONBOARDING_COMPLETE: 'billmaster_onboarding',
} as const;
