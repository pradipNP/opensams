import api from './axios';

export function getMunicipality(id) {
  return api.get(`/municipalities/${id}`);
}

export function createMunicipality(payload) {
  return api.post('/municipalities', payload);
}

export function updateMunicipality(id, payload) {
  return api.put(`/municipalities/${id}`, payload);
}
