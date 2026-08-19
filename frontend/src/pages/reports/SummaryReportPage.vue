<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import KpiCard from '@/components/ui/KpiCard.vue';
import ExportButtons from '@/components/reports/ExportButtons.vue';
import SummarySection from '@/components/reports/SummarySection.vue';
import { getReport } from '@/api/report.api';
import { errorMessage, formatNumber } from '@/utils/format';
import { blobErrorMessage, downloadReportFile } from '@/utils/download';

const loading = ref(true);
const error = ref('');
const exportError = ref('');
const exporting = ref('');
const summary = ref(null);

const kpis = computed(() => summary.value?.kpis || {});

async function loadReport() {
  loading.value = true;
  error.value = '';
  try {
    const response = await getReport('summary');
    summary.value = response.data || null;
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load summary report.');
    summary.value = null;
  } finally {
    loading.value = false;
  }
}

async function onExport(format) {
  exporting.value = format;
  exportError.value = '';
  try {
    await downloadReportFile('summary', format, {});
  } catch (err) {
    exportError.value = await blobErrorMessage(err, 'Unable to export summary report.');
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

    <p v-if="loading" class="empty-panel">
      Loading summary report…
    </p>
    <p
      v-else-if="!error && !summary"
      class="empty-panel"
    >
      No summary data is available in your scope.
    </p>

    <div v-else-if="summary" class="space-y-4">
      <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <KpiCard label="Total Assets" :value="formatNumber(kpis.totalAssets)" />
        <KpiCard label="Active Assets" :value="formatNumber(kpis.activeAssets)" />
        <KpiCard label="Total Schools" :value="formatNumber(kpis.totalSchools)" />
        <KpiCard label="Total Municipalities" :value="formatNumber(kpis.totalMunicipalities)" />
        <KpiCard label="Completed Maintenance" :value="formatNumber(kpis.completedMaintenance)" />
        <KpiCard label="Completed Transfers" :value="formatNumber(kpis.completedTransfers)" />
      </section>

      <SummarySection title="Assets by Category" :rows="summary.assetsByCategory || []" />
      <SummarySection title="Assets by Status" :rows="summary.assetsByStatus || []" />
      <SummarySection title="Assets by Municipality" :rows="summary.assetsByMunicipality || []" />
      <SummarySection title="Transfers by Status" :rows="summary.transfersByStatus || []" />
    </div>
  </div>
</template>
