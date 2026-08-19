import api from './axios';

export function listMaintenance(params) {
  return api.get('/maintenance', { params });
}

export function getMaintenance(id) {
  return api.get(`/maintenance/${id}`);
}
