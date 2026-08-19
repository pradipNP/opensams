<script setup>
import { computed, onMounted, ref } from 'vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import KpiCard from '@/components/ui/KpiCard.vue';
import DashboardSection from '@/components/dashboard/DashboardSection.vue';
import DashboardBarList from '@/components/dashboard/DashboardBarList.vue';
import DashboardDonutChart from '@/components/dashboard/DashboardDonutChart.vue';
import {
  getCategoryChart,
  getKpis,
  getMunicipalityChart,
  getMunicipalityCount,
  getStatusChart,
  getTransferChart,
  getValueByMunicipalityChart,
} from '@/api/dashboard.api';
import { errorMessage, formatCurrency, formatNumber } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();

const kpiLoading = ref(true);
const kpiError = ref('');
const cards = ref({
  totalAssets: '—',
  activeAssets: '—',
  totalAssetValue: '—',
  totalSchools: '—',
  totalMunicipalities: '—',
  underMaintenance: '—',
  pendingTransfers: '—',
});

const kpis = ref(null);

const category = ref(emptySection());
const status = ref(emptySection());
const municipalityValue = ref(emptySection());
const transfers = ref(emptySection());

function emptySection() {
  return { loading: true, error: '', items: [] };
}

const maintenanceItems = computed(() => {
  if (!kpis.value) {
    return [];
  }
  return [
    { label: 'Pending requests', value: kpis.value.pendingMaintenance },
    { label: 'Completed requests', value: kpis.value.completedMaintenance },
    { label: 'Assets under maintenance', value: kpis.value.underMaintenance },
  ];
});

const canViewMunicipalities = computed(() => ['state_admin', 'municipal_officer'].includes(auth.role));

const municipalitySectionLink = computed(() => {
  if (canViewMunicipalities.value) {
    return { name: 'municipalities' };
  }
  if (auth.hasPermission('reports:read')) {
    return { name: 'reports' };
  }
  return { name: 'assets' };
});

const municipalitySectionLinkLabel = computed(() => {
  if (canViewMunicipalities.value) {
    return 'View municipalities';
  }
  if (auth.hasPermission('reports:read')) {
    return 'View reports';
  }
  return 'View assets';
});

function chartItems(chart) {
  if (!chart) {
    return [];
  }

  if (Array.isArray(chart.items) && chart.items.length) {
    return chart.items.map((item, index) => ({
      id: item.id || item.name || index,
      name: item.name,
      value: Number(item.value || 0),
      color: Array.isArray(chart.colors) ? chart.colors[index] : null,
      hint: Array.isArray(chart.departments) ? chart.departments[index] : '',
      code: item.code || (Array.isArray(chart.codes) ? chart.codes[index] : null),
    }));
  }

  const labels = Array.isArray(chart.labels) ? chart.labels : [];
  const values = Array.isArray(chart.values) ? chart.values : [];
  return labels.map((name, index) => ({
    id: name || index,
    name,
    value: Number(values[index] || 0),
    color: Array.isArray(chart.colors) ? chart.colors[index] : null,
  }));
}

function sortByValueDesc(items) {
  return [...items].sort((left, right) => Number(right.value || 0) - Number(left.value || 0));
}

async function loadMunicipalityCount() {
  try {
    const municipalities = await getMunicipalityCount();
    cards.value.totalMunicipalities = formatNumber(municipalities.meta?.total || 0);
  } catch {
    cards.value.totalMunicipalities = auth.role === 'state_admin' ? '—' : '1';
  }
}

async function loadKpiSection() {
  kpiLoading.value = true;
  kpiError.value = '';
  try {
    const response = await getKpis();
    const data = response.data || {};
    kpis.value = data;
    cards.value.totalAssets = formatNumber(data.totalAssets);
    cards.value.activeAssets = formatNumber(data.activeAssets);
    cards.value.totalAssetValue = formatCurrency(data.totalAssetValue);
    cards.value.totalSchools = formatNumber(data.totalSchools);
    cards.value.underMaintenance = formatNumber(data.underMaintenance);
    cards.value.pendingTransfers = formatNumber(data.pendingTransfers);

    if (data.totalMunicipalities != null) {
      cards.value.totalMunicipalities = formatNumber(data.totalMunicipalities);
    } else {
      await loadMunicipalityCount();
    }
  } catch (err) {
    kpis.value = null;
    kpiError.value = errorMessage(err, 'Unable to load dashboard figures.');
  } finally {
    kpiLoading.value = false;
  }
}

async function loadCategorySection() {
  category.value.loading = true;
  category.value.error = '';
  try {
    const response = await getCategoryChart();
    category.value.items = sortByValueDesc(chartItems(response.data));
  } catch (err) {
    category.value.error = errorMessage(err, 'Unable to load category data.');
  } finally {
    category.value.loading = false;
  }
}

async function loadStatusSection() {
  status.value.loading = true;
  status.value.error = '';
  try {
    const response = await getStatusChart();
    status.value.items = chartItems(response.data).map((item) => ({
      ...item,
      hint: item.hint || '',
    }));
  } catch (err) {
    status.value.error = errorMessage(err, 'Unable to load status data.');
  } finally {
    status.value.loading = false;
  }
}

async function loadMunicipalityValueSection() {
  municipalityValue.value.loading = true;
  municipalityValue.value.error = '';
  try {
    const [valueResponse, municipalityResponse] = await Promise.all([
      getValueByMunicipalityChart(),
      getMunicipalityChart(),
    ]);
    const counts = {};
    chartItems(municipalityResponse.data).forEach((item) => {
      counts[item.id] = item.value;
    });
    municipalityValue.value.items = sortByValueDesc(chartItems(valueResponse.data)).map((item) => ({
      ...item,
      display: formatCurrency(item.value),
      hint: counts[item.id] != null ? `${formatNumber(counts[item.id])} assets` : '',
    }));
  } catch (err) {
    municipalityValue.value.error = errorMessage(err, 'Unable to load municipality value data.');
  } finally {
    municipalityValue.value.loading = false;
  }
}

async function loadTransferSection() {
  transfers.value.loading = true;
  transfers.value.error = '';
  try {
    const response = await getTransferChart();
    transfers.value.items = chartItems(response.data);
  } catch (err) {
    if (kpis.value) {
      transfers.value.items = [
        { name: 'Pending', value: Number(kpis.value.pendingTransfers || 0) },
        { name: 'Approved', value: Number(kpis.value.approvedTransfers || 0) },
        { name: 'Completed', value: Number(kpis.value.completedTransfers || 0) },
      ];
    } else {
      transfers.value.error = errorMessage(err, 'Unable to load transfer data.');
    }
  } finally {
    transfers.value.loading = false;
  }
}

async function loadDashboard() {
  await Promise.all([
    loadKpiSection(),
    loadCategorySection(),
    loadStatusSection(),
    loadMunicipalityValueSection(),
    loadTransferSection(),
  ]);
}

onMounted(loadDashboard);
</script>

<template>
  <div class="space-y-6">
    <ErrorRetry
      v-if="kpiError"
      :message="kpiError"
      :loading="kpiLoading"
      @retry="loadKpiSection"
    />

    <section aria-labelledby="dashboard-kpis">
      <h2 id="dashboard-kpis" class="mb-3 text-lg font-semibold text-navy-950">Overview</h2>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Assets" :value="cards.totalAssets" :loading="kpiLoading" accent="navy" />
        <KpiCard label="Active Assets" :value="cards.activeAssets" :loading="kpiLoading" accent="emerald" />
        <KpiCard label="Total Value" :value="cards.totalAssetValue" :loading="kpiLoading" accent="teal" />
        <KpiCard label="Total Schools" :value="cards.totalSchools" :loading="kpiLoading" accent="indigo" />
        <KpiCard label="Total Municipalities" :value="cards.totalMunicipalities" :loading="kpiLoading" accent="sky" />
        <KpiCard
          label="Assets Under Maintenance"
          :value="cards.underMaintenance"
          :loading="kpiLoading"
          accent="amber"
        />
        <KpiCard
          label="Pending Transfers"
          :value="cards.pendingTransfers"
          :loading="kpiLoading"
          accent="rose"
        />
      </div>
    </section>

    <div class="grid gap-4 xl:grid-cols-2">
      <DashboardSection
        title="Assets by category"
        description="Distribution of assets across categories in your scope."
        :to="{ name: 'assets' }"
        to-label="View assets"
        :loading="category.loading"
        :error="category.error"
        :empty="!category.items.length"
        empty-message="No asset category data available."
        retryable
        @retry="loadCategorySection"
      >
        <DashboardDonutChart :items="category.items" />
      </DashboardSection>

      <DashboardSection
        title="Assets by status"
        description="Current inventory status using the official status list."
        :to="{ name: 'assets' }"
        to-label="View assets"
        :loading="status.loading"
        :error="status.error"
        :empty="!status.items.length"
        empty-message="No asset status data available."
        retryable
        @retry="loadStatusSection"
      >
        <DashboardBarList :items="status.items" />
      </DashboardSection>
    </div>

    <DashboardSection
      title="Asset value by municipality"
      description="Inventory purchase value grouped by municipality in your scope."
      :to="municipalitySectionLink"
      :to-label="municipalitySectionLinkLabel"
      :loading="municipalityValue.loading"
      :error="municipalityValue.error"
      :empty="!municipalityValue.items.length"
      empty-message="No municipality asset value data available."
      retryable
      @retry="loadMunicipalityValueSection"
    >
      <DashboardBarList :items="municipalityValue.items" />
    </DashboardSection>

    <div class="grid gap-4 xl:grid-cols-2">
      <DashboardSection
        title="Maintenance overview"
        description="Request counts and assets currently under maintenance."
        :to="{ name: 'maintenance' }"
        to-label="View maintenance"
        :loading="kpiLoading"
        :error="''"
        :empty="!kpiLoading && !maintenanceItems.length"
        empty-message="No maintenance data available."
      >
        <dl class="grid gap-3 sm:grid-cols-3">
          <div
            v-for="item in maintenanceItems"
            :key="item.label"
            class="rounded-md border border-slate-200 bg-slate-50 px-3 py-3"
          >
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">{{ item.label }}</dt>
            <dd class="mt-1 text-xl font-semibold text-navy-950">{{ formatNumber(item.value) }}</dd>
          </div>
        </dl>
      </DashboardSection>

      <DashboardSection
        title="Transfer overview"
        description="Transfer volume by workflow status."
        :to="{ name: 'transfers' }"
        to-label="View transfers"
        :loading="transfers.loading"
        :error="transfers.error"
        :empty="!transfers.items.length"
        empty-message="No transfer data available."
        retryable
        @retry="loadTransferSection"
      >
        <DashboardBarList :items="transfers.items" />
      </DashboardSection>
    </div>
  </div>
</template>
