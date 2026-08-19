<script setup>
import { formatAction, formatDateTime, displayValue } from '@/utils/format';

defineProps({
  records: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
});
</script>

<template>
  <section class="section-card p-6">
    <h2 class="text-lg font-semibold text-navy-950">History</h2>

    <p v-if="loading" class="mt-4 text-sm text-slate-500">Loading history…</p>
    <p v-else-if="error" class="mt-4 text-sm text-red-700">{{ error }}</p>
    <p v-else-if="!records.length" class="mt-4 text-sm text-slate-500">No history records yet.</p>

    <div v-else class="mt-4 overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            <th class="px-3 py-2">Action</th>
            <th class="px-3 py-2">User</th>
            <th class="px-3 py-2">Timestamp</th>
            <th class="px-3 py-2">Notes</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="item in records" :key="item.id" class="hover:bg-slate-50">
            <td class="px-3 py-2 align-top">
              <p class="font-medium text-navy-950">{{ formatAction(item.action) }}</p>
              <p v-if="item.fieldName" class="mt-0.5 text-xs text-slate-500">
                {{ item.fieldName }}: {{ displayValue(item.oldValue) }} → {{ displayValue(item.newValue) }}
              </p>
            </td>
            <td class="px-3 py-2 align-top whitespace-nowrap">{{ item.changedBy?.fullName || '—' }}</td>
            <td class="px-3 py-2 align-top whitespace-nowrap">{{ formatDateTime(item.createdAt) }}</td>
            <td class="px-3 py-2 align-top text-slate-600">{{ displayValue(item.notes) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
