<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import { getSchool, listSchoolAssets } from '@/api/school.api';
import { displayValue, errorMessage, formatCurrency, formatNumber } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

const loading = ref(true);
const error = ref('');
const assetsError = ref('');
const banner = ref('');
const school = ref(null);
const assets = ref([]);
const assetsLoading = ref(false);
const assetsMeta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const assetsPage = ref(1);
const assetsLimit = ref(20);

const canWrite = computed(() => auth.hasPermission('schools:write'));

function statusStyle(status) {
  const color = status?.colorCode || '#64748b';
  return {
    color,
    backgroundColor: `${color}22`,
    border: `1px solid ${color}44`,
  };
}

const assetsRangeLabel = computed(() => {
  const total = Number(assetsMeta.value?.total || 0);
  if (!total) {
    return '0 results';
  }
  const page = Number(assetsMeta.value?.page || 1);
  const limit = Number(assetsMeta.value?.limit || 20);
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);
  return `Showing ${from}–${to} of ${total}`;
});

async function loadAssets(schoolId) {
  assetsLoading.value = true;
  assetsError.value = '';
  try {
    const response = await listSchoolAssets(schoolId, {
      page: assetsPage.value,
      limit: assetsLimit.value,
    });
    assets.value = response.data || [];
    assetsMeta.value = response.meta || {
      page: assetsPage.value,
      limit: assetsLimit.value,
      total: 0,
      totalPages: 0,
    };
  } catch (err) {
    assets.value = [];
    assetsMeta.value = { page: 1, limit: assetsLimit.value, total: 0, totalPages: 0 };
    assetsError.value = errorMessage(err, 'Unable to load school assets.');
  } finally {
    assetsLoading.value = false;
  }
}

async function loadSchool(id) {
  loading.value = true;
  error.value = '';
  school.value = null;
  try {
    const response = await getSchool(id);
    school.value = response.data || null;
    if (school.value?.name) {
      app.setPageTitle(school.value.name);
    }
    assetsPage.value = 1;
    await loadAssets(id);
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this school.');
  } finally {
    loading.value = false;
  }
}

function onAssetsPage(nextPage) {
  assetsPage.value = nextPage;
  if (school.value?.id) {
    loadAssets(school.value.id);
  }
}

onMounted(() => {
  if (route.query.created === '1') {
    banner.value = 'School created successfully.';
    router.replace({ name: 'school-detail', params: { id: route.params.id } });
  } else if (route.query.updated === '1') {
    banner.value = 'School updated successfully.';
    router.replace({ name: 'school-detail', params: { id: route.params.id } });
  }
  loadSchool(route.params.id);
});

watch(
  () => route.params.id,
  (id, previous) => {
    if (id && id !== previous) {
      banner.value = '';
      loadSchool(id);
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'schools' }" class="text-sm text-navy-800 hover:underline">← Back to schools</RouterLink>
      <RouterLink
        v-if="school && canWrite"
        :to="{ name: 'school-edit', params: { id: school.id } }"
        class="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
      >
        Edit
      </RouterLink>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Loading school…
    </p>
    <p
      v-else-if="!error && !school"
      class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
    >
      School not found.
    </p>

    <div v-else-if="school" class="space-y-4">
      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">School information</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Name</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(school.name) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">School code</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(school.schoolCode) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Type</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(school.schoolType) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Municipality</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(school.municipality?.name) }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Address</dt>
            <dd class="mt-1 text-sm whitespace-pre-wrap text-navy-950">{{ displayValue(school.address) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Active status</dt>
            <dd class="mt-1">
              <span
                class="inline-flex rounded-full border px-2 py-0.5 text-xs font-medium"
                :class="
                  school.isActive
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                "
              >
                {{ school.isActive ? 'Active' : 'Inactive' }}
              </span>
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Total assets</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatNumber(school.stats?.totalAssets) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Active assets</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatNumber(school.stats?.activeAssets) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Total value</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatCurrency(school.stats?.totalValue) }}</dd>
          </div>
        </dl>
      </section>

      <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div class="border-b border-slate-200 px-6 py-4">
          <h2 class="text-lg font-semibold text-navy-950">School assets</h2>
        </div>
        <Alert v-if="assetsError" class="m-4" :message="assetsError" />
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200 text-sm">
            <thead class="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-600 uppercase">
              <tr>
                <th class="px-4 py-3 whitespace-nowrap">Asset Tag</th>
                <th class="px-4 py-3 whitespace-nowrap">Asset Name</th>
                <th class="px-4 py-3 whitespace-nowrap">Category</th>
                <th class="px-4 py-3 whitespace-nowrap">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 bg-white text-slate-800">
              <tr v-if="assetsLoading && !assets.length">
                <td colspan="4" class="px-4 py-10 text-center text-slate-500">Loading assets…</td>
              </tr>
              <tr v-else-if="!assets.length">
                <td colspan="4" class="px-4 py-10 text-center text-slate-500">No assets found for this school.</td>
              </tr>
              <tr v-for="asset in assets" :key="asset.id" class="hover:bg-slate-50">
                <td class="px-4 py-3 font-medium whitespace-nowrap text-navy-950">
                  <RouterLink
                    v-if="asset.id"
                    :to="{ name: 'asset-detail', params: { id: asset.id } }"
                    class="text-navy-800 hover:underline"
                  >
                    {{ asset.assetTag }}
                  </RouterLink>
                  <span v-else>{{ asset.assetTag || '—' }}</span>
                </td>
                <td class="px-4 py-3">{{ asset.name }}</td>
                <td class="px-4 py-3 whitespace-nowrap">{{ asset.category?.name || '—' }}</td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                    :style="statusStyle(asset.status)"
                  >
                    {{ asset.status?.name || '—' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
          <p>{{ assetsLoading && assets.length ? 'Refreshing…' : assetsRangeLabel }}</p>
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="assetsLoading || (assetsMeta.page || 1) <= 1"
              @click="onAssetsPage((assetsMeta.page || 1) - 1)"
            >
              Previous
            </button>
            <span>Page {{ assetsMeta.page || 1 }} of {{ assetsMeta.totalPages || 1 }}</span>
            <button
              type="button"
              class="rounded-md border border-slate-200 px-3 py-1.5 text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              :disabled="assetsLoading || (assetsMeta.page || 1) >= (assetsMeta.totalPages || 1)"
              @click="onAssetsPage((assetsMeta.page || 1) + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>
