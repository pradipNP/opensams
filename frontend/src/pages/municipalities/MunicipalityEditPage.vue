<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import MunicipalityForm from '@/components/municipalities/MunicipalityForm.vue';
import { getMunicipality, updateMunicipality } from '@/api/municipality.api';
import { listProvinces } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const municipality = ref(null);
const provinces = ref([]);

async function loadPage(id) {
  loading.value = true;
  error.value = '';
  municipality.value = null;
  try {
    const municipalityResponse = await getMunicipality(id);
    municipality.value = municipalityResponse.data || null;

    const provinceResult = await Promise.allSettled([listProvinces()]);
    provinces.value = provinceResult[0].status === 'fulfilled' ? provinceResult[0].value.data || [] : [];
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this municipality.');
  } finally {
    loading.value = false;
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    await updateMunicipality(route.params.id, payload);
    await router.push({ name: 'municipalities', query: { updated: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to update municipality.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'municipalities' });
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
      <button type="button" class="link-back" @click="onCancel">
        ← Back to municipalities
      </button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="empty-panel">
      Loading municipality…
    </p>
    <p
      v-else-if="!municipality"
      class="empty-panel"
    >
      Municipality not found.
    </p>
    <MunicipalityForm
      v-else
      :municipality="municipality"
      submit-label="Save changes"
      :submitting="submitting"
      :server-errors="serverErrors"
      :provinces="provinces"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
