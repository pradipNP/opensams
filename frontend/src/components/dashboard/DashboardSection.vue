<script setup>
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';

defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  to: { type: Object, default: null },
  toLabel: { type: String, default: 'View all' },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  empty: { type: Boolean, default: false },
  emptyMessage: { type: String, default: 'No data available.' },
  retryable: { type: Boolean, default: false },
});

defineEmits(['retry']);
</script>

<template>
  <section class="section-card p-5 sm:p-6">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <h2 class="text-lg font-semibold text-navy-950">{{ title }}</h2>
        <p v-if="description" class="mt-1 text-sm text-slate-600">{{ description }}</p>
      </div>
      <RouterLink v-if="to && !loading" :to="to" class="link-back">
        {{ toLabel }}
      </RouterLink>
    </div>

    <div v-if="loading" class="mt-4 space-y-3" aria-busy="true" aria-live="polite">
      <div class="h-8 rounded bg-slate-100" />
      <div class="h-8 rounded bg-slate-100" />
      <div class="h-8 w-4/5 rounded bg-slate-100" />
      <div class="h-8 w-3/5 rounded bg-slate-100" />
    </div>
    <div v-else-if="error" class="mt-4">
      <Alert :message="error" />
      <button
        v-if="retryable"
        type="button"
        class="btn btn-secondary btn-sm mt-2"
        @click="$emit('retry')"
      >
        Retry
      </button>
    </div>
    <p v-else-if="empty" class="mt-4 text-sm text-slate-500">{{ emptyMessage }}</p>
    <div v-else class="mt-4">
      <slot />
    </div>
  </section>
</template>
