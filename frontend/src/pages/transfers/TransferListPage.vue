<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import TransferFilters from '@/components/transfers/TransferFilters.vue';
import TransferTable from '@/components/transfers/TransferTable.vue';
import TransferActionDialog from '@/components/transfers/TransferActionDialog.vue';
import {
  approveTransfer,
  cancelTransfer,
  completeTransfer,
  listTransfers,
  rejectTransfer,
} from '@/api/transfer.api';
import { listMunicipalities, listSchools } from '@/api/lookup.api';
import { errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const banner = ref('');
const transfers = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);
const limit = ref(20);
const sort = ref('');
const order = ref('desc');
const municipalities = ref([]);
const schools = ref([]);
const lookupsReady = ref(false);

const filters = reactive({
  search: '',
  status: '',
  municipalityId: '',
  schoolId: '',
});

const dialog = reactive({
  open: false,
  action: 'approve',
  target: null,
  submitting: false,
  error: '',
});

const canRequest = computed(() => auth.hasPermission('transfers:request'));
const canApprove = computed(() => auth.hasPermission('transfers:approve'));
const showMunicipality = computed(() => auth.role === 'state_admin');
const showSchool = computed(() => auth.role !== 'school_admin');

const displayed = computed(() => {
  const rows = [...transfers.value];
  if (!sort.value) {
    return rows;
  }
  const direction = order.value === 'asc' ? 1 : -1;
  return rows.sort((left, right) => {
    const a = sortValue(left, sort.value);
    const b = sortValue(right, sort.value);
    if (a < b) {
      return -1 * direction;
    }
    if (a > b) {
      return 1 * direction;
    }
    return 0;
  });
});

function sortValue(row, key) {
  if (key === 'id') {
    return String(row.id || '');
  }
  if (key === 'assetTag') {
    return String(row.asset?.assetTag || '').toLowerCase();
  }
  if (key === 'assetName') {
    return String(row.asset?.name || '').toLowerCase();
  }
  if (key === 'fromSchool') {
    return String(row.fromSchool?.name || '').toLowerCase();
  }
  if (key === 'toSchool') {
    return String(row.toSchool?.name || '').toLowerCase();
  }
  if (key === 'requestedBy') {
    return String(row.requestedBy?.fullName || '').toLowerCase();
  }
  if (key === 'status') {
    return String(row.status || '');
  }
  return String(row.requestedAt || '');
}

function listParams() {
  const params = {
    page: page.value,
    limit: limit.value,
  };
  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.status) {
    params.status = filters.status;
  }
  if (filters.municipalityId) {
    params.municipalityId = filters.municipalityId;
  }
  if (filters.schoolId) {
    params.schoolId = filters.schoolId;
  }
  return params;
}

async function loadSchools() {
  if (!showSchool.value) {
    schools.value = [];
    return;
  }
  try {
    const params = { page: 1, limit: 100 };
    if (filters.municipalityId) {
      params.municipalityId = filters.municipalityId;
    }
    const response = await listSchools(params);
    schools.value = response.data || [];
  } catch {
    schools.value = [];
  }
}

async function loadLookups() {
  const tasks = [loadSchools()];
  if (showMunicipality.value) {
    tasks.push(
      listMunicipalities({ page: 1, limit: 100 })
        .then((response) => {
          municipalities.value = response.data || [];
        })
        .catch(() => {
          municipalities.value = [];
        })
    );
  }
  await Promise.all(tasks);
}

async function loadTransfers() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listTransfers(listParams());
    transfers.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: limit.value, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load transfers.');
    transfers.value = [];
    meta.value = { page: 1, limit: limit.value, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

function onFiltersChange() {
  page.value = 1;
  loadTransfers();
}

function clearFilters() {
  filters.search = '';
  filters.status = '';
  filters.municipalityId = '';
  filters.schoolId = '';
  page.value = 1;
  loadTransfers();
}

function onSort({ sort: nextSort, order: nextOrder }) {
  sort.value = nextSort;
  order.value = nextOrder;
}

function onPage(nextPage) {
  page.value = nextPage;
  loadTransfers();
}

function openDialog(action, item) {
  dialog.open = true;
  dialog.action = action;
  dialog.target = item;
  dialog.error = '';
}

function closeDialog() {
  dialog.open = false;
  dialog.target = null;
  dialog.error = '';
  dialog.submitting = false;
}

async function onConfirm(payload) {
  if (!dialog.target) {
    return;
  }
  dialog.submitting = true;
  dialog.error = '';
  try {
    if (dialog.action === 'approve') {
      await approveTransfer(dialog.target.id, payload);
      banner.value = 'Transfer approved.';
    } else if (dialog.action === 'reject') {
      await rejectTransfer(dialog.target.id, payload);
      banner.value = 'Transfer rejected.';
    } else if (dialog.action === 'complete') {
      await completeTransfer(dialog.target.id, payload);
      banner.value = 'Transfer completed.';
    } else {
      await cancelTransfer(dialog.target.id, payload);
      banner.value = 'Transfer cancelled.';
    }
    closeDialog();
    await loadTransfers();
  } catch (err) {
    dialog.error = errorMessage(err, 'Unable to update this transfer.');
    dialog.submitting = false;
  }
}

watch(
  () => filters.municipalityId,
  async () => {
    if (!lookupsReady.value) {
      return;
    }
    await loadSchools();
  }
);

onMounted(async () => {
  await loadLookups();
  lookupsReady.value = true;
  await loadTransfers();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">Asset transfers for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).</p>
      <RouterLink
        v-if="canRequest"
        :to="{ name: 'transfer-create' }"
        class="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
      >
        Create transfer
      </RouterLink>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <Alert v-if="error" class="mb-4" :message="error" />

    <TransferFilters
      v-model:search="filters.search"
      v-model:status="filters.status"
      v-model:municipality-id="filters.municipalityId"
      v-model:school-id="filters.schoolId"
      class="mb-4"
      :municipalities="municipalities"
      :schools="schools"
      :show-municipality="showMunicipality"
      :show-school="showSchool"
      @change="onFiltersChange"
      @clear="clearFilters"
    />

    <TransferTable
      :transfers="displayed"
      :meta="meta"
      :sort="sort"
      :order="order"
      :loading="loading"
      :can-approve="canApprove"
      :can-cancel="canRequest"
      @sort="onSort"
      @page="onPage"
      @approve="openDialog('approve', $event)"
      @reject="openDialog('reject', $event)"
      @complete="openDialog('complete', $event)"
      @cancel="openDialog('cancel', $event)"
    />

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
