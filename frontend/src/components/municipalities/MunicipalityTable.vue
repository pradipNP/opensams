<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { formatNumber } from '@/utils/format';

const props = defineProps({
  municipalities: { type: Array, default: () => [] },
  meta: { type: Object, default: () => ({ page: 1, limit: 20, total: 0, totalPages: 0 }) },
  loading: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
});

const emit = defineEmits(['page']);

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
</script>

<template>
  <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            <th class="px-4 py-3 whitespace-nowrap">Name</th>
            <th class="px-4 py-3 whitespace-nowrap">Code</th>
            <th class="px-4 py-3 whitespace-nowrap">District</th>
            <th class="px-4 py-3 whitespace-nowrap">Province</th>
            <th class="px-4 py-3 whitespace-nowrap">Schools Count</th>
            <th class="px-4 py-3 whitespace-nowrap">Active</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
          <tr v-if="loading && !municipalities.length">
            <td colspan="7" class="px-4 py-10 text-center text-slate-500">Loading municipalities…</td>
          </tr>
          <tr v-else-if="!municipalities.length">
            <td colspan="7" class="px-4 py-10 text-center text-slate-500">
              No municipalities match the current filters.
            </td>
          </tr>
          <tr v-for="municipality in municipalities" :key="municipality.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium text-navy-950">{{ municipality.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ municipality.code }}</td>
            <td class="px-4 py-3">{{ municipality.district }}</td>
            <td class="px-4 py-3">{{ municipality.provinceName || '—' }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ formatNumber(municipality.schoolCount) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <span
                class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium"
                :class="
                  municipality.isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                "
              >
                {{ municipality.isActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <RouterLink
                v-if="canWrite"
                :to="{ name: 'municipality-edit', params: { id: municipality.id } }"
                class="text-navy-800 hover:underline"
              >
                Edit
              </RouterLink>
              <span v-else class="text-slate-400">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <p>{{ loading && municipalities.length ? 'Refreshing…' : rangeLabel }}</p>
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
