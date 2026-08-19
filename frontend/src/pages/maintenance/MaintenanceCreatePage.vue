<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import MaintenanceForm from '@/components/maintenance/MaintenanceForm.vue';
import { createMaintenance } from '@/api/maintenance.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const router = useRouter();

const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    const response = await createMaintenance(payload);
    const id = response.data?.id;
    await router.push({ name: 'maintenance-detail', params: { id }, query: { created: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to create maintenance request.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'maintenance' });
}
</script>

<template>
  <div>
    <div class="mb-4">
      <button type="button" class="link-back" @click="onCancel">
        ← Back to maintenance
      </button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <MaintenanceForm :submitting="submitting" :server-errors="serverErrors" @submit="onSubmit" @cancel="onCancel" />
  </div>
</template>
