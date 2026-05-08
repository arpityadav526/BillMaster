import api from './api';

export const getOverview = async () => {
  return await api.get('/analytics/overview');
};

export const getInsights = async () => {
  return await api.get('/analytics/insights');
};
