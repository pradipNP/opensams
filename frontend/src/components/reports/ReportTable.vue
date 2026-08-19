<script setup>
import { computed } from 'vue';

const props = defineProps({
  rows: { type: Array, default: () => [] },
  columns: { type: Array, default: () => [] },
  meta: { type: Object, default: null },
  sort: { type: String, default: '' },
  order: { type: String, default: 'desc' },
  loading: { type: Boolean, default: false },
  emptyMessage: { type: String, default: 'No records match the current filters.' },
});

const emit = defineEmits(['sort', 'page']);

const rangeLabel = computed(() => {
  const total = Number(props.meta?.total || 0);
  if (!total) {
    return '0 results';
  }
  const page = Number(props.meta?.page || 1);
  const limit = Number(props.meta?.limit || 20);
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return `Showing ${from}–${to} of ${total}`;
});

function cellValue(row, column) {
  if (typeof column.get === 'function') {
    return column.get(row);
  }
  return row[column.key] ?? '—';
}

function sortIndicator(column) {
  const key = column.sortKey || column.key;
  if (!column.sortable || props.sort !== key) {
    return '';
  }
  return props.order === 'asc' ? ' ↑' : ' ↓';
}

function onSort(column) {
  if (!column.sortable) {
    return;
  }
  const key = column.sortKey || column.key;
  if (props.sort === key) {
    emit('sort', { sort: key, order: props.order === 'asc' ? 'desc' : 'asc' });
    return;
  }
  emit('sort', { sort: key, order: 'desc' });
}
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              class="px-4 py-3 whitespace-nowrap"
              :class="column.sortable ? 'cursor-pointer select-none hover:text-navy-950' : ''"
              @click="onSort(column)"
            >
              {{ column.label }}{{ sortIndicator(column) }}
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
          <tr v-if="loading && !rows.length">
            <td :colspan="columns.length || 1" class="px-4 py-10 text-center text-slate-500">Loading report…</td>
          </tr>
          <tr v-else-if="!rows.length">
            <td :colspan="columns.length || 1" class="px-4 py-10 text-center text-slate-500">{{ emptyMessage }}</td>
          </tr>
          <tr v-for="(row, index) in rows" :key="row.id || index" class="hover:bg-slate-50">
            <td v-for="column in columns" :key="column.key" class="px-4 py-3">
              {{ cellValue(row, column) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="meta"
      class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600"
    >
      <p>{{ loading && rows.length ? 'Refreshing…' : rangeLabel }}</p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading || (meta.page || 1) <= 1"
          @click="emit('page', (meta.page || 1) - 1)"
        >
          Previous
        </button>
        <span>Page {{ meta.page || 1 }} of {{ meta.totalPages || 1 }}</span>
        <button
          type="button"
          class="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          :disabled="loading || (meta.page || 1) >= (meta.totalPages || 1)"
          @click="emit('page', (meta.page || 1) + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>
