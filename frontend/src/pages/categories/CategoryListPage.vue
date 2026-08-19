<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import CategoryTable from '@/components/categories/CategoryTable.vue';
import { listCategories } from '@/api/lookup.api';
import { errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const banner = ref('');
const categories = ref([]);
const departments = ref([]);
const searchDraft = ref('');
let debounceId = null;

const filters = reactive({
  search: '',
  department: '',
});

const canWrite = computed(() => auth.hasPermission('categories:write'));

function listParams() {
  const params = {};
  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.department) {
    params.department = filters.department;
  }
  return params;
}

async function loadDepartments() {
  try {
    const response = await listCategories();
    const rows = response.data || [];
    departments.value = [...new Set(rows.map((item) => item.department).filter(Boolean))].sort();
  } catch {
    departments.value = [];
  }
}

async function loadCategories() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listCategories(listParams());
    categories.value = response.data || [];
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load categories.');
    categories.value = [];
  } finally {
    loading.value = false;
  }
}

watch(searchDraft, (value) => {
  if (value === filters.search) {
    return;
  }
  clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    filters.search = value;
    loadCategories();
  }, 350);
});

onBeforeUnmount(() => {
  clearTimeout(debounceId);
});

function onDepartmentChange(event) {
  filters.department = event.target.value;
  loadCategories();
}

function clearFilters() {
  clearTimeout(debounceId);
  searchDraft.value = '';
  filters.search = '';
  filters.department = '';
  loadCategories();
}

onMounted(async () => {
  if (route.query.created === '1') {
    banner.value = 'Category created successfully.';
    router.replace({ name: 'categories' });
  } else if (route.query.updated === '1') {
    banner.value = 'Category updated successfully.';
    router.replace({ name: 'categories' });
  }
  await loadDepartments();
  await loadCategories();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">Asset categories for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).</p>
      <RouterLink
        v-if="canWrite"
        :to="{ name: 'category-create' }"
        class="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800"
      >
        Create category
      </RouterLink>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <Alert v-if="error" class="mb-4" :message="error" />

    <section class="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div class="md:col-span-2">
          <label for="category-search" class="mb-1 block text-sm font-medium text-slate-700">Search</label>
          <input
            id="category-search"
            v-model="searchDraft"
            type="search"
            placeholder="Name or description"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          />
        </div>
        <div>
          <label for="category-department" class="mb-1 block text-sm font-medium text-slate-700">Department</label>
          <select
            id="category-department"
            :value="filters.department"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            @change="onDepartmentChange"
          >
            <option value="">All departments</option>
            <option v-for="item in departments" :key="item" :value="item">{{ item }}</option>
          </select>
        </div>
      </div>
      <div class="mt-3 flex justify-end">
        <button
          type="button"
          class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
          @click="clearFilters"
        >
          Clear filters
        </button>
      </div>
    </section>

    <CategoryTable :categories="categories" :loading="loading" :can-write="canWrite" />
  </div>
</template>
