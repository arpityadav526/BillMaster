import api from './api';

export const getExpenses = async (params) => {
  return await api.get('/expenses', { params });
};

export const getStats = async () => {
  return await api.get('/expenses/stats');
};

export const createExpense = async (expenseData) => {
  return await api.post('/expenses', expenseData);
};

export const updateExpense = async (id, expenseData) => {
  return await api.put(`/expenses/${id}`, expenseData);
};

export const deleteExpense = async (id) => {
  return await api.delete(`/expenses/${id}`);
};
