<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import AssetForm from '@/components/assets/AssetForm.vue';
import { getAsset, updateAsset } from '@/api/asset.api';
import { listCategories, listSchools, listStatuses } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const asset = ref(null);
const categories = ref([]);
const statuses = ref([]);
const schools = ref([]);

const lockSchool = computed(() => auth.role === 'school_admin');

async function loadPage(id) {
  loading.value = true;
  error.value = '';
  asset.value = null;
  try {
    const assetResponse = await getAsset(id);
    asset.value = assetResponse.data || null;

    const [statusResult, categoryResult, schoolResult] = await Promise.allSettled([
      listStatuses(),
      listCategories(),
      listSchools({ page: 1, limit: 100 }),
    ]);

    statuses.value = statusResult.status === 'fulfilled' ? statusResult.value.data || [] : [];
    categories.value =
      categoryResult.status === 'fulfilled'
        ? (categoryResult.value.data || []).filter((item) => item.isActive !== false)
        : [];
    schools.value =
      schoolResult.status === 'fulfilled'
        ? (schoolResult.value.data || []).filter((item) => item.isActive !== false)
        : [];
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this asset.');
  } finally {
    loading.value = false;
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    const body = { ...payload };
    if (auth.role === 'school_admin' && auth.user?.schoolId) {
      body.schoolId = auth.user.schoolId;
    }
    await updateAsset(route.params.id, body);
    await router.push({ name: 'asset-detail', params: { id: route.params.id }, query: { updated: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to update asset.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'asset-detail', params: { id: route.params.id } });
}

onMounted(() => loadPage(route.params.id));

watch(
  () => route.params.id,
  (id, previous) => {
    if (id && id !== previous) {
      loadPage(id);
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-4">
      <button type="button" class="link-back" @click="onCancel">← Back to asset</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="empty-panel">
      Loading asset…
    </p>
    <p
      v-else-if="!asset"
      class="empty-panel"
    >
      Asset not found.
    </p>
    <AssetForm
      v-else
      :asset="asset"
      :submitting="submitting"
      submit-label="Save changes"
      :server-errors="serverErrors"
      :categories="categories"
      :statuses="statuses"
      :schools="schools"
      :lock-school="lockSchool"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
