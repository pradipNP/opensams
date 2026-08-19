<script setup>
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';
import { NAV_ITEMS } from '@/utils/navigation';

const route = useRoute();
const auth = useAuthStore();
const app = useAppStore();

const items = computed(() =>
  NAV_ITEMS.filter((item) => {
    if (item.permission && !auth.hasPermission(item.permission)) {
      return false;
    }
    if (item.roles && !item.roles.includes(auth.role)) {
      return false;
    }
    return true;
  })
);

function isActive(item) {
  if (item.name === 'assets') {
    return String(route.path).startsWith('/assets');
  }
  if (item.name === 'maintenance') {
    return String(route.path).startsWith('/maintenance');
  }
  if (item.name === 'transfers') {
    return String(route.path).startsWith('/transfers');
  }
  if (item.name === 'reports') {
    return String(route.path).startsWith('/reports');
  }
  if (item.name === 'users') {
    return String(route.path).startsWith('/users');
  }
  if (item.name === 'municipalities') {
    return String(route.path).startsWith('/municipalities');
  }
  if (item.name === 'schools') {
    return String(route.path).startsWith('/schools');
  }
  if (item.name === 'categories') {
    return String(route.path).startsWith('/categories');
  }
  return route.name === item.name;
}
</script>

<template>
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-950 text-slate-200 lg:translate-x-0"
    :class="app.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="border-b border-white/10 px-5 py-5">
      <p class="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Government of Nepal</p>
      <p class="mt-1 text-lg font-semibold text-white">SAMS Nepal</p>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <RouterLink
        v-for="item in items"
        :key="item.name"
        :to="item.to"
        class="mb-1 flex items-center rounded-md px-3 py-2 text-sm"
        :class="isActive(item) ? 'bg-white/10 font-medium text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'"
        @click="app.closeSidebar()"
      >
        {{ item.label }}
      </RouterLink>
    </nav>
  </aside>
</template>
