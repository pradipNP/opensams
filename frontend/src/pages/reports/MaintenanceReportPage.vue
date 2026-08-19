<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ReportFilters from '@/components/reports/ReportFilters.vue';
import ReportTable from '@/components/reports/ReportTable.vue';
import ExportButtons from '@/components/reports/ExportButtons.vue';
import { getReport } from '@/api/report.api';
import { listSchools } from '@/api/lookup.api';
import { errorMessage, formatAction, formatDateTime, omitEmpty } from '@/utils/format';
import { blobErrorMessage, downloadReportFile } from '@/utils/download';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const exportError = ref('');
const exporting = ref('');
const rows = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);
const schools = ref([]);

const filters = reactive({
  status: '',
  schoolId: '',
});

const showSchool = computed(() => auth.role !== 'school_admin');

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const columns = [
  { key: 'assetTag', label: 'Asset Tag', get: (row) => row.asset?.assetTag || '—' },
  { key: 'assetName', label: 'Asset Name', get: (row) => row.asset?.name || '—' },
  { key: 'school', label: 'School', get: (row) => row.school?.name || '—' },
  { key: 'status', label: 'Status', get: (row) => formatAction(row.status) },
  { key: 'priority', label: 'Priority', get: (row) => formatAction(row.priority) },
  { key: 'requestedAt', label: 'Requested Date', get: (row) => formatDateTime(row.requestedAt) },
];

function queryParams(includePaging = true) {
  const params = omitEmpty({
    status: filters.status,
    schoolId: filters.schoolId,
  });
  if (includePaging) {
    params.page = page.value;
    params.limit = 20;
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

async function loadReport() {
  loading.value = true;
  error.value = '';
  try {
    const response = await getReport('maintenance', queryParams());
    rows.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: 20, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load maintenance report.');
    rows.value = [];
    meta.value = { page: 1, limit: 20, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

function onFiltersChange() {
  page.value = 1;
  loadReport();
}

function clearFilters() {
  filters.status = '';
  filters.schoolId = '';
  page.value = 1;
  loadReport();
}

async function onExport(format) {
  exporting.value = format;
  exportError.value = '';
  try {
    await downloadReportFile('maintenance', format, queryParams(false));
  } catch (err) {
    exportError.value = await blobErrorMessage(err, 'Unable to export maintenance report.');
  } finally {
    exporting.value = '';
  }
}

onMounted(async () => {
  await loadSchools();
  await loadReport();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'reports' }" class="text-sm text-navy-800 hover:underline">← Back to reports</RouterLink>
      <ExportButtons :exporting="exporting" @export="onExport" />
    </div>

    <Alert v-if="exportError" class="mb-4" :message="exportError" />
    <Alert v-if="error" class="mb-4" :message="error" />

    <ReportFilters
      v-model:status="filters.status"
      v-model:school-id="filters.schoolId"
      class="mb-4"
      show-status
      :show-school="showSchool"
      :status-options="statusOptions"
      :schools="schools"
      @change="onFiltersChange"
      @clear="clearFilters"
    />

    <ReportTable
      :rows="rows"
      :columns="columns"
      :meta="meta"
      :loading="loading"
      empty-message="No maintenance records match the current filters."
      @page="(nextPage) => { page = nextPage; loadReport(); }"
    />
  </div>
</template>
