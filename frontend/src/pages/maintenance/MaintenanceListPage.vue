<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import MaintenanceFilters from '@/components/maintenance/MaintenanceFilters.vue';
import MaintenanceTable from '@/components/maintenance/MaintenanceTable.vue';
import MaintenanceActionDialog from '@/components/maintenance/MaintenanceActionDialog.vue';
import {
  approveMaintenance,
  completeMaintenance,
  listMaintenance,
  rejectMaintenance,
} from '@/api/maintenance.api';
import { listSchools } from '@/api/lookup.api';
import { errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const banner = ref('');
const requests = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);
const limit = ref(20);
const sort = ref('');
const order = ref('desc');
const schools = ref([]);

const filters = reactive({
  search: '',
  status: '',
  schoolId: '',
});

const dialog = reactive({
  open: false,
  action: 'approve',
  target: null,
  submitting: false,
  error: '',
});

const canRequest = computed(() => auth.hasPermission('maintenance:request'));
const canApprove = computed(() => auth.hasPermission('maintenance:approve'));
const showSchool = computed(() => auth.role !== 'school_admin');

const displayed = computed(() => {
  const rows = [...requests.value];
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
  if (key === 'school') {
    return String(row.school?.name || '').toLowerCase();
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
    const response = await listSchools({ page: 1, limit: 100 });
    schools.value = response.data || [];
  } catch {
    schools.value = [];
  }
}

async function loadRequests() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listMaintenance(listParams());
    requests.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: limit.value, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load maintenance requests.');
    requests.value = [];
    meta.value = { page: 1, limit: limit.value, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

function onFiltersChange() {
  page.value = 1;
  loadRequests();
}

function clearFilters() {
  filters.search = '';
  filters.status = '';
  filters.schoolId = '';
  page.value = 1;
  loadRequests();
}

function onSort({ sort: nextSort, order: nextOrder }) {
  sort.value = nextSort;
  order.value = nextOrder;
}

function onPage(nextPage) {
  page.value = nextPage;
  loadRequests();
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
      await approveMaintenance(dialog.target.id, payload);
      banner.value = 'Request approved.';
    } else if (dialog.action === 'reject') {
      await rejectMaintenance(dialog.target.id, payload);
      banner.value = 'Request rejected.';
    } else {
      await completeMaintenance(dialog.target.id, payload);
      banner.value = 'Request completed.';
    }
    closeDialog();
    await loadRequests();
  } catch (err) {
    dialog.error = errorMessage(err, 'Unable to update this request.');
    dialog.submitting = false;
  }
}

onMounted(async () => {
  await loadSchools();
  await loadRequests();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">Maintenance requests for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).</p>
      <RouterLink
        v-if="canRequest"
        :to="{ name: 'maintenance-create' }"
        class="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
      >
        Create request
      </RouterLink>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <Alert v-if="error" class="mb-4" :message="error" />

    <MaintenanceFilters
      v-model:search="filters.search"
      v-model:status="filters.status"
      v-model:school-id="filters.schoolId"
      class="mb-4"
      :schools="schools"
      :show-school="showSchool"
      @change="onFiltersChange"
      @clear="clearFilters"
    />

    <MaintenanceTable
      :requests="displayed"
      :meta="meta"
      :sort="sort"
      :order="order"
      :loading="loading"
      :can-approve="canApprove"
      @sort="onSort"
      @page="onPage"
      @approve="openDialog('approve', $event)"
      @reject="openDialog('reject', $event)"
      @complete="openDialog('complete', $event)"
    />

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
