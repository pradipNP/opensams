import api from './axios';

export function listTransfers(params) {
  return api.get('/transfers', { params });
}

export function getTransfer(id) {
  return api.get(`/transfers/${id}`);
}
