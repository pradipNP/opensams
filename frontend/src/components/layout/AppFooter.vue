<script setup>
import { APP_COPYRIGHT_YEAR, APP_FULL_NAME, APP_NAME, APP_VERSION } from '@/constants/app';
</script>

<template>
  <footer class="border-t border-slate-200 bg-white">
    <div class="mx-auto max-w-[1440px] px-4 py-4 text-center sm:px-6 lg:px-8">
      <p class="text-xs font-medium text-navy-950">{{ APP_NAME }} v{{ APP_VERSION }}</p>
      <p class="mt-0.5 text-xs text-slate-500">{{ APP_FULL_NAME }}</p>
      <p class="mt-1 text-[11px] text-slate-400">
        © {{ APP_COPYRIGHT_YEAR }} {{ APP_NAME }}. All rights reserved.
      </p>
    </div>
  </footer>
</template>
