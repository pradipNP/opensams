<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import UserForm from '@/components/users/UserForm.vue';
import { getUser, updateUser } from '@/api/user.api';
import { listMunicipalities, listSchools } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const user = ref(null);
const municipalities = ref([]);
const schools = ref([]);

async function loadPage(id) {
  loading.value = true;
  error.value = '';
  user.value = null;
  try {
    const userResponse = await getUser(id);
    user.value = userResponse.data || null;

    const [municipalityResult, schoolResult] = await Promise.allSettled([
      listMunicipalities({ page: 1, limit: 100 }),
      listSchools({ page: 1, limit: 100 }),
    ]);
    municipalities.value =
      municipalityResult.status === 'fulfilled' ? municipalityResult.value.data || [] : [];
    schools.value = schoolResult.status === 'fulfilled' ? schoolResult.value.data || [] : [];
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this user.');
  } finally {
    loading.value = false;
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    await updateUser(route.params.id, payload);
    await router.push({ name: 'user-detail', params: { id: route.params.id }, query: { updated: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to update user.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'user-detail', params: { id: route.params.id } });
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
      <button type="button" class="text-sm text-navy-800 hover:underline" @click="onCancel">← Back to user</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
      Loading user…
    </p>
    <p
      v-else-if="!user"
      class="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm"
    >
      User not found.
    </p>
    <UserForm
      v-else
      :user="user"
      submit-label="Save changes"
      :submitting="submitting"
      :server-errors="serverErrors"
      :municipalities="municipalities"
      :schools="schools"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
