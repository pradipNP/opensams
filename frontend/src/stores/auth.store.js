import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import * as authApi from '@/api/auth.api';
import { clearToken, getToken, setToken } from '@/utils/storage';
import { errorMessage } from '@/utils/format';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(getToken());
  const loading = ref(false);
  const initialized = ref(false);

  const isAuthenticated = computed(() => Boolean(token.value && user.value));
  const role = computed(() => user.value?.role || null);
  const permissions = computed(() => user.value?.permissions || []);

  function hasPermission(permission) {
    return permissions.value.includes(permission);
  }

  async function login(email, password) {
    loading.value = true;
    try {
      const response = await authApi.login(email, password);
      const payload = response.data;
      token.value = payload.token;
      user.value = payload.user;
      setToken(payload.token);
      return payload.user;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrentUser() {
    if (!token.value) {
      user.value = null;
      return null;
    }

    try {
      const response = await authApi.getCurrentUser();
      user.value = response.data;
      return user.value;
    } catch (error) {
      token.value = null;
      user.value = null;
      clearToken();
      throw error;
    }
  }

  async function initializeAuth() {
    if (initialized.value) {
      return;
    }

    token.value = getToken();
    if (token.value) {
      try {
        await fetchCurrentUser();
      } catch {
        token.value = null;
        user.value = null;
      }
    }

    initialized.value = true;
  }

  async function logout() {
    try {
      if (token.value) {
        await authApi.logout();
      }
    } catch {
      // Client still clears the session even if the API call fails.
    } finally {
      token.value = null;
      user.value = null;
      clearToken();
    }
  }

  return {
    user,
    token,
    loading,
    initialized,
    isAuthenticated,
    role,
    permissions,
    hasPermission,
    login,
    logout,
    fetchCurrentUser,
    initializeAuth,
    errorMessage,
  };
});
