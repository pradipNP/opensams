<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import { useAppStore } from '@/stores/app.store';

const app = useAppStore();
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <AppSidebar />
    <div class="lg:pl-64">
      <AppHeader />
      <main class="px-4 py-6 sm:px-6 lg:px-8">
        <router-view />
      </main>
    </div>
    <button
      v-if="app.sidebarOpen"
      type="button"
      class="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
      aria-label="Close menu"
      @click="app.closeSidebar()"
    />
  </div>
</template>
