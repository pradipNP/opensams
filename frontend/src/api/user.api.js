import api from './axios';

export function listUsers(params) {
  return api.get('/users', { params });
}

export function getUser(id) {
  return api.get(`/users/${id}`);
}
