<script setup>
import { computed, onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
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

const quickActions = computed(() => {
  const actions = [];

  if (auth.hasPermission('assets:write')) {
    actions.push({ label: 'Register asset', to: { name: 'asset-create' } });
  } else {
    actions.push({ label: 'View assets', to: { name: 'assets' } });
  }

  if (auth.hasPermission('maintenance:request')) {
    actions.push({ label: 'Create maintenance request', to: { name: 'maintenance-create' } });
  } else {
    actions.push({ label: 'View maintenance', to: { name: 'maintenance' } });
  }

  if (auth.hasPermission('transfers:request')) {
    actions.push({ label: 'Create transfer', to: { name: 'transfer-create' } });
  } else {
    actions.push({ label: 'View transfers', to: { name: 'transfers' } });
  }

  if (auth.hasPermission('users:read')) {
    actions.push({ label: 'Manage users', to: { name: 'users' } });
  }

  if (auth.hasPermission('schools:write')) {
    actions.push({ label: 'Manage schools', to: { name: 'schools' } });
  } else if (auth.hasPermission('schools:read')) {
    actions.push({ label: 'View schools', to: { name: 'schools' } });
  }

  if (canViewMunicipalities.value) {
    actions.push({
      label: auth.hasPermission('municipalities:write') ? 'Manage municipalities' : 'View municipalities',
      to: { name: 'municipalities' },
    });
  }

  if (auth.hasPermission('reports:read')) {
    actions.push({ label: 'View reports', to: { name: 'reports' } });
  }

  return actions;
});

function settledData(result) {
  if (result.status !== 'fulfilled') {
    return { ok: false, error: errorMessage(result.reason, 'Unable to load this section.'), data: null };
  }
  return { ok: true, error: '', data: result.value?.data || null };
}

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

async function loadDashboard() {
  kpiLoading.value = true;
  kpiError.value = '';
  category.value = emptySection();
  status.value = emptySection();
  municipalityValue.value = emptySection();
  transfers.value = emptySection();

  const [kpisResult, categoryResult, statusResult, valueResult, municipalityResult, transferResult] =
    await Promise.allSettled([
      getKpis(),
      getCategoryChart(),
      getStatusChart(),
      getValueByMunicipalityChart(),
      getMunicipalityChart(),
      getTransferChart(),
    ]);

  const kpiPayload = settledData(kpisResult);
  if (kpiPayload.ok) {
    const data = kpiPayload.data || {};
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
  } else {
    kpis.value = null;
    kpiError.value = kpiPayload.error || 'Unable to load dashboard figures.';
  }
  kpiLoading.value = false;

  const categoryPayload = settledData(categoryResult);
  category.value.loading = false;
  if (categoryPayload.ok) {
    category.value.items = sortByValueDesc(chartItems(categoryPayload.data));
  } else {
    category.value.error = categoryPayload.error;
  }

  const statusPayload = settledData(statusResult);
  status.value.loading = false;
  if (statusPayload.ok) {
    status.value.items = chartItems(statusPayload.data).map((item) => ({
      ...item,
      hint: item.hint || '',
    }));
  } else {
    status.value.error = statusPayload.error;
  }

  const valuePayload = settledData(valueResult);
  const municipalityPayload = settledData(municipalityResult);
  municipalityValue.value.loading = false;
  if (valuePayload.ok) {
    const counts = {};
    if (municipalityPayload.ok) {
      chartItems(municipalityPayload.data).forEach((item) => {
        counts[item.id] = item.value;
      });
    }
    municipalityValue.value.items = sortByValueDesc(chartItems(valuePayload.data)).map((item) => ({
      ...item,
      display: formatCurrency(item.value),
      hint: counts[item.id] != null ? `${formatNumber(counts[item.id])} assets` : '',
    }));
  } else {
    municipalityValue.value.error = valuePayload.error;
  }

  const transferPayload = settledData(transferResult);
  transfers.value.loading = false;
  if (transferPayload.ok) {
    transfers.value.items = chartItems(transferPayload.data);
  } else if (kpis.value) {
    transfers.value.items = [
      { name: 'Pending', value: Number(kpis.value.pendingTransfers || 0) },
      { name: 'Approved', value: Number(kpis.value.approvedTransfers || 0) },
      { name: 'Completed', value: Number(kpis.value.completedTransfers || 0) },
    ];
  } else {
    transfers.value.error = transferPayload.error;
  }
}

onMounted(loadDashboard);
</script>

<template>
  <div class="space-y-6">
    <Alert v-if="kpiError" :message="kpiError" />

    <section aria-labelledby="dashboard-kpis">
      <h2 id="dashboard-kpis" class="mb-3 text-lg font-semibold text-navy-950">Overview</h2>
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total Assets" :value="cards.totalAssets" :loading="kpiLoading" />
        <KpiCard label="Active Assets" :value="cards.activeAssets" :loading="kpiLoading" />
        <KpiCard label="Total Value" :value="cards.totalAssetValue" :loading="kpiLoading" />
        <KpiCard label="Total Schools" :value="cards.totalSchools" :loading="kpiLoading" />
        <KpiCard label="Total Municipalities" :value="cards.totalMunicipalities" :loading="kpiLoading" />
        <KpiCard label="Assets Under Maintenance" :value="cards.underMaintenance" :loading="kpiLoading" />
        <KpiCard label="Pending Transfers" :value="cards.pendingTransfers" :loading="kpiLoading" />
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
      >
        <DashboardBarList :items="transfers.items" />
      </DashboardSection>
    </div>
  </div>
</template>
