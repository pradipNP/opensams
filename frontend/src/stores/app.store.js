import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useAppStore = defineStore('app', () => {
  const sidebarOpen = ref(false);
  const pageTitle = ref('Dashboard');

  const appName = computed(() => 'SAMS Nepal');

  function setPageTitle(title) {
    pageTitle.value = title;
    document.title = title ? `${title} — SAMS Nepal` : 'SAMS Nepal';
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
    appName,
    setPageTitle,
    toggleSidebar,
    closeSidebar,
  };
});
