<script setup>
const ACCENT_BORDERS = {
  navy: 'border-slate-400',
  emerald: 'border-emerald-300',
  teal: 'border-teal-300',
  indigo: 'border-indigo-300',
  sky: 'border-sky-300',
  amber: 'border-amber-300',
  rose: 'border-rose-300',
};

defineProps({
  label: { type: String, required: true },
  value: { type: [String, Number], default: '—' },
  loading: { type: Boolean, default: false },
  accent: { type: String, default: '' },
});
</script>

<template>
  <article
    class="card-hover rounded-lg bg-white p-5 shadow-sm transition-shadow"
    :class="accent ? `border-2 ${ACCENT_BORDERS[accent] || 'border-slate-200'}` : 'border border-slate-200'"
    :aria-busy="loading"
  >
    <p class="text-sm text-slate-500">{{ label }}</p>
    <p v-if="loading" class="mt-3 h-8 w-20 animate-pulse rounded bg-slate-100" aria-hidden="true" />
    <p v-else class="mt-2 text-2xl font-semibold tracking-tight text-navy-950">{{ value }}</p>
  </article>
</template>
