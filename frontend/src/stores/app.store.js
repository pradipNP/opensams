import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { APP_NAME } from '@/constants/app';

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(false);
  const pageTitle = ref('Dashboard');
  const notice = ref('');

  const appName = computed(() => APP_NAME);

  function setPageTitle(title) {
    pageTitle.value = title;
    document.title = title ? `${title} — ${APP_NAME}` : APP_NAME;
  }

  function setNotice(message) {
    notice.value = message || '';
  }

  function clearNotice() {
    notice.value = '';
  }

  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  function closeSidebar() {
    sidebarOpen.value = false;
  }

  return {
    sidebarOpen,
    pageTitle,
    notice,
    appName,
    setPageTitle,
    setNotice,
    clearNotice,
    toggleSidebar,
    closeSidebar,
  };
});
