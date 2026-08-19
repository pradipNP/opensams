<script setup>
import { computed } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['close', 'confirm']);

const displayName = computed(() => props.user?.fullName || props.user?.email || 'this user');
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
    <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
      <h3 class="text-lg font-semibold text-navy-950">Deactivate user</h3>
      <p class="mt-1 text-sm text-slate-600">
        Deactivate <span class="font-medium text-navy-950">{{ displayName }}</span>? They will no longer be able to
        sign in. You can reactivate the account later from Edit user.
      </p>

      <p v-if="error" class="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {{ error }}
      </p>

      <div class="mt-5 flex justify-end gap-2">
        <button
          type="button"
          class="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
          :disabled="submitting"
          @click="emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          class="rounded-md bg-red-700 px-3 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting"
          @click="emit('confirm')"
        >
          {{ submitting ? 'Working…' : 'Deactivate' }}
        </button>
      </div>
    </div>
  </div>
</template>
