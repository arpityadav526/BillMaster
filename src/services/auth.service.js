import api from './api';

export const login = async (email, password) => {
  const data = await api.post('/auth/login', { email, password });
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

export const register = async (userData) => {
  const data = await api.post('/auth/register', userData);
  if (data.success) {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
  }
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  return await api.get('/auth/me');
};

export const updateProfile = async (profileData) => {
  return await api.patch('/users/profile', profileData);
};

export const updateAvatar = async (formData) => {
  return await api.post('/users/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const changePassword = async (passwordData) => {
  return await api.patch('/users/change-password', passwordData);
};
