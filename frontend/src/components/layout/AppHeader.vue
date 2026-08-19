<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

async function onLogout() {
  await auth.logout();
  await router.push({ name: 'login' });
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white">
    <div class="flex h-14 items-center justify-between px-4 sm:px-6">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-700 lg:hidden"
          @click="app.toggleSidebar()"
        >
          Menu
        </button>
        <h1 class="text-sm font-semibold text-navy-950 sm:text-base">{{ app.pageTitle }}</h1>
      </div>

      <div class="flex items-center gap-4">
        <div class="hidden text-right sm:block">
          <p class="text-sm font-medium text-slate-900">{{ auth.user?.fullName }}</p>
          <p class="text-xs text-slate-500">{{ auth.user?.roleName }}</p>
        </div>
        <button
          type="button"
          class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          @click="onLogout"
        >
          Logout
        </button>
      </div>
    </div>
  </header>
</template>
