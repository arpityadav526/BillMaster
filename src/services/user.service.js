import api from './api';

export const updateProfile = async (data) => {
  const response = await api.patch('/users/profile', data);
  return response;
};

export const updateAvatar = async (formData) => {
  const response = await api.post('/users/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response;
};

export const changePassword = async (data) => {
  const response = await api.patch('/users/change-password', data);
  return response;
};
