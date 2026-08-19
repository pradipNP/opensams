<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import ReportTable from '@/components/reports/ReportTable.vue';
import ExportButtons from '@/components/reports/ExportButtons.vue';
import { getReport } from '@/api/report.api';
import { errorMessage, formatCurrency, formatNumber } from '@/utils/format';
import { blobErrorMessage, downloadReportFile } from '@/utils/download';

const loading = ref(true);
const error = ref('');
const exportError = ref('');
const exporting = ref('');
const rows = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);

const columns = [
  { key: 'name', label: 'School' },
  { key: 'assetCount', label: 'Asset Count', numeric: true, get: (row) => formatNumber(row.totalAssets) },
  { key: 'assetValue', label: 'Asset Value', numeric: true, get: (row) => formatCurrency(row.totalAssetValue) },
  { key: 'maintenanceCount', label: 'Maintenance Count', numeric: true, get: (row) => formatNumber(row.underMaintenanceAssets) },
];

async function loadReport() {
  loading.value = true;
  error.value = '';
  try {
    const response = await getReport('school', { page: page.value, limit: 20 });
    rows.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: 20, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load school report.');
    rows.value = [];
    meta.value = { page: 1, limit: 20, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

async function onExport(format) {
  exporting.value = format;
  exportError.value = '';
  try {
    await downloadReportFile('school', format, {});
  } catch (err) {
    exportError.value = await blobErrorMessage(err, 'Unable to export school report.');
  } finally {
    exporting.value = '';
  }
}

onMounted(loadReport);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'reports' }" class="link-back">← Back to reports</RouterLink>
      <ExportButtons :exporting="exporting" @export="onExport" />
    </div>

    <Alert v-if="exportError" class="mb-4" :message="exportError" />
    <ErrorRetry
      v-if="error"
      class="mb-4"
      :message="error"
      :loading="loading"
      @retry="loadReport"
    />

    <ReportTable
      :rows="rows"
      :columns="columns"
      :meta="meta"
      :loading="loading"
      empty-message="No school records are available in your scope."
      @page="(nextPage) => { page = nextPage; loadReport(); }"
    />
  </div>
</template>
