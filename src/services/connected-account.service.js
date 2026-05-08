import api from './api';

export const getAccounts = async () => {
  return await api.get('/connected-accounts');
};

export const connectAccount = async (data) => {
  return await api.post('/connected-accounts/connect', data);
};

export const disconnectAccount = async (id) => {
  return await api.delete(`/connected-accounts/${id}`);
};

export const importTransactions = async (id, transactions) => {
  return await api.post(`/connected-accounts/${id}/import`, { transactions });
};
