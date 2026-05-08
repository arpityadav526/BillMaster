import api from './api';

export const getReceipts = async () => {
  return await api.get('/receipts');
};

export const uploadReceipt = async (file) => {
  const formData = new FormData();
  formData.append('receipt', file);
  
  return await api.post('/receipts', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const deleteReceipt = async (id) => {
  return await api.delete(`/receipts/${id}`);
};
