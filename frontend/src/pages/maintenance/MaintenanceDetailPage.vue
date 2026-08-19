<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import MaintenanceTimeline from '@/components/maintenance/MaintenanceTimeline.vue';
import MaintenanceActionDialog from '@/components/maintenance/MaintenanceActionDialog.vue';
import {
  approveMaintenance,
  completeMaintenance,
  getMaintenance,
  rejectMaintenance,
} from '@/api/maintenance.api';
import { displayValue, errorMessage, formatAction, formatCurrency, formatDateTime } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

const loading = ref(true);
const error = ref('');
const request = ref(null);
const banner = ref('');

const dialog = reactive({
  open: false,
  action: 'approve',
  submitting: false,
  error: '',
});

const canApprove = computed(() => auth.hasPermission('maintenance:approve'));
const canApproveNow = computed(() => canApprove.value && request.value?.status === 'pending');
const canRejectNow = computed(
  () => canApprove.value && ['pending', 'approved', 'in_progress'].includes(request.value?.status)
);
const canCompleteNow = computed(
  () => canApprove.value && ['approved', 'in_progress'].includes(request.value?.status)
);

function statusClass(status) {
  if (status === 'completed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (status === 'rejected' || status === 'cancelled') {
    return 'border-red-200 bg-red-50 text-red-800';
  }
  if (status === 'approved' || status === 'in_progress') {
    return 'border-sky-200 bg-sky-50 text-sky-800';
  }
  return 'border-amber-200 bg-amber-50 text-amber-800';
}

async function loadRequest(id) {
  loading.value = true;
  error.value = '';
  request.value = null;
  try {
    const response = await getMaintenance(id);
    request.value = response.data || null;
    if (request.value?.id) {
      app.setPageTitle('Maintenance request');
    }
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this maintenance request.');
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
  if (!request.value) {
    return;
  }
  dialog.submitting = true;
  dialog.error = '';
  try {
    let response;
    if (dialog.action === 'approve') {
      response = await approveMaintenance(request.value.id, payload);
      banner.value = 'Request approved.';
    } else if (dialog.action === 'reject') {
      response = await rejectMaintenance(request.value.id, payload);
      banner.value = 'Request rejected.';
    } else {
      response = await completeMaintenance(request.value.id, payload);
      banner.value = 'Request completed.';
    }
    request.value = response.data || request.value;
    closeDialog();
    try {
      const refreshed = await getMaintenance(request.value.id);
      request.value = refreshed.data || request.value;
    } catch {
      // Keep the workflow payload if the follow-up fetch fails.
    }
  } catch (err) {
    dialog.error = errorMessage(err, 'Unable to update this request.');
    dialog.submitting = false;
  }
}

onMounted(() => {
  if (route.query.created === '1') {
    banner.value = 'Maintenance request created successfully.';
    router.replace({ name: 'maintenance-detail', params: { id: route.params.id } });
  }
  loadRequest(route.params.id);
});

watch(
  () => route.params.id,
  (id, previous) => {
    if (id && id !== previous) {
      banner.value = '';
      loadRequest(id);
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'maintenance' }" class="text-sm text-navy-800 hover:underline">
        ← Back to maintenance
      </RouterLink>
      <div v-if="request" class="flex flex-wrap gap-2">
        <button
          v-if="canApproveNow"
          type="button"
          class="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
          @click="openDialog('approve')"
        >
          Approve
        </button>
        <button
          v-if="canRejectNow"
          type="button"
          class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          @click="openDialog('reject')"
        >
          Reject
        </button>
        <button
          v-if="canCompleteNow"
          type="button"
          class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          @click="openDialog('complete')"
        >
          Complete
        </button>
      </div>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Loading request…
    </p>
    <p
      v-else-if="!error && !request"
      class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
    >
      Maintenance request not found.
    </p>

    <div v-else-if="request" class="space-y-4">
      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Request information</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Request ID</dt>
            <dd class="mt-1 text-sm break-all text-navy-950">{{ displayValue(request.id) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Asset</dt>
            <dd class="mt-1 text-sm text-navy-950">
              <RouterLink
                v-if="request.asset?.id"
                :to="{ name: 'asset-detail', params: { id: request.asset.id } }"
                class="text-navy-800 hover:underline"
              >
                {{ request.asset.assetTag }} — {{ request.asset.name }}
              </RouterLink>
              <span v-else>{{ displayValue(request.asset?.name) }}</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">School</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(request.school?.name) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Requested By</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(request.requestedBy?.fullName) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Status</dt>
            <dd class="mt-1">
              <span
                class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium"
                :class="statusClass(request.status)"
              >
                {{ formatAction(request.status) }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Request Date</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDateTime(request.requestedAt) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Maintenance details</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Problem Description</dt>
            <dd class="mt-1 text-sm whitespace-pre-wrap text-navy-950">{{ displayValue(request.description) }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Notes</dt>
            <dd class="mt-1 text-sm whitespace-pre-wrap text-navy-950">{{ displayValue(request.notes) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Estimated Cost</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatCurrency(request.estimatedCost) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Completion Notes</dt>
            <dd class="mt-1 text-sm whitespace-pre-wrap text-navy-950">
              {{ request.status === 'completed' ? displayValue(request.notes) : '—' }}
            </dd>
          </div>
        </dl>
      </section>

      <MaintenanceTimeline :request="request" />
    </div>

    <MaintenanceActionDialog
      :open="dialog.open"
      :action="dialog.action"
      :submitting="dialog.submitting"
      :error="dialog.error"
      @close="closeDialog"
      @confirm="onConfirm"
    />
  </div>
</template>
