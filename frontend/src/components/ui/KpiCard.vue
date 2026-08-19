<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <article class="card-hover rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-shadow" :aria-busy="loading">
    <p class="text-sm text-slate-500">{{ label }}</p>
    <p v-if="loading" class="mt-3 h-8 w-20 animate-pulse rounded bg-slate-100" aria-hidden="true" />
    <p v-else class="mt-2 text-2xl font-semibold tracking-tight text-navy-950">{{ value }}</p>
  </article>
</template>
