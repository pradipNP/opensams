import api from './axios';

export function getSchool(id) {
  return api.get(`/schools/${id}`);
}

export function createSchool(payload) {
  return api.post('/schools', payload);
}

export function updateSchool(id, payload) {
  return api.put(`/schools/${id}`, payload);
}

export function listSchoolAssets(id, params) {
  return api.get(`/schools/${id}/assets`, { params });
}
