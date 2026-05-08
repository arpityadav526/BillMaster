import api from './api';

export const getBudgets = async (month, year) => {
  return await api.get('/budgets', { params: { month, year } });
};

export const setBudget = async (budgetData) => {
  return await api.post('/budgets', budgetData);
};

export const deleteBudget = async (id) => {
  return await api.delete(`/budgets/${id}`);
};
