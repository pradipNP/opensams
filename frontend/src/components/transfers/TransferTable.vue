<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatAction, formatDateTime, shortId } from '@/utils/format';

const props = defineProps({
  transfers: { type: Array, default: () => [] },
  meta: { type: Object, default: () => ({ page: 1, limit: 20, total: 0, totalPages: 0 }) },
  sort: { type: String, default: '' },
  order: { type: String, default: 'desc' },
  loading: { type: Boolean, default: false },
  canApprove: { type: Boolean, default: false },
  canCancel: { type: Boolean, default: false },
});

const emit = defineEmits(['sort', 'page', 'approve', 'reject', 'complete', 'cancel']);

const columns = [
  { key: 'id', label: 'Transfer ID' },
  { key: 'assetTag', label: 'Asset Tag' },
  { key: 'assetName', label: 'Asset Name' },
  { key: 'fromSchool', label: 'From School' },
  { key: 'toSchool', label: 'To School' },
  { key: 'requestedBy', label: 'Requested By' },
  { key: 'status', label: 'Status' },
  { key: 'requestedAt', label: 'Requested Date' },
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
  if (props.sort === column) {
    emit('sort', { sort: column, order: props.order === 'asc' ? 'desc' : 'asc' });
    return;
  }
  emit('sort', { sort: column, order: 'desc' });
}

function statusClass(status) {
  if (status === 'completed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (status === 'rejected' || status === 'cancelled') {
    return 'border-red-200 bg-red-50 text-red-800';
  }
  if (status === 'approved') {
    return 'border-sky-200 bg-sky-50 text-sky-800';
  }
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

function canApproveRow(row) {
  return props.canApprove && row.status === 'pending';
}

function canRejectRow(row) {
  return props.canApprove && row.status === 'pending';
}

function canCompleteRow(row) {
  return props.canApprove && row.status === 'approved';
}

function canCancelRow(row) {
  return props.canCancel && ['draft', 'pending'].includes(row.status);
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
              class="cursor-pointer px-4 py-3 whitespace-nowrap select-none hover:text-navy-950"
              @click="onSort(column.key)"
            >
              {{ column.label }}{{ sortIndicator(column.key) }}
            </th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
          <tr v-if="loading && !transfers.length">
            <td colspan="9" class="px-4 py-10 text-center text-slate-500">Loading transfers…</td>
          </tr>
          <tr v-else-if="!transfers.length">
            <td colspan="9" class="px-4 py-10 text-center text-slate-500">No transfers match the current filters.</td>
          </tr>
          <tr v-for="item in transfers" :key="item.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium whitespace-nowrap text-navy-950" :title="item.id">
              {{ shortId(item.id) }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap">{{ item.asset?.assetTag || '—' }}</td>
            <td class="px-4 py-3">{{ item.asset?.name || '—' }}</td>
            <td class="px-4 py-3">{{ item.fromSchool?.name || '—' }}</td>
            <td class="px-4 py-3">{{ item.toSchool?.name || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ item.requestedBy?.fullName || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium"
                :class="statusClass(item.status)"
              >
                {{ formatAction(item.status) }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap">{{ formatDateTime(item.requestedAt) }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <RouterLink
                :to="{ name: 'transfer-detail', params: { id: item.id } }"
                class="text-navy-800 hover:underline"
              >
                View
              </RouterLink>
              <button
                v-if="canApproveRow(item)"
                type="button"
                class="ml-3 text-navy-800 hover:underline"
                @click="emit('approve', item)"
              >
                Approve
              </button>
              <button
                v-if="canRejectRow(item)"
                type="button"
                class="ml-3 text-navy-800 hover:underline"
                @click="emit('reject', item)"
              >
                Reject
              </button>
              <button
                v-if="canCompleteRow(item)"
                type="button"
                class="ml-3 text-navy-800 hover:underline"
                @click="emit('complete', item)"
              >
                Complete
              </button>
              <button
                v-if="canCancelRow(item)"
                type="button"
                class="ml-3 text-navy-800 hover:underline"
                @click="emit('cancel', item)"
              >
                Cancel
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <p>{{ loading && transfers.length ? 'Refreshing…' : rangeLabel }}</p>
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
