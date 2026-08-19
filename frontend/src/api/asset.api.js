import api from './axios';

export function listAssets(params) {
  return api.get('/assets', { params });
}

export function getAsset(id) {
  return api.get(`/assets/${id}`);
}
