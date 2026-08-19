<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import SchoolForm from '@/components/schools/SchoolForm.vue';
import { getSchool, updateSchool } from '@/api/school.api';
import { listMunicipalities } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const school = ref(null);
const municipalities = ref([]);

async function loadPage(id) {
  loading.value = true;
  error.value = '';
  school.value = null;
  try {
    const schoolResponse = await getSchool(id);
    school.value = schoolResponse.data || null;

    const municipalityResult = await Promise.allSettled([listMunicipalities({ page: 1, limit: 100 })]);
    municipalities.value =
      municipalityResult[0].status === 'fulfilled' ? municipalityResult[0].value.data || [] : [];
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this school.');
  } finally {
    loading.value = false;
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    await updateSchool(route.params.id, payload);
    await router.push({ name: 'school-detail', params: { id: route.params.id }, query: { updated: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to update school.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'school-detail', params: { id: route.params.id } });
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
      <button type="button" class="text-sm text-navy-800 hover:underline" @click="onCancel">← Back to school</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Loading school…
    </p>
    <p
      v-else-if="!school"
      class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
    >
      School not found.
    </p>
    <SchoolForm
      v-else
      :school="school"
      submit-label="Save changes"
      :submitting="submitting"
      :server-errors="serverErrors"
      :municipalities="municipalities"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
