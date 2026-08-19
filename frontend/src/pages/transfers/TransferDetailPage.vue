<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import TransferTimeline from '@/components/transfers/TransferTimeline.vue';
import TransferActionDialog from '@/components/transfers/TransferActionDialog.vue';
import {
  approveTransfer,
  cancelTransfer,
  completeTransfer,
  getTransfer,
  rejectTransfer,
} from '@/api/transfer.api';
import { displayValue, errorMessage, formatDateTime } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

const loading = ref(true);
const error = ref('');
const transfer = ref(null);
const banner = ref('');

const dialog = reactive({
  open: false,
  action: 'approve',
  submitting: false,
  error: '',
});

const canApprove = computed(() => auth.hasPermission('transfers:approve'));
const canCancel = computed(() => auth.hasPermission('transfers:request'));
const canApproveNow = computed(() => canApprove.value && transfer.value?.status === 'pending');
const canRejectNow = computed(() => canApprove.value && transfer.value?.status === 'pending');
const canCompleteNow = computed(() => canApprove.value && transfer.value?.status === 'approved');
const canCancelNow = computed(
  () => canCancel.value && ['draft', 'pending'].includes(transfer.value?.status)
);

async function loadTransfer(id) {
  loading.value = true;
  error.value = '';
  transfer.value = null;
  try {
    const response = await getTransfer(id);
    transfer.value = response.data || null;
    if (transfer.value?.id) {
      app.setPageTitle('Transfer details');
    }
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this transfer.');
  } finally {
    loading.value = false;
  }
}

function openDialog(action) {
  dialog.open = true;
  dialog.action = action;
  dialog.error = '';
}

function closeDialog() {
  dialog.open = false;
  dialog.error = '';
  dialog.submitting = false;
}

async function onConfirm(payload) {
  if (!transfer.value) {
    return;
  }
  dialog.submitting = true;
  dialog.error = '';
  try {
    let response;
    if (dialog.action === 'approve') {
      response = await approveTransfer(transfer.value.id, payload);
      banner.value = 'Transfer approved.';
    } else if (dialog.action === 'reject') {
      response = await rejectTransfer(transfer.value.id, payload);
      banner.value = 'Transfer rejected.';
    } else if (dialog.action === 'complete') {
      response = await completeTransfer(transfer.value.id, payload);
      banner.value = 'Transfer completed.';
    } else {
      response = await cancelTransfer(transfer.value.id, payload);
      banner.value = 'Transfer cancelled.';
    }
    transfer.value = response.data || transfer.value;
    closeDialog();
    try {
      const refreshed = await getTransfer(transfer.value.id);
      transfer.value = refreshed.data || transfer.value;
    } catch {
      // Keep the workflow payload if the follow-up fetch fails.
    }
  } catch (err) {
    dialog.error = errorMessage(err, 'Unable to update this transfer.');
    dialog.submitting = false;
  }
}

onMounted(() => {
  if (route.query.created === '1') {
    banner.value = 'Transfer request created successfully.';
    router.replace({ name: 'transfer-detail', params: { id: route.params.id } });
  }
  loadTransfer(route.params.id);
});

watch(
  () => route.params.id,
  (id, previous) => {
    if (id && id !== previous) {
      banner.value = '';
      loadTransfer(id);
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'transfers' }" class="link-back">
        ← Back to transfers
      </RouterLink>
      <div v-if="transfer" class="flex flex-wrap gap-2">
        <button
          v-if="canApproveNow"
          type="button"
          class="btn btn-success"
          @click="openDialog('approve')"
        >
          Approve
        </button>
        <button
          v-if="canRejectNow"
          type="button"
          class="btn btn-danger-outline"
          @click="openDialog('reject')"
        >
          Reject
        </button>
        <button
          v-if="canCompleteNow"
          type="button"
          class="btn btn-primary"
          @click="openDialog('complete')"
        >
          Complete
        </button>
        <button
          v-if="canCancelNow"
          type="button"
          class="btn btn-danger-outline"
          @click="openDialog('cancel')"
        >
          Cancel
        </button>
      </div>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <ErrorRetry
      v-if="error"
      class="mb-4"
      :message="error"
      :loading="loading"
      @retry="loadTransfer(route.params.id)"
    />

    <p v-if="loading" class="empty-panel">
      Loading transfer…
    </p>
    <p
      v-else-if="!error && !transfer"
      class="empty-panel"
    >
      Transfer not found.
    </p>

    <div v-else-if="transfer" class="space-y-4">
      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Transfer information</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Transfer ID</dt>
            <dd class="mt-1 text-sm break-all text-navy-950">{{ displayValue(transfer.id) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Asset</dt>
            <dd class="mt-1 text-sm text-navy-950">
              <RouterLink
                v-if="transfer.asset?.id"
                :to="{ name: 'asset-detail', params: { id: transfer.asset.id } }"
                class="link-action"
              >
                {{ transfer.asset.assetTag }} — {{ transfer.asset.name }}
              </RouterLink>
              <span v-else>{{ displayValue(transfer.asset?.name) }}</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Status</dt>
            <dd class="mt-1">
              <StatusBadge :status="transfer.status" />
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Requested Date</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDateTime(transfer.requestedAt) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Origin</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Municipality</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(transfer.fromSchool?.municipality?.name) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">School</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(transfer.fromSchool?.name) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Destination</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Municipality</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(transfer.toSchool?.municipality?.name) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">School</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(transfer.toSchool?.name) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Workflow</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Requested By</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(transfer.requestedBy?.fullName) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Approved By</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(transfer.approvedBy?.fullName) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Completed By</dt>
            <dd class="mt-1 text-sm text-navy-950">—</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Notes</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Reason</dt>
            <dd class="mt-1 text-sm whitespace-pre-wrap text-navy-950">{{ displayValue(transfer.reason) }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Remarks</dt>
            <dd class="mt-1 text-sm whitespace-pre-wrap text-navy-950">{{ displayValue(transfer.notes) }}</dd>
          </div>
        </dl>
      </section>

      <TransferTimeline :transfer="transfer" />
    </div>

    <TransferActionDialog
      :open="dialog.open"
      :action="dialog.action"
      :submitting="dialog.submitting"
      :error="dialog.error"
      @close="closeDialog"
      @confirm="onConfirm"
    />
  </div>
</template>
