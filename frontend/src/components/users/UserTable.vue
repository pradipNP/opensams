<script setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import StatusBadge from '@/components/ui/StatusBadge.vue';

const props = defineProps({
  users: { type: Array, default: () => [] },
  meta: { type: Object, default: () => ({ page: 1, limit: 20, total: 0, totalPages: 0 }) },
  loading: { type: Boolean, default: false },
  canWrite: { type: Boolean, default: false },
  currentUserId: { type: String, default: '' },
  municipalityNames: { type: Object, default: () => ({}) },
  schoolNames: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['page', 'deactivate']);

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

function municipalityName(user) {
  if (!user.municipalityId) {
    return '—';
  }
  return props.municipalityNames[user.municipalityId] || '—';
}

function schoolName(user) {
  if (!user.schoolId) {
    return '—';
  }
  return props.schoolNames[user.schoolId] || '—';
}

function canDeactivate(user) {
  return props.canWrite && user.isActive && user.id !== props.currentUserId;
}
</script>

<template>
  <section class="table-shell">
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-slate-200 text-sm">
        <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
          <tr>
            <th class="px-4 py-3 whitespace-nowrap">Full Name</th>
            <th class="px-4 py-3 whitespace-nowrap">Email</th>
            <th class="px-4 py-3 whitespace-nowrap">Role</th>
            <th class="px-4 py-3 whitespace-nowrap">Municipality</th>
            <th class="px-4 py-3 whitespace-nowrap">School</th>
            <th class="px-4 py-3 whitespace-nowrap">Active</th>
            <th class="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
          <tr v-if="loading && !users.length">
            <td colspan="7" class="px-4 py-10 text-center text-slate-500">Loading users…</td>
          </tr>
          <tr v-else-if="!users.length">
            <td colspan="7" class="px-4 py-10 text-center text-slate-500">No users match the current filters.</td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="hover:bg-slate-50">
            <td class="px-4 py-3 font-medium text-navy-950">{{ user.fullName }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ user.email }}</td>
            <td class="px-4 py-3 whitespace-nowrap">{{ user.roleName || user.role }}</td>
            <td class="px-4 py-3">{{ municipalityName(user) }}</td>
            <td class="px-4 py-3">{{ schoolName(user) }}</td>
            <td class="px-4 py-3 whitespace-nowrap">
              <StatusBadge :active="user.isActive" />
            </td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
              <RouterLink :to="{ name: 'user-detail', params: { id: user.id } }" class="link-action">
                View
              </RouterLink>
              <RouterLink
                v-if="canWrite"
                :to="{ name: 'user-edit', params: { id: user.id } }"
                class="link-action ml-3"
              >
                Edit
              </RouterLink>
              <button
                v-if="canDeactivate(user)"
                type="button"
                class="link-action link-action-danger ml-3"
                @click="emit('deactivate', user)"
              >
                Deactivate
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
      <p>{{ loading && users.length ? 'Refreshing…' : rangeLabel }}</p>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="loading || (meta.page || 1) <= 1"
          @click="emit('page', (meta.page || 1) - 1)"
        >
          Previous
        </button>
        <span>Page {{ meta.page || 1 }} of {{ meta.totalPages || 1 }}</span>
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          :disabled="loading || (meta.page || 1) >= (meta.totalPages || 1)"
          @click="emit('page', (meta.page || 1) + 1)"
        >
          Next
        </button>
      </div>
    </div>
  </section>
</template>
