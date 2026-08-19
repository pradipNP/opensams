import api from './axios';

export function listCategories(params) {
  return api.get('/categories', { params });
}

export function listStatuses() {
  return api.get('/statuses');
}

export function listSchools(params) {
  return api.get('/schools', { params });
}

export function listMunicipalities(params) {
  return api.get('/municipalities', { params });
}

export function listProvinces() {
  return api.get('/provinces');
}
