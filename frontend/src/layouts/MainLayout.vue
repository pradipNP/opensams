<script setup>
import AppHeader from '@/components/layout/AppHeader.vue';
import AppSidebar from '@/components/layout/AppSidebar.vue';
import AppFooter from '@/components/layout/AppFooter.vue';
import Alert from '@/components/ui/Alert.vue';
import { useAppStore } from '@/stores/app.store';

const app = useAppStore();
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <AppSidebar />
    <div class="flex min-h-screen flex-col lg:pl-64">
      <AppHeader />
      <main class="mx-auto w-full max-w-[1440px] flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <Alert v-if="app.notice" class="mb-4" variant="warning" :message="app.notice" />
        <router-view />
      </main>
      <AppFooter />
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
