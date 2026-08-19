<script setup>
import { computed } from 'vue';
import { formatNumber } from '@/utils/format';

const props = defineProps({
  items: { type: Array, default: () => [] },
});

const total = computed(() =>
  props.items.reduce((sum, item) => {
    const value = Number(item.value);
    return sum + (Number.isFinite(value) ? value : 0);
  }, 0)
);

const max = computed(() =>
  props.items.reduce((current, item) => {
    const value = Number(item.value);
    if (!Number.isFinite(value) || value <= current) {
      return current;
    }
    return value;
  }, 0)
);

const rows = computed(() =>
  props.items.map((item, index) => {
    const value = Number(item.value);
    const safeValue = Number.isFinite(value) && value > 0 ? value : 0;
    const percent = safePercent(safeValue, total.value);
    return {
      key: item.id || item.name || index,
      name: item.name || '—',
      hint: item.hint || '',
      display: item.display || formatNumber(safeValue),
      percentLabel: formatPercentLabel(percent),
      barWidth: barWidth(safeValue, max.value),
      color: item.color || '',
      ariaLabel: `${item.name || 'Item'}: ${item.display || formatNumber(safeValue)}, ${formatPercentLabel(percent)}`,
    };
  })
);

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

function barWidth(count, wholeMax) {
  const n = Number(count);
  const m = Number(wholeMax);
  if (!Number.isFinite(n) || !Number.isFinite(m) || m <= 0 || n <= 0) {
    return 0;
  }
  return Math.min(100, (n / m) * 100);
}
</script>

<template>
  <ul class="space-y-3">
    <li v-for="row in rows" :key="row.key">
      <div class="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <div class="min-w-0">
          <p class="font-medium text-navy-950">{{ row.name }}</p>
          <p v-if="row.hint" class="text-xs text-slate-500">{{ row.hint }}</p>
        </div>
        <p class="shrink-0 text-slate-600">
          <span class="font-medium text-navy-950">{{ row.display }}</span>
          <span class="ml-2 text-xs text-slate-500">{{ row.percentLabel }}</span>
        </p>
      </div>
      <div
        class="mt-1.5 h-2.5 overflow-hidden rounded bg-slate-100"
        role="img"
        :aria-label="row.ariaLabel"
      >
        <div
          class="h-2.5 rounded transition-[width] duration-300"
          :class="row.color ? '' : 'bg-navy-900'"
          :style="{
            width: `${row.barWidth}%`,
            backgroundColor: row.color || undefined,
          }"
        />
      </div>
    </li>
  </ul>
</template>
