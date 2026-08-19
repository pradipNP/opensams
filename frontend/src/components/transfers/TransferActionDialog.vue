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
  notes: '',
  rejectionReason: '',
});
const localError = reactive({ rejectionReason: '' });

const title = computed(() => {
  if (props.action === 'reject') {
    return 'Reject transfer';
  }
  if (props.action === 'complete') {
    return 'Complete transfer';
  }
  if (props.action === 'cancel') {
    return 'Cancel transfer';
  }
  return 'Approve transfer';
});

const confirmLabel = computed(() => {
  if (props.action === 'reject') {
    return 'Confirm reject';
  }
  if (props.action === 'complete') {
    return 'Confirm complete';
  }
  if (props.action === 'cancel') {
    return 'Confirm cancel';
  }
  return 'Confirm approve';
});

watch(
  () => props.open,
  (open) => {
    if (open) {
      form.notes = '';
      form.rejectionReason = '';
      localError.rejectionReason = '';
    }
  }
);

function onConfirm() {
  localError.rejectionReason = '';
  if (props.action === 'reject' && !form.rejectionReason.trim()) {
    localError.rejectionReason = 'Rejection reason is required.';
    return;
  }

  const payload = {
    notes: form.notes.trim() || null,
  };
  if (props.action === 'reject') {
    payload.rejectionReason = form.rejectionReason.trim();
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
        <div v-if="action === 'reject'">
          <label for="transfer-rejection" class="mb-1 block text-sm font-medium text-slate-700">
            Rejection reason
          </label>
          <textarea
            id="transfer-rejection"
            v-model="form.rejectionReason"
            rows="3"
            maxlength="2000"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="localError.rejectionReason ? 'border-red-400' : ''"
          />
          <p v-if="localError.rejectionReason" class="mt-1 text-xs text-red-700">{{ localError.rejectionReason }}</p>
        </div>

        <div>
          <label for="transfer-action-notes" class="mb-1 block text-sm font-medium text-slate-700">Remarks</label>
          <textarea
            id="transfer-action-notes"
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
          Close
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
