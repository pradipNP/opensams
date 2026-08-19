import api from './axios';

export function login(email, password) {
  return api.post('/auth/login', { email, password });
}

export function logout() {
  return api.post('/auth/logout');
}

export function getCurrentUser() {
  return api.get('/auth/me', { skipAuthRedirect: true });
}
