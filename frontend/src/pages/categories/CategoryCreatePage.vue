<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import CategoryForm from '@/components/categories/CategoryForm.vue';
import { createCategory } from '@/api/category.api';
import { listCategories } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const router = useRouter();

const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const departments = ref([]);

async function loadDepartments() {
  try {
    const response = await listCategories();
    const rows = response.data || [];
    departments.value = [...new Set(rows.map((item) => item.department).filter(Boolean))].sort();
  } catch {
    departments.value = [];
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    await createCategory(payload);
    await router.push({ name: 'categories', query: { created: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to create category.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'categories' });
}

onMounted(loadDepartments);
</script>

<template>
  <div>
    <div class="mb-4">
      <button type="button" class="text-sm text-navy-800 hover:underline" @click="onCancel">← Back to categories</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <CategoryForm
      submit-label="Create category"
      :submitting="submitting"
      :server-errors="serverErrors"
      :departments="departments"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
