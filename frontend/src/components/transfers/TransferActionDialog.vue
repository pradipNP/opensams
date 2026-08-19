<script setup>
import { computed, reactive, watch } from 'vue';
import Alert from '@/components/ui/Alert.vue';
import UiDialog from '@/components/ui/UiDialog.vue';

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

const confirmClass = computed(() => {
  if (props.action === 'reject' || props.action === 'cancel') {
    return 'btn btn-danger';
  }
  if (props.action === 'complete') {
    return 'btn btn-primary';
  }
  return 'btn btn-success';
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
  <UiDialog
    :open="open"
    :title="title"
    description="Confirm this workflow action. It cannot be undone from this screen."
    :submitting="submitting"
    @close="emit('close')"
  >
    <Alert v-if="error" class="mt-3" :message="error" />

    <div class="mt-4 space-y-3">
      <div v-if="action === 'reject'">
        <label for="transfer-rejection" class="field-label field-required">Rejection reason</label>
        <textarea
          id="transfer-rejection"
          v-model="form.rejectionReason"
          rows="3"
          maxlength="2000"
          class="field-control"
          :class="localError.rejectionReason ? 'field-invalid' : ''"
        />
        <p v-if="localError.rejectionReason" class="field-error">{{ localError.rejectionReason }}</p>
      </div>

      <div>
        <label for="transfer-action-notes" class="field-label">Remarks</label>
        <textarea id="transfer-action-notes" v-model="form.notes" rows="3" class="field-control" />
      </div>
    </div>

    <template #actions>
      <button type="button" class="btn btn-secondary" :disabled="submitting" @click="emit('close')">Cancel</button>
      <button type="button" :class="confirmClass" :disabled="submitting" @click="onConfirm">
        {{ submitting ? 'Working…' : confirmLabel }}
      </button>
    </template>
  </UiDialog>
</template>
