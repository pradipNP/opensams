<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';
import { APP_LOGO_SRC, APP_NAME } from '@/constants/app';

const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

async function onLogout() {
  await auth.logout();
  await router.push({ name: 'login' });
}
</script>

<template>
  <header class="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
    <div class="flex min-h-14 items-center justify-between gap-3 px-4 py-2 sm:px-6">
      <div class="flex min-w-0 items-center gap-3">
        <button
          type="button"
          class="btn btn-secondary btn-sm lg:hidden"
          :aria-expanded="app.sidebarOpen"
          aria-controls="app-sidebar"
          @click="app.toggleSidebar()"
        >
          Menu
        </button>
        <img
          :src="APP_LOGO_SRC"
          :alt="APP_NAME"
          class="h-8 w-8 shrink-0 object-contain lg:hidden"
          width="32"
          height="32"
        />
        <h1 class="truncate text-sm font-semibold text-navy-950 sm:text-base">{{ app.pageTitle }}</h1>
      </div>

      <div class="flex shrink-0 items-center gap-3 sm:gap-4">
        <div class="hidden text-right sm:block">
          <p class="text-sm font-medium text-slate-900">{{ auth.user?.fullName }}</p>
          <p class="text-xs text-slate-500">{{ auth.user?.roleName }}</p>
        </div>
        <div class="min-w-0 text-right sm:hidden">
          <p class="max-w-28 truncate text-xs font-medium text-slate-900" :title="auth.user?.fullName">
            {{ auth.user?.fullName }}
          </p>
          <p class="max-w-28 truncate text-[11px] text-slate-500">{{ auth.user?.roleName }}</p>
        </div>
        <button type="button" class="btn btn-secondary btn-sm" @click="onLogout">Logout</button>
      </div>
    </div>
  </header>
</template>
