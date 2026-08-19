<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import MunicipalityTable from '@/components/municipalities/MunicipalityTable.vue';
import { listMunicipalities } from '@/api/lookup.api';
import { activeRecords, errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const banner = ref('');
const municipalities = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);
const limit = ref(20);
const search = ref('');
let debounceId = null;

const canWrite = computed(() => auth.hasPermission('municipalities:write'));

function listParams() {
  const params = {
    page: page.value,
    limit: limit.value,
  };
  if (search.value.trim()) {
    params.search = search.value.trim();
  }
  return params;
}

async function loadMunicipalities() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listMunicipalities(listParams());
    const rows = response.data || [];
    municipalities.value = canWrite.value ? rows : activeRecords(rows);
    meta.value = response.meta || { page: page.value, limit: limit.value, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load municipalities.');
    municipalities.value = [];
    meta.value = { page: 1, limit: limit.value, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

watch(search, () => {
  clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    page.value = 1;
    loadMunicipalities();
  }, 350);
});

onBeforeUnmount(() => {
  clearTimeout(debounceId);
});

function clearSearch() {
  clearTimeout(debounceId);
  search.value = '';
  page.value = 1;
  loadMunicipalities();
}

function onPage(nextPage) {
  page.value = nextPage;
  loadMunicipalities();
}

onMounted(() => {
  if (route.query.created === '1') {
    banner.value = 'Municipality created successfully.';
    router.replace({ name: 'municipalities' });
  } else if (route.query.updated === '1') {
    banner.value = 'Municipality updated successfully.';
    router.replace({ name: 'municipalities' });
  }
  loadMunicipalities();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">Municipalities for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).</p>
      <RouterLink
        v-if="canWrite"
        :to="{ name: 'municipality-create' }"
        class="btn btn-primary"
      >
        Create municipality
      </RouterLink>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <ErrorRetry
      v-if="error"
      class="mb-4"
      :message="error"
      :loading="loading"
      @retry="loadMunicipalities"
    />

    <section class="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="md:col-span-2">
          <label for="municipality-search" class="field-label">Search</label>
          <input
            id="municipality-search"
            v-model="search"
            type="search"
            placeholder="Name, code, or district"
            class="field-control"
          />
        </div>
      </div>
      <div class="mt-3 flex justify-end">
        <button
          type="button"
          class="btn btn-secondary btn-sm"
          @click="clearSearch"
        >
          Clear filters
        </button>
      </div>
    </section>

    <MunicipalityTable
      :municipalities="municipalities"
      :meta="meta"
      :loading="loading"
      :can-write="canWrite"
      @page="onPage"
    />
  </div>
</template>
