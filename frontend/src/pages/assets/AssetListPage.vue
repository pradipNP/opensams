<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import AssetFilters from '@/components/assets/AssetFilters.vue';
import AssetTable from '@/components/assets/AssetTable.vue';
import { listAssets } from '@/api/asset.api';
import { listCategories, listMunicipalities, listSchools, listStatuses } from '@/api/lookup.api';
import { activeRecords, errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const assets = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);
const limit = ref(20);
const sort = ref('created_at');
const order = ref('desc');

const categories = ref([]);
const statuses = ref([]);
const municipalities = ref([]);
const schools = ref([]);

const filters = reactive({
  search: '',
  categoryId: '',
  statusId: '',
  municipalityId: '',
  schoolId: '',
});

const canWrite = computed(() => auth.hasPermission('assets:write'));
const showMunicipality = computed(() => auth.role === 'state_admin');
const lookupsReady = ref(false);
const banner = ref('');

async function loadLookups() {
  const tasks = [
    listStatuses()
      .then((response) => {
        statuses.value = response.data || [];
      })
      .catch(() => {
        statuses.value = [];
      }),
    listCategories()
      .then((response) => {
        categories.value = activeRecords(response.data);
      })
      .catch(() => {
        categories.value = [];
      }),
    loadSchools(),
  ];

  if (showMunicipality.value) {
    tasks.push(
      listMunicipalities({ page: 1, limit: 100 })
        .then((response) => {
          municipalities.value = activeRecords(response.data);
        })
        .catch(() => {
          municipalities.value = [];
        })
    );
  }

  await Promise.all(tasks);
}

async function loadSchools() {
  try {
    const params = { page: 1, limit: 100 };
    if (filters.municipalityId) {
      params.municipalityId = filters.municipalityId;
    }
    const response = await listSchools(params);
    schools.value = activeRecords(response.data);
  } catch {
    schools.value = [];
  }
}

function listParams() {
  const params = {
    page: page.value,
    limit: limit.value,
    sort: sort.value,
    order: order.value,
  };
  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.categoryId) {
    params.categoryId = filters.categoryId;
  }
  if (filters.statusId) {
    params.statusId = filters.statusId;
  }
  if (filters.municipalityId) {
    params.municipalityId = filters.municipalityId;
  }
  if (filters.schoolId) {
    params.schoolId = filters.schoolId;
  }
  return params;
}

async function loadAssets() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listAssets(listParams());
    assets.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: limit.value, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load assets.');
    assets.value = [];
    meta.value = { page: 1, limit: limit.value, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

async function onFiltersChange() {
  page.value = 1;
  await loadAssets();
}

async function clearFilters() {
  filters.search = '';
  filters.categoryId = '';
  filters.statusId = '';
  filters.municipalityId = '';
  filters.schoolId = '';
  page.value = 1;
  await loadAssets();
}

function onSort({ sort: nextSort, order: nextOrder }) {
  sort.value = nextSort;
  order.value = nextOrder;
  page.value = 1;
  loadAssets();
}

function onPage(nextPage) {
  page.value = nextPage;
  loadAssets();
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
  if (route.query.deactivated === '1') {
    banner.value = 'Asset deactivated successfully.';
    router.replace({ name: 'assets' });
  }
  await loadLookups();
  lookupsReady.value = true;
  await loadAssets();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">Inventory for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).</p>
      <RouterLink
        v-if="canWrite"
        :to="{ name: 'asset-create' }"
        class="btn btn-primary"
      >
        Create asset
      </RouterLink>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <ErrorRetry
      v-if="error"
      class="mb-4"
      :message="error"
      :loading="loading"
      @retry="loadAssets"
    />

    <AssetFilters
      v-model:search="filters.search"
      v-model:category-id="filters.categoryId"
      v-model:status-id="filters.statusId"
      v-model:municipality-id="filters.municipalityId"
      v-model:school-id="filters.schoolId"
      class="mb-4"
      :categories="categories"
      :statuses="statuses"
      :municipalities="municipalities"
      :schools="schools"
      :show-municipality="showMunicipality"
      @change="onFiltersChange"
      @clear="clearFilters"
    />

    <AssetTable
      :assets="assets"
      :meta="meta"
      :sort="sort"
      :order="order"
      :loading="loading"
      :can-edit="canWrite"
      @sort="onSort"
      @page="onPage"
    />
  </div>
</template>
