<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import UiDialog from '@/components/ui/UiDialog.vue';
import AssetHistory from '@/components/assets/AssetHistory.vue';
import { deactivateAsset, getAsset, getAssetHistory } from '@/api/asset.api';
import { displayValue, errorMessage, formatCurrency, formatDate, formatDateTime, qrImageSrc } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

const loading = ref(true);
const error = ref('');
const asset = ref(null);
const banner = ref('');
const historyRecords = ref([]);
const historyLoading = ref(false);
const historyError = ref('');

const dialog = reactive({
  open: false,
  submitting: false,
  error: '',
});

const canWrite = computed(() => auth.hasPermission('assets:write'));
const canDeactivate = computed(
  () => canWrite.value && ['state_admin', 'school_admin'].includes(auth.role)
);

async function loadHistory(id) {
  historyLoading.value = true;
  historyError.value = '';
  try {
    const response = await getAssetHistory(id, { page: 1, limit: 100 });
    historyRecords.value = response.data || [];
  } catch (err) {
    historyError.value = errorMessage(err, 'Unable to load asset history.');
    historyRecords.value = [];
  } finally {
    historyLoading.value = false;
  }
}

async function loadAsset(id) {
  loading.value = true;
  error.value = '';
  asset.value = null;
  try {
    const response = await getAsset(id);
    asset.value = response.data || null;
    if (asset.value?.assetTag) {
      app.setPageTitle(asset.value.assetTag);
    }
    await loadHistory(id);
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this asset.');
  } finally {
    loading.value = false;
  }
}

function openDeactivate() {
  dialog.open = true;
  dialog.error = '';
}

function closeDeactivate() {
  if (dialog.submitting) {
    return;
  }
  dialog.open = false;
  dialog.error = '';
  dialog.submitting = false;
}

async function onConfirmDeactivate() {
  if (!asset.value || dialog.submitting) {
    return;
  }
  dialog.submitting = true;
  dialog.error = '';
  try {
    await deactivateAsset(asset.value.id);
    dialog.open = false;
    dialog.submitting = false;
    await router.push({ name: 'assets', query: { deactivated: '1' } });
  } catch (err) {
    dialog.error = errorMessage(err, 'Unable to deactivate this asset.');
    dialog.submitting = false;
  }
}

onMounted(() => {
  if (route.query.created === '1') {
    banner.value = 'Asset created successfully.';
  } else if (route.query.updated === '1') {
    banner.value = 'Asset updated successfully.';
  }
  if (route.query.created || route.query.updated) {
    router.replace({ name: 'asset-detail', params: { id: route.params.id } });
  }
  loadAsset(route.params.id);
});

watch(
  () => route.params.id,
  (id, previous) => {
    if (id && id !== previous) {
      banner.value = '';
      loadAsset(id);
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'assets' }" class="link-back">← Back to assets</RouterLink>
      <div v-if="asset" class="flex flex-wrap gap-2">
        <RouterLink
          v-if="canWrite"
          :to="{ name: 'asset-edit', params: { id: asset.id } }"
          class="btn btn-primary"
        >
          Edit asset
        </RouterLink>
        <button
          v-if="canDeactivate"
          type="button"
          class="btn btn-danger-outline"
          @click="openDeactivate"
        >
          Deactivate Asset
        </button>
      </div>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <ErrorRetry
      v-if="error"
      class="mb-4"
      :message="error"
      :loading="loading"
      @retry="loadAsset(route.params.id)"
    />

    <p v-if="loading" class="empty-panel">
      Loading asset…
    </p>
    <p
      v-else-if="!error && !asset"
      class="empty-panel"
    >
      Asset not found.
    </p>

    <div v-else-if="asset" class="space-y-4">
      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Basic information</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Asset Tag</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(asset.assetTag) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Name</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(asset.name) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Category</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(asset.category?.name) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Status</dt>
            <dd class="mt-1">
              <StatusBadge
                :status="asset.status?.slug"
                :label="asset.status?.name"
                :color="asset.status?.colorCode"
              />
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Description</dt>
            <dd class="mt-1 text-sm whitespace-pre-wrap text-navy-950">{{ displayValue(asset.notes) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Location</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Municipality</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(asset.municipality?.name) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">School</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(asset.school?.name) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Purchase information</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Cost</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatCurrency(asset.purchaseCost) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Date</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDate(asset.purchaseDate) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Vendor</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(asset.vendor) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Additional</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">QR Code</dt>
            <dd class="mt-2">
              <img
                v-if="asset.qrCode"
                :src="qrImageSrc(asset.qrCode)"
                alt="Asset QR code"
                class="h-40 w-40 rounded-md border border-slate-200 bg-white p-2"
              />
              <p v-else class="text-sm text-slate-500">No QR code available.</p>
              <p v-if="asset.qrCode" class="mt-2 text-xs break-all text-slate-500">{{ asset.qrCode }}</p>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Created At</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDateTime(asset.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Updated At</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDateTime(asset.updatedAt) }}</dd>
          </div>
        </dl>
      </section>

      <AssetHistory
        :records="historyRecords"
        :loading="historyLoading"
        :error="historyError"
        @retry="loadHistory(asset.id)"
      />
    </div>

    <UiDialog
      :open="dialog.open"
      title="Deactivate Asset?"
      description="Are you sure you want to deactivate this asset? This action will remove the asset from active operational records, but its historical records will be preserved."
      :submitting="dialog.submitting"
      @close="closeDeactivate"
    >
      <Alert v-if="dialog.error" class="mt-3" :message="dialog.error" />
      <template #actions>
        <button type="button" class="btn btn-secondary" :disabled="dialog.submitting" @click="closeDeactivate">
          Cancel
        </button>
        <button type="button" class="btn btn-danger" :disabled="dialog.submitting" @click="onConfirmDeactivate">
          {{ dialog.submitting ? 'Working…' : 'Deactivate Asset' }}
        </button>
      </template>
    </UiDialog>
  </div>
</template>
