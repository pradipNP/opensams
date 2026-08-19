<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import SchoolFilters from '@/components/schools/SchoolFilters.vue';
import SchoolTable from '@/components/schools/SchoolTable.vue';
import { listMunicipalities, listSchools } from '@/api/lookup.api';
import { errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const schools = ref([]);
const municipalities = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);
const limit = ref(20);

const filters = reactive({
  search: '',
  municipalityId: '',
});

const canWrite = computed(() => auth.hasPermission('schools:write'));
const showMunicipality = computed(() => auth.role === 'state_admin');

function listParams() {
  const params = {
    page: page.value,
    limit: limit.value,
  };
  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.municipalityId) {
    params.municipalityId = filters.municipalityId;
  }
  return params;
}

async function loadMunicipalities() {
  if (!showMunicipality.value) {
    municipalities.value = [];
    return;
  }
  try {
    const response = await listMunicipalities({ page: 1, limit: 100 });
    municipalities.value = response.data || [];
  } catch {
    municipalities.value = [];
  }
}

async function loadSchools() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listSchools(listParams());
    schools.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: limit.value, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load schools.');
    schools.value = [];
    meta.value = { page: 1, limit: limit.value, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

function onFiltersChange() {
  page.value = 1;
  loadSchools();
}

function clearFilters() {
  filters.search = '';
  filters.municipalityId = '';
  page.value = 1;
  loadSchools();
}

function onPage(nextPage) {
  page.value = nextPage;
  loadSchools();
}

onMounted(async () => {
  await loadMunicipalities();
  await loadSchools();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">Schools for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).</p>
      <RouterLink
        v-if="canWrite"
        :to="{ name: 'school-create' }"
        class="btn btn-primary"
      >
        Create school
      </RouterLink>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <SchoolFilters
      v-model:search="filters.search"
      v-model:municipality-id="filters.municipalityId"
      class="mb-4"
      :municipalities="municipalities"
      :show-municipality="showMunicipality"
      @change="onFiltersChange"
      @clear="clearFilters"
    />

    <SchoolTable
      :schools="schools"
      :meta="meta"
      :loading="loading"
      :can-write="canWrite"
      @page="onPage"
    />
  </div>
</template>
