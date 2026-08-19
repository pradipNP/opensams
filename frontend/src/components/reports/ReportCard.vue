<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  to: { type: Object, required: true },
});
</script>

<template>
  <article class="flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <h2 class="text-lg font-semibold text-navy-950">{{ title }}</h2>
    <p class="mt-2 flex-1 text-sm leading-6 text-slate-600">{{ description }}</p>
    <div class="mt-4">
      <RouterLink
        :to="to"
        class="inline-flex rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
      >
        Open
      </RouterLink>
    </div>
  </article>
</template>
