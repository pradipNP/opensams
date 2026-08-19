import api from './axios';

export function createCategory(payload) {
  return api.post('/categories', payload);
}

export function updateCategory(id, payload) {
  return api.put(`/categories/${id}`, payload);
}
