<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatCurrency, formatDate } from '@/utils/format';

const props = defineProps({
  assets: { type: Array, default: () => [] },
  meta: { type: Object, default: () => ({ page: 1, limit: 20, total: 0, totalPages: 0 }) },
  sort: { type: String, default: 'created_at' },
  order: { type: String, default: 'desc' },
  loading: { type: Boolean, default: false },
  canEdit: { type: Boolean, default: false },
});

const emit = defineEmits(['sort', 'page']);

const columns = [
  { key: 'asset_tag', label: 'Asset Tag', sortable: true },
  { key: 'name', label: 'Asset Name', sortable: true },
  { key: 'category', label: 'Category', sortable: false },
  { key: 'status', label: 'Status', sortable: false },
  { key: 'school', label: 'School', sortable: false },
  { key: 'purchase_cost', label: 'Purchase Cost', sortable: true },
  { key: 'purchase_date', label: 'Purchase Date', sortable: true },
];

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

function sortIndicator(column) {
  if (props.sort !== column) {
    return '';
  }
  return props.order === 'asc' ? ' ↑' : ' ↓';
}

function onSort(column) {
  if (!column) {
    return;
  }
  if (props.sort === column) {
    emit('sort', { sort: column, order: props.order === 'asc' ? 'desc' : 'asc' });
    return;
  }
  emit('sort', { sort: column, order: 'desc' });
}

function statusStyle(status) {
  const color = status?.colorCode || '#64748b';
  return {
    color,
    backgroundColor: `${color}22`,
    border: `1px solid ${color}44`,
  };
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
              @click="column.sortable && onSort(column.key)"
            >
              {{ column.label }}{{ column.sortable ? sortIndicator(column.key) : '' }}
            </th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
          <tr v-if="loading && !assets.length">
            <td colspan="8" class="px-4 py-10 text-center text-slate-500">Loading assets…</td>
          </tr>
          <tr v-else-if="!assets.length">
            <td colspan="8" class="px-4 py-10 text-center text-slate-500">No assets match the current filters.</td>
          </tr>
          <tr v-for="asset in assets" :key="asset.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium whitespace-nowrap text-navy-950">{{ asset.assetTag }}</td>
            <td class="px-4 py-3">{{ asset.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ asset.category?.name || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                :style="statusStyle(asset.status)"
              >
                {{ asset.status?.name || '—' }}
              </span>
            </td>
            <td class="px-4 py-3">{{ asset.school?.name || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ formatCurrency(asset.purchaseCost) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ formatDate(asset.purchaseDate) }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <RouterLink
                :to="{ name: 'asset-detail', params: { id: asset.id } }"
                class="text-navy-800 hover:underline"
              >
                View
              </RouterLink>
              <RouterLink
                v-if="canEdit"
                :to="{ name: 'asset-edit', params: { id: asset.id } }"
                class="ml-3 text-navy-800 hover:underline"
              >
                Edit
              </RouterLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <p>{{ loading && assets.length ? 'Refreshing…' : rangeLabel }}</p>
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
