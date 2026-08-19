import api from './axios';

export function getKpis() {
  return api.get('/dashboard/kpis');
}

export function getMunicipalityCount() {
  return api.get('/municipalities', {
    params: { page: 1, limit: 1 },
    skipAuthRedirect: true,
  });
}
