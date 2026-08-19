import api from './axios';

export function listAssets(params) {
  return api.get('/assets', { params });
}

export function getAsset(id) {
  return api.get(`/assets/${id}`);
}

export function createAsset(payload) {
  return api.post('/assets', payload);
}

export function updateAsset(id, payload) {
  return api.put(`/assets/${id}`, payload);
}

export function getAssetHistory(id, params) {
  return api.get(`/assets/${id}/history`, { params });
}

export function getAssetQr(id) {
  return api.get(`/assets/${id}/qr`);
}
