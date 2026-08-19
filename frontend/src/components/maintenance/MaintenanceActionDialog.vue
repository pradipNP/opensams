<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  action: { type: String, default: 'approve' },
  submitting: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['close', 'confirm']);

const form = reactive({
  assignedTo: '',
  notes: '',
  rejectionReason: '',
  actualCost: '',
});
const localError = reactive({ rejectionReason: '', actualCost: '' });

const title = computed(() => {
  if (props.action === 'reject') {
    return 'Reject request';
  }
  if (props.action === 'complete') {
    return 'Complete request';
  }
  return 'Approve request';
});

const confirmLabel = computed(() => {
  if (props.action === 'reject') {
    return 'Confirm reject';
  }
  if (props.action === 'complete') {
    return 'Confirm complete';
  }
  return 'Confirm approve';
});

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.assignedTo = '';
      form.notes = '';
      form.rejectionReason = '';
      form.actualCost = '';
      localError.rejectionReason = '';
      localError.actualCost = '';
    }
  }
);

function onConfirm() {
  localError.rejectionReason = '';
  localError.actualCost = '';

  if (props.action === 'reject' && !form.rejectionReason.trim()) {
    localError.rejectionReason = 'Rejection reason is required.';
    return;
  }

  if (props.action === 'complete' && form.actualCost !== '') {
    const cost = Number(form.actualCost);
    if (Number.isNaN(cost) || cost < 0) {
      localError.actualCost = 'Actual cost must be 0 or greater.';
      return;
    }
  }

  const payload = {};
  if (props.action === 'approve') {
    if (form.assignedTo.trim()) {
      payload.assignedTo = form.assignedTo.trim();
    }
    if (form.notes.trim()) {
      payload.notes = form.notes.trim();
    }
  } else if (props.action === 'reject') {
    payload.rejectionReason = form.rejectionReason.trim();
    payload.notes = form.notes.trim() || null;
  } else {
    payload.notes = form.notes.trim() || null;
    if (form.actualCost !== '') {
      payload.actualCost = Number(form.actualCost);
    }
  }

  emit('confirm', payload);
}
</script>

<template>
  <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
    <div class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-lg">
      <h3 class="text-lg font-semibold text-navy-950">{{ title }}</h3>
      <p class="mt-1 text-sm text-slate-600">Confirm this workflow action. It cannot be undone from this screen.</p>

      <p v-if="error" class="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
        {{ error }}
      </p>

      <div class="mt-4 space-y-3">
        <div v-if="action === 'approve'">
          <label for="action-assigned" class="mb-1 block text-sm font-medium text-slate-700">Assigned to</label>
          <input
            id="action-assigned"
            v-model="form.assignedTo"
            type="text"
            maxlength="200"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          />
        </div>

        <div v-if="action === 'reject'">
          <label for="action-reason" class="mb-1 block text-sm font-medium text-slate-700">Rejection reason</label>
          <textarea
            id="action-reason"
            v-model="form.rejectionReason"
            rows="3"
            maxlength="2000"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="localError.rejectionReason ? 'border-red-400' : ''"
          />
          <p v-if="localError.rejectionReason" class="mt-1 text-xs text-red-700">{{ localError.rejectionReason }}</p>
        </div>

        <div v-if="action === 'complete'">
          <label for="action-cost" class="mb-1 block text-sm font-medium text-slate-700">Actual cost</label>
          <input
            id="action-cost"
            v-model="form.actualCost"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="localError.actualCost ? 'border-red-400' : ''"
          />
          <p v-if="localError.actualCost" class="mt-1 text-xs text-red-700">{{ localError.actualCost }}</p>
        </div>

        <div>
          <label for="action-notes" class="mb-1 block text-sm font-medium text-slate-700">
            {{ action === 'complete' ? 'Completion notes' : 'Notes' }}
          </label>
          <textarea
            id="action-notes"
            v-model="form.notes"
            rows="3"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          />
        </div>
      </div>

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
          class="rounded-md bg-navy-900 px-3 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="submitting"
          @click="onConfirm"
        >
          {{ submitting ? 'Working…' : confirmLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
