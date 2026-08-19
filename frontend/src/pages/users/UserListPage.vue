<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import UserFilters from '@/components/users/UserFilters.vue';
import UserTable from '@/components/users/UserTable.vue';
import UserDeactivateDialog from '@/components/users/UserDeactivateDialog.vue';
import { deactivateUser, listUsers } from '@/api/user.api';
import { listMunicipalities, listSchools } from '@/api/lookup.api';
import { errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();

const loading = ref(true);
const error = ref('');
const banner = ref('');
const users = ref([]);
const meta = ref({ page: 1, limit: 20, total: 0, totalPages: 0 });
const page = ref(1);
const limit = ref(20);
const municipalities = ref([]);
const schools = ref([]);

const filters = reactive({
  search: '',
  role: '',
  isActive: '',
});

const dialog = reactive({
  open: false,
  target: null,
  submitting: false,
  error: '',
});

const canWrite = computed(() => auth.hasPermission('users:write'));

const municipalityNames = computed(() =>
  Object.fromEntries(municipalities.value.map((item) => [item.id, item.name]))
);

const schoolNames = computed(() => Object.fromEntries(schools.value.map((item) => [item.id, item.name])));

function listParams() {
  const params = {
    page: page.value,
    limit: limit.value,
  };
  if (filters.search.trim()) {
    params.search = filters.search.trim();
  }
  if (filters.role) {
    params.role = filters.role;
  }
  if (filters.isActive) {
    params.isActive = filters.isActive;
  }
  return params;
}

async function loadLookups() {
  const [municipalityResult, schoolResult] = await Promise.allSettled([
    listMunicipalities({ page: 1, limit: 100 }),
    listSchools({ page: 1, limit: 100 }),
  ]);
  municipalities.value =
    municipalityResult.status === 'fulfilled' ? municipalityResult.value.data || [] : [];
  schools.value = schoolResult.status === 'fulfilled' ? schoolResult.value.data || [] : [];
}

async function loadUsers() {
  loading.value = true;
  error.value = '';
  try {
    const response = await listUsers(listParams());
    users.value = response.data || [];
    meta.value = response.meta || { page: page.value, limit: limit.value, total: 0, totalPages: 0 };
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load users.');
    users.value = [];
    meta.value = { page: 1, limit: limit.value, total: 0, totalPages: 0 };
  } finally {
    loading.value = false;
  }
}

function onFiltersChange() {
  page.value = 1;
  loadUsers();
}

function clearFilters() {
  filters.search = '';
  filters.role = '';
  filters.isActive = '';
  page.value = 1;
  loadUsers();
}

function onPage(nextPage) {
  page.value = nextPage;
  loadUsers();
}

function openDeactivate(user) {
  dialog.open = true;
  dialog.target = user;
  dialog.error = '';
}

function closeDeactivate() {
  dialog.open = false;
  dialog.target = null;
  dialog.error = '';
  dialog.submitting = false;
}

async function onConfirmDeactivate() {
  if (!dialog.target) {
    return;
  }
  dialog.submitting = true;
  dialog.error = '';
  try {
    await deactivateUser(dialog.target.id);
    banner.value = `${dialog.target.fullName} has been deactivated.`;
    closeDeactivate();
    await loadUsers();
  } catch (err) {
    dialog.error = errorMessage(err, 'Unable to deactivate this user.');
    dialog.submitting = false;
  }
}

onMounted(async () => {
  await loadLookups();
  await loadUsers();
});
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm text-slate-600">User accounts for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).</p>
      <RouterLink
        v-if="canWrite"
        :to="{ name: 'user-create' }"
        class="btn btn-primary"
      >
        Create user
      </RouterLink>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <Alert v-if="error" class="mb-4" :message="error" />

    <UserFilters
      v-model:search="filters.search"
      v-model:role="filters.role"
      v-model:is-active="filters.isActive"
      class="mb-4"
      @change="onFiltersChange"
      @clear="clearFilters"
    />

    <UserTable
      :users="users"
      :meta="meta"
      :loading="loading"
      :can-write="canWrite"
      :current-user-id="auth.user?.id || ''"
      :municipality-names="municipalityNames"
      :school-names="schoolNames"
      @page="onPage"
      @deactivate="openDeactivate"
    />

    <UserDeactivateDialog
      :open="dialog.open"
      :user="dialog.target"
      :submitting="dialog.submitting"
      :error="dialog.error"
      @close="closeDeactivate"
      @confirm="onConfirmDeactivate"
    />
  </div>
</template>
