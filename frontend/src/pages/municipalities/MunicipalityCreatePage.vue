<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import MunicipalityForm from '@/components/municipalities/MunicipalityForm.vue';
import { createMunicipality } from '@/api/municipality.api';
import { listProvinces } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const provinces = ref([]);

async function loadProvinces() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listProvinces();
    provinces.value = response.data || [];
  } catch (err) {
    provinces.value = [];
    error.value = errorMessage(err, 'Unable to load provinces.');
  } finally {
    loading.value = false;
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    await createMunicipality(payload);
    await router.push({ name: 'municipalities', query: { created: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to create municipality.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'municipalities' });
}

onMounted(loadProvinces);
</script>

<template>
  <div>
    <div class="mb-4">
      <button type="button" class="text-sm text-navy-800 hover:underline" @click="onCancel">
        ← Back to municipalities
      </button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Loading form…
    </p>
    <p
      v-else-if="!provinces.length"
      class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
    >
      Province data is required to create a municipality.
    </p>
    <MunicipalityForm
      v-else
      submit-label="Create municipality"
      :submitting="submitting"
      :server-errors="serverErrors"
      :provinces="provinces"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
