<script setup>
import { computed } from 'vue';
import { formatNumber } from '@/utils/format';

const props = defineProps({
  items: { type: Array, default: () => [] },
});

const PALETTE = [
  '#122a4a',
  '#1a3a63',
  '#23487a',
  '#0f766e',
  '#047857',
  '#0369a1',
  '#075985',
  '#b45309',
  '#9b1c2e',
  '#334155',
  '#0e7490',
  '#365314',
  '#7c3aed',
  '#9f1239',
  '#155e75',
  '#3f6212',
  '#854d0e',
  '#1e3a5f',
];

const RADIUS = 32;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const total = computed(() =>
  props.items.reduce((sum, item) => {
    const value = Number(item.value);
    return sum + (Number.isFinite(value) && value > 0 ? value : 0);
  }, 0)
);

const rows = computed(() => {
  let offset = 0;
  return props.items.map((item, index) => {
    const value = Number(item.value);
    const safeValue = Number.isFinite(value) && value > 0 ? value : 0;
    const percent = safePercent(safeValue, total.value);
    const length = total.value > 0 ? (safeValue / total.value) * CIRCUMFERENCE : 0;
    const slice = {
      key: item.id || item.name || index,
      name: item.name || '—',
      hint: item.hint || '',
      display: formatNumber(safeValue),
      percentLabel: formatPercentLabel(percent),
      color: item.color || PALETTE[index % PALETTE.length],
      dasharray: `${length} ${Math.max(CIRCUMFERENCE - length, 0)}`,
      dashoffset: -offset,
      hasSlice: length > 0,
    };
    offset += length;
    return slice;
  });
});

const slices = computed(() => rows.value.filter((row) => row.hasSlice));

const summary = computed(() => {
  const names = rows.value
    .filter((row) => row.hasSlice)
    .map((row) => `${row.name} ${row.display} (${row.percentLabel})`);
  if (!names.length) {
    return 'No asset category data available.';
  }
  return `Assets by category. Total ${formatNumber(total.value)}. ${names.join('. ')}.`;
});

function safePercent(count, whole) {
  const n = Number(count);
  const t = Number(whole);
  if (!Number.isFinite(n) || !Number.isFinite(t) || t <= 0 || n <= 0) {
    return 0;
  }
  return Math.round((n / t) * 1000) / 10;
}

function formatPercentLabel(percent) {
  if (!Number.isFinite(percent) || percent < 0) {
    return '0%';
  }
  if (percent % 1 === 0) {
    return `${percent.toFixed(0)}%`;
  }
  return `${percent.toFixed(1)}%`;
}
</script>

<template>
  <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
    <div class="mx-auto w-44 shrink-0 sm:mx-0">
      <svg viewBox="0 0 100 100" class="h-44 w-44" role="img" :aria-label="summary">
        <circle cx="50" cy="50" r="32" fill="none" stroke="#e2e8f0" stroke-width="14" />
        <g transform="rotate(-90 50 50)">
          <circle
            v-for="row in slices"
            :key="row.key"
            cx="50"
            cy="50"
            r="32"
            fill="none"
            stroke-width="14"
            stroke-linecap="butt"
            :stroke="row.color"
            :stroke-dasharray="row.dasharray"
            :stroke-dashoffset="row.dashoffset"
          />
        </g>
        <text x="50" y="48" text-anchor="middle" fill="#0b1f3a" font-size="11" font-weight="600">
          {{ formatNumber(total) }}
        </text>
        <text x="50" y="58" text-anchor="middle" fill="#64748b" font-size="5">
          assets
        </text>
      </svg>
    </div>

    <div class="min-w-0 flex-1">
      <p class="sr-only">{{ summary }}</p>
      <ul class="max-h-52 space-y-1 overflow-y-auto pr-1 text-sm" tabindex="0" aria-label="Category legend">
        <li v-for="row in rows" :key="row.key" class="flex items-baseline gap-2">
          <span class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-sm" :style="{ backgroundColor: row.color }" aria-hidden="true" />
          <span class="min-w-0 flex-1 truncate text-navy-950" :title="row.hint ? `${row.name} (${row.hint})` : row.name">
            {{ row.name }}
          </span>
          <span class="shrink-0 tabular-nums text-slate-600">{{ row.display }}</span>
          <span class="w-12 shrink-0 text-right text-xs tabular-nums text-slate-500">{{ row.percentLabel }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>
