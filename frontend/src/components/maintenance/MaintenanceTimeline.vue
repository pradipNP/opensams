<script setup>
import { computed } from 'vue';
import { displayValue, formatDateTime } from '@/utils/format';

const props = defineProps({
  request: { type: Object, default: null },
});

const steps = computed(() => {
  const item = props.request || {};
  const status = item.status || '';
  return [
    {
      key: 'requested',
      label: 'Requested',
      done: Boolean(item.requestedAt),
      at: item.requestedAt,
      detail: item.requestedBy?.fullName || '',
    },
    {
      key: 'approved',
      label: 'Approved',
      done: Boolean(item.approvedAt),
      at: item.approvedAt,
      detail: item.approvedBy?.fullName || item.assignedTo || '',
    },
    {
      key: 'rejected',
      label: 'Rejected',
      done: status === 'rejected',
      at: status === 'rejected' ? item.updatedAt : null,
      detail: item.rejectionReason || '',
    },
    {
      key: 'completed',
      label: 'Completed',
      done: status === 'completed',
      at: item.completedAt,
      detail: status === 'completed' ? item.notes || '' : '',
    },
  ];
});
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-lg font-semibold text-navy-950">Workflow timeline</h2>
    <ol class="mt-4 space-y-4">
      <li v-for="step in steps" :key="step.key" class="flex gap-3">
        <span
          class="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px]"
          :class="
            step.done
              ? 'border-navy-900 bg-navy-900 text-white'
              : 'border-slate-300 bg-white text-slate-400'
          "
        >
          {{ step.done ? '✓' : '' }}
        </span>
        <div>
          <p class="text-sm font-medium" :class="step.done ? 'text-navy-950' : 'text-slate-500'">
            {{ step.label }}
          </p>
          <p class="text-xs text-slate-500">{{ step.at ? formatDateTime(step.at) : 'Not reached' }}</p>
          <p v-if="step.detail" class="mt-1 text-sm text-slate-600">{{ displayValue(step.detail) }}</p>
        </div>
      </li>
    </ol>
  </section>
</template>
