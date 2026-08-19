import api from './axios';

export function getKpis() {
  return api.get('/dashboard/kpis');
}

export function getCategoryChart() {
  return api.get('/dashboard/charts/category');
}

export function getStatusChart() {
  return api.get('/dashboard/charts/status');
}

export function getMunicipalityChart() {
  return api.get('/dashboard/charts/municipality');
}

export function getValueByMunicipalityChart() {
  return api.get('/dashboard/charts/value-by-municipality');
}

export function getTransferChart() {
  return api.get('/dashboard/charts/transfers');
}

export function getMunicipalityCount() {
  return api.get('/municipalities', {
    params: { page: 1, limit: 1 },
    skipAuthRedirect: true,
  });
}
