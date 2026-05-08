import api from './api';

export const getIncomes = async (params) => {
  return await api.get('/incomes', { params });
};

export const getStats = async () => {
  return await api.get('/incomes/stats');
};

export const createIncome = async (incomeData) => {
  return await api.post('/incomes', incomeData);
};

export const updateIncome = async (id, incomeData) => {
  return await api.put(`/incomes/${id}`, incomeData);
};

export const deleteIncome = async (id) => {
  return await api.delete(`/incomes/${id}`);
};
