import api from './axios';

export function listTransfers(params) {
  return api.get('/transfers', { params });
}

export function getTransfer(id) {
  return api.get(`/transfers/${id}`);
}

export function createTransfer(payload) {
  return api.post('/transfers', payload);
}

export function approveTransfer(id, payload) {
  return api.put(`/transfers/${id}/approve`, payload);
}

export function rejectTransfer(id, payload) {
  return api.put(`/transfers/${id}/reject`, payload);
}

export function completeTransfer(id, payload) {
  return api.put(`/transfers/${id}/complete`, payload);
}

export function cancelTransfer(id, payload) {
  return api.put(`/transfers/${id}/cancel`, payload);
}
