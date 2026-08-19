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

const sections = computed(() => {
  const grouped = [];
  items.value.forEach((item) => {
    const label = item.section || 'Menu';
    const existing = grouped.find((section) => section.label === label);
    if (existing) {
      existing.items.push(item);
      return;
    }
    grouped.push({ label, items: [item] });
  });
  return grouped;
});

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
    id="app-sidebar"
    class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy-950 text-slate-200 transition-transform duration-200 ease-out lg:translate-x-0"
    :class="app.sidebarOpen ? 'translate-x-0' : '-translate-x-full'"
    aria-label="Main navigation"
  >
    <div class="border-b border-white/10 px-5 py-5">
      <p class="text-[11px] font-semibold tracking-[0.18em] text-slate-400 uppercase">Government of Nepal</p>
      <p class="mt-1 text-lg font-semibold text-white">SAMS Nepal</p>
      <p class="mt-1 text-xs text-slate-400">School Asset Management</p>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 py-4">
      <div v-for="section in sections" :key="section.label" class="mb-4">
        <p class="px-3 pb-1 text-[11px] font-semibold tracking-[0.14em] text-slate-500 uppercase">
          {{ section.label }}
        </p>
        <RouterLink
          v-for="item in section.items"
          :key="item.name"
          :to="item.to"
          class="mb-0.5 flex items-center rounded-md px-3 py-2 text-sm"
          :class="
            isActive(item)
              ? 'bg-white/10 font-medium text-white shadow-[inset_3px_0_0_0_#ffffff]'
              : 'text-slate-300 hover:bg-white/5 hover:text-white'
          "
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="app.closeSidebar()"
        >
          {{ item.label }}
        </RouterLink>
      </div>
    </nav>
  </aside>
</template>
