<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ReportFilters from '@/components/reports/ReportFilters.vue';
import ReportTable from '@/components/reports/ReportTable.vue';
import ExportButtons from '@/components/reports/ExportButtons.vue';
import { getReport } from '@/api/report.api';
import { listCategories, listMunicipalities, listSchools, listStatuses } from '@/api/lookup.api';
import { errorMessage, formatCurrency, formatDate, omitEmpty } from '@/utils/format';
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
const sort = ref('created_at');
const order = ref('desc');
const lookupsReady = ref(false);

const categories = ref([]);
const assetStatuses = ref([]);
const municipalities = ref([]);
const schools = ref([]);

const filters = reactive({
  search: '',
  categoryId: '',
  statusId: '',
  municipalityId: '',
  schoolId: '',
});

const showMunicipality = computed(() => auth.role === 'state_admin');
const showSchool = computed(() => auth.role !== 'school_admin');

const columns = [
  { key: 'assetTag', label: 'Asset Tag', sortable: true, sortKey: 'asset_tag' },
  { key: 'name', label: 'Asset Name', sortable: true, sortKey: 'name' },
  { key: 'category', label: 'Category', get: (row) => row.category?.name || '—' },
  { key: 'status', label: 'Status', get: (row) => row.status?.name || '—' },
  { key: 'municipality', label: 'Municipality', get: (row) => row.municipality?.name || '—' },
  { key: 'school', label: 'School', get: (row) => row.school?.name || '—' },
  { key: 'purchaseCost', label: 'Purchase Cost', sortable: true, sortKey: 'purchase_cost', get: (row) => formatCurrency(row.purchaseCost) },
  { key: 'purchaseDate', label: 'Purchase Date', sortable: true, sortKey: 'purchase_date', get: (row) => formatDate(row.purchaseDate) },
];

function queryParams(includePaging = true) {
  const params = omitEmpty({
    search: filters.search.trim(),
    categoryId: filters.categoryId,
    statusId: filters.statusId,
    municipalityId: filters.municipalityId,
    schoolId: filters.schoolId,
    sort: sort.value,
    order: order.value,
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
    const response = await listSchools(omitEmpty({ page: 1, limit: 100, municipalityId: filters.municipalityId }));
    schools.value = response.data || [];
  } catch {
    schools.value = [];
  }
}

async function loadLookups() {
  await Promise.all([
    listStatuses()
      .then((response) => {
        assetStatuses.value = response.data || [];
      })
      .catch(() => {
        assetStatuses.value = [];
      }),
    listCategories()
      .then((response) => {
        categories.value = response.data || [];
      })
      .catch(() => {
        categories.value = [];
      }),
    loadSchools(),
    showMunicipality.value
      ? listMunicipalities({ page: 1, limit: 100 })
          .then((response) => {
            municipalities.value = response.data || [];
          })
          .catch(() => {
            municipalities.value = [];
          })
      : Promise.resolve(),
  ]);
}

async function loadReport() {
  loading.value = true;
  error.value = '';
  try {
    const response = await getReport('inventory', queryParams());
    rows.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: 20, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load inventory report.');
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
  filters.search = '';
  filters.categoryId = '';
  filters.statusId = '';
  filters.municipalityId = '';
  filters.schoolId = '';
  page.value = 1;
  loadReport();
}

function onSort({ sort: nextSort, order: nextOrder }) {
  sort.value = nextSort;
  order.value = nextOrder;
  page.value = 1;
  loadReport();
}

async function onExport(format) {
  exporting.value = format;
  exportError.value = '';
  try {
    await downloadReportFile('inventory', format, queryParams(false));
  } catch (err) {
    exportError.value = await blobErrorMessage(err, 'Unable to export inventory report.');
  } finally {
    exporting.value = '';
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
      v-model:search="filters.search"
      v-model:category-id="filters.categoryId"
      v-model:status-id="filters.statusId"
      v-model:municipality-id="filters.municipalityId"
      v-model:school-id="filters.schoolId"
      class="mb-4"
      show-search
      show-category
      show-status-id
      :show-municipality="showMunicipality"
      :show-school="showSchool"
      :categories="categories"
      :asset-statuses="assetStatuses"
      :municipalities="municipalities"
      :schools="schools"
      @change="onFiltersChange"
      @clear="clearFilters"
    />

    <ReportTable
      :rows="rows"
      :columns="columns"
      :meta="meta"
      :sort="sort"
      :order="order"
      :loading="loading"
      empty-message="No inventory records match the current filters."
      @sort="onSort"
      @page="(nextPage) => { page = nextPage; loadReport(); }"
    />
  </div>
</template>
