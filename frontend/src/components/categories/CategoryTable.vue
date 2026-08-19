<script setup>
import { RouterLink } from 'vue-router';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import { formatNumber } from '@/utils/format';

defineProps({
  categories: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
});
</script>

<template>
  <section class="table-shell">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            <th class="px-4 py-3 whitespace-nowrap">Name</th>
            <th class="px-4 py-3 whitespace-nowrap">Department</th>
            <th class="px-4 py-3 text-right whitespace-nowrap">Asset Count</th>
            <th class="px-4 py-3 whitespace-nowrap">Active</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
          <tr v-if="loading && !categories.length">
            <td colspan="5" class="px-4 py-10 text-center text-slate-500">Loading categories…</td>
          </tr>
          <tr v-else-if="!categories.length">
            <td colspan="5" class="px-4 py-10 text-center text-slate-500">
              No categories match the current filters.
            </td>
          </tr>
          <tr v-for="category in categories" :key="category.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium text-navy-950">{{ category.name }}</td>
            <td class="px-4 py-3">{{ category.department || '—' }}</td>
            <td class="px-4 py-3 text-right whitespace-nowrap">{{ formatNumber(category.assetCount) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <StatusBadge :active="category.isActive" />
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <RouterLink
                v-if="canWrite"
                :to="{ name: 'category-edit', params: { id: category.id } }"
                class="link-action"
              >
                Edit
              </RouterLink>
              <span v-else class="text-slate-400">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      {{ loading && categories.length ? 'Refreshing…' : `${categories.length} result${categories.length === 1 ? '' : 's'}` }}
    </div>
  </section>
</template>
