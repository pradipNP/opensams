<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import AssetForm from '@/components/assets/AssetForm.vue';
import { createAsset } from '@/api/asset.api';
import { listCategories, listSchools, listStatuses } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const categories = ref([]);
const statuses = ref([]);
const schools = ref([]);
const initialAsset = ref(null);

const lockSchool = computed(() => auth.role === 'school_admin');

async function loadLookups() {
  loading.value = true;
  error.value = '';
  const failures = [];

  try {
    statuses.value = (await listStatuses()).data || [];
  } catch (err) {
    statuses.value = [];
    failures.push(err);
  }

  try {
    categories.value = ((await listCategories()).data || []).filter((item) => item.isActive !== false);
  } catch (err) {
    categories.value = [];
    failures.push(err);
  }

  try {
    schools.value = ((await listSchools({ page: 1, limit: 100 })).data || []).filter(
      (item) => item.isActive !== false
    );
  } catch (err) {
    schools.value = [];
    failures.push(err);
  }

  if (auth.role === 'school_admin' && auth.user?.schoolId) {
    initialAsset.value = { schoolId: auth.user.schoolId };
  }

  if (failures.length) {
    error.value = errorMessage(failures[0], 'Unable to load form options.');
  }

  loading.value = false;
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
    const response = await createAsset(body);
    const id = response.data?.id;
    await router.push({ name: 'asset-detail', params: { id }, query: { created: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to create asset.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'assets' });
}

onMounted(loadLookups);
</script>

<template>
  <div>
    <div class="mb-4">
      <button type="button" class="link-back" @click="onCancel">← Back to assets</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="empty-panel">
      Loading form…
    </p>
    <p
      v-else-if="!categories.length || !statuses.length || !schools.length"
      class="empty-panel"
    >
      Required lookup data is missing, so a new asset cannot be created yet.
    </p>
    <AssetForm
      v-else
      :asset="initialAsset"
      :submitting="submitting"
      submit-label="Create asset"
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
