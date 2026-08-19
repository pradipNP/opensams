import api from './axios';

export function listUsers(params) {
  return api.get('/users', { params });
}

export function getUser(id) {
  return api.get(`/users/${id}`);
}

export function createUser(payload) {
  return api.post('/users', payload);
}

export function updateUser(id, payload) {
  return api.put(`/users/${id}`, payload);
}

export function deactivateUser(id) {
  return api.delete(`/users/${id}`);
}
