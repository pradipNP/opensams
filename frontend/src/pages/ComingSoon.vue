<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const title = computed(() => route.meta.title || 'This module');
</script>

<template>
  <section class="section-card p-6">
    <h2 class="text-lg font-semibold text-navy-950">{{ title }}</h2>
    <p class="mt-2 max-w-xl text-sm leading-6 text-slate-600">
      This module is not available in the current application.
    </p>
  </section>
</template>
