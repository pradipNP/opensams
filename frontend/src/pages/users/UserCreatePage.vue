<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import UserForm from '@/components/users/UserForm.vue';
import { createUser } from '@/api/user.api';
import { listMunicipalities, listSchools } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const municipalities = ref([]);
const schools = ref([]);

async function loadLookups() {
  loading.value = true;
  error.value = '';
  const failures = [];

  try {
    municipalities.value = (await listMunicipalities({ page: 1, limit: 100 })).data || [];
  } catch (err) {
    municipalities.value = [];
    failures.push(err);
  }

  try {
    schools.value = (await listSchools({ page: 1, limit: 100 })).data || [];
  } catch (err) {
    schools.value = [];
    failures.push(err);
  }

  if (failures.length) {
    error.value = errorMessage(failures[0], 'Unable to load assignment options.');
  }
  loading.value = false;
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    const response = await createUser(payload);
    const id = response.data?.id;
    await router.push({ name: 'user-detail', params: { id }, query: { created: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to create user.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'users' });
}

onMounted(loadLookups);
</script>

<template>
  <div>
    <div class="mb-4">
      <button type="button" class="text-sm text-navy-800 hover:underline" @click="onCancel">← Back to users</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Loading form…
    </p>
    <UserForm
      v-else
      submit-label="Create user"
      :submitting="submitting"
      :server-errors="serverErrors"
      :municipalities="municipalities"
      :schools="schools"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
