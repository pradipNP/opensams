<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import CategoryForm from '@/components/categories/CategoryForm.vue';
import { updateCategory } from '@/api/category.api';
import { listCategories } from '@/api/lookup.api';
import { errorMessage, fieldErrors } from '@/utils/format';

const route = useRoute();
const router = useRouter();

const loading = ref(true);
const submitting = ref(false);
const error = ref('');
const serverErrors = ref({});
const category = ref(null);
const departments = ref([]);

async function loadPage(id) {
  loading.value = true;
  error.value = '';
  category.value = null;
  try {
    const response = await listCategories();
    const rows = response.data || [];
    departments.value = [...new Set(rows.map((item) => item.department).filter(Boolean))].sort();
    category.value = rows.find((item) => item.id === id) || null;
    if (!category.value) {
      error.value = 'Category not found.';
    }
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load this category.');
  } finally {
    loading.value = false;
  }
}

async function onSubmit(payload) {
  submitting.value = true;
  error.value = '';
  serverErrors.value = {};
  try {
    await updateCategory(route.params.id, payload);
    await router.push({ name: 'categories', query: { updated: '1' } });
  } catch (err) {
    serverErrors.value = fieldErrors(err);
    error.value = errorMessage(err, 'Unable to update category.');
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  router.push({ name: 'categories' });
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
      <button type="button" class="link-back" @click="onCancel">← Back to categories</button>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="empty-panel">
      Loading category…
    </p>
    <p
      v-else-if="!category"
      class="empty-panel"
    >
      Category not found.
    </p>
    <CategoryForm
      v-else
      :category="category"
      submit-label="Save changes"
      :submitting="submitting"
      :server-errors="serverErrors"
      :departments="departments"
      @submit="onSubmit"
      @cancel="onCancel"
    />
  </div>
</template>
