<script setup>
import { RouterLink } from 'vue-router';

defineProps({
  title: { type: String, required: true },
  description: { type: String, required: true },
  to: { type: Object, required: true },
});
</script>

<template>
  <article class="card-hover flex h-full flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow">
    <h2 class="text-lg font-semibold text-navy-950">{{ title }}</h2>
    <p class="mt-2 flex-1 text-sm leading-6 text-slate-600">{{ description }}</p>
    <div class="mt-4">
      <RouterLink
        :to="to"
        class="btn btn-primary"
      >
        Open
      </RouterLink>
    </div>
  </article>
</template>
