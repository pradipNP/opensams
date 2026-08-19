<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import SchoolForm from '@/components/schools/SchoolForm.vue';
import { createSchool } from '@/api/school.api';
import { listMunicipalities } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const municipalities = ref([]);

async function loadMunicipalities() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listMunicipalities({ page: 1, limit: 100 });
    municipalities.value = (response.data || []).filter((item) => item.isActive !== false);
  } catch (err) {
    municipalities.value = [];
    error.value = errorMessage(err, 'Unable to load municipalities.');
  } finally {
    loading.value = false;
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    const response = await createSchool(payload);
    const id = response.data?.id;
    await router.push({ name: 'school-detail', params: { id }, query: { created: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to create school.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'schools' });
}

onMounted(loadMunicipalities);
</script>

<template>
  <div>
    <div class="mb-4">
      <button type="button" class="link-back" @click="onCancel">← Back to schools</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="empty-panel">
      Loading form…
    </p>
    <p
      v-else-if="!municipalities.length"
      class="empty-panel"
    >
      Municipality data is required to create a school.
    </p>
    <SchoolForm
      v-else
      submit-label="Create school"
      :submitting="submitting"
      :server-errors="serverErrors"
      :municipalities="municipalities"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
