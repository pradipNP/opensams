import api from './axios';

export function listMaintenance(params) {
  return api.get('/maintenance', { params });
}

export function getMaintenance(id) {
  return api.get(`/maintenance/${id}`);
}

export function createMaintenance(payload) {
  return api.post('/maintenance', payload);
}

export function approveMaintenance(id, payload) {
  return api.put(`/maintenance/${id}/approve`, payload);
}

export function rejectMaintenance(id, payload) {
  return api.put(`/maintenance/${id}/reject`, payload);
}

export function completeMaintenance(id, payload) {
  return api.put(`/maintenance/${id}/complete`, payload);
}
