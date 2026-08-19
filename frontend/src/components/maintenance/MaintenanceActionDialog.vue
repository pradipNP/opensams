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

const confirmClass = computed(() => {
  if (props.action === 'reject') {
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
  <UiDialog
    :open="open"
    :title="title"
    description="Confirm this workflow action. It cannot be undone from this screen."
    :submitting="submitting"
    @close="emit('close')"
  >
    <Alert v-if="error" class="mt-3" :message="error" />

    <div class="mt-4 space-y-3">
      <div v-if="action === 'approve'">
        <label for="action-assigned" class="field-label">Assigned to</label>
        <input id="action-assigned" v-model="form.assignedTo" type="text" maxlength="200" class="field-control" />
      </div>

      <div v-if="action === 'reject'">
        <label for="action-reason" class="field-label field-required">Rejection reason</label>
        <textarea
          id="action-reason"
          v-model="form.rejectionReason"
          rows="3"
          maxlength="2000"
          class="field-control"
          :class="localError.rejectionReason ? 'field-invalid' : ''"
        />
        <p v-if="localError.rejectionReason" class="field-error">{{ localError.rejectionReason }}</p>
      </div>

      <div v-if="action === 'complete'">
        <label for="action-cost" class="field-label">Actual cost</label>
        <input
          id="action-cost"
          v-model="form.actualCost"
          type="number"
          min="0"
          step="0.01"
          class="field-control"
          :class="localError.actualCost ? 'field-invalid' : ''"
        />
        <p v-if="localError.actualCost" class="field-error">{{ localError.actualCost }}</p>
      </div>

      <div>
        <label for="action-notes" class="field-label">
          {{ action === 'complete' ? 'Completion notes' : 'Notes' }}
        </label>
        <textarea id="action-notes" v-model="form.notes" rows="3" class="field-control" />
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
