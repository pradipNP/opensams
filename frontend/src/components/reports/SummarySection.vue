<script setup>
import { computed } from 'vue';
import { formatNumber } from '@/utils/format';

const props = defineProps({
  title: { type: String, required: true },
  rows: { type: Array, default: () => [] },
  nameKey: { type: String, default: 'name' },
  valueKey: { type: String, default: 'value' },
  emptyMessage: { type: String, default: 'No data available.' },
});

const total = computed(() =>
  props.rows.reduce((sum, row) => sum + Number(row[props.valueKey] || 0), 0)
);

function percent(row) {
  if (!total.value) {
    return 0;
  }
  return Math.round((Number(row[props.valueKey] || 0) / total.value) * 100);
}
</script>

<template>
  <section class="section-card p-6">
    <h2 class="text-lg font-semibold text-navy-950">{{ title }}</h2>
    <p v-if="!rows.length" class="mt-4 text-sm text-slate-500">{{ emptyMessage }}</p>
    <div v-else class="mt-4 overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            <th class="px-3 py-2">Name</th>
            <th class="px-3 py-2 text-right">Count</th>
            <th class="px-3 py-2">Share</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="(row, index) in rows" :key="row.id || row.slug || index" class="hover:bg-slate-50">
            <td class="px-3 py-2 text-navy-950">{{ row[nameKey] }}</td>
            <td class="px-3 py-2 text-right">{{ formatNumber(row[valueKey]) }}</td>
            <td class="px-3 py-2">
              <div class="flex items-center gap-2">
                <div class="h-2 flex-1 rounded bg-slate-100">
                  <div class="h-2 rounded bg-navy-900 transition-[width] duration-300" :style="{ width: `${percent(row)}%` }" />
                </div>
                <span class="w-10 text-right text-xs text-slate-500">{{ percent(row) }}%</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
