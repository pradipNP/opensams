import api from './axios';

export function getReport(type, params) {
  return api.get(`/reports/${type}`, { params });
}

export function exportReport(type, format, params) {
  return api.get(`/reports/${type}/export`, {
    params: { ...params, format },
    responseType: 'blob',
    timeout: 120000,
  });
}
