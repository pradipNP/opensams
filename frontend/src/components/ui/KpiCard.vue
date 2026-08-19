<script setup>
defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  loading: { type: Boolean, default: false },
});
</script>

<template>
  <article class="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <p class="text-sm text-slate-500">{{ label }}</p>
    <p v-if="loading" class="mt-3 h-8 w-20 rounded bg-slate-100" />
    <p v-else class="mt-2 text-2xl font-semibold tracking-tight text-navy-950">{{ value }}</p>
  </article>
</template>
