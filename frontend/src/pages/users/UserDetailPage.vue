<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import Alert from '@/components/ui/Alert.vue';
import ErrorRetry from '@/components/ui/ErrorRetry.vue';
import StatusBadge from '@/components/ui/StatusBadge.vue';
import UserDeactivateDialog from '@/components/users/UserDeactivateDialog.vue';
import { deactivateUser, getUser } from '@/api/user.api';
import { listMunicipalities, listSchools } from '@/api/lookup.api';
import { displayValue, errorMessage, formatAction, formatDateTime } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const app = useAppStore();

const loading = ref(true);
const error = ref('');
const banner = ref('');
const user = ref(null);
const municipalities = ref([]);
const schools = ref([]);

const dialog = reactive({
  open: false,
  submitting: false,
  error: '',
});

const canWrite = computed(() => auth.hasPermission('users:write'));
const canDeactivate = computed(
  () => canWrite.value && user.value?.isActive && user.value?.id !== auth.user?.id
);

const municipalityName = computed(() => {
  if (!user.value?.municipalityId) {
    return '—';
  }
  return municipalities.value.find((item) => item.id === user.value.municipalityId)?.name || '—';
});

const schoolName = computed(() => {
  if (!user.value?.schoolId) {
    return '—';
  }
  return schools.value.find((item) => item.id === user.value.schoolId)?.name || '—';
});

async function loadUser(id) {
  loading.value = true;
  error.value = '';
  user.value = null;
  try {
    const response = await getUser(id);
    user.value = response.data || null;
    if (user.value?.fullName) {
      app.setPageTitle(user.value.fullName);
    }

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

function openDeactivate() {
  dialog.open = true;
  dialog.error = '';
}

function closeDeactivate() {
  dialog.open = false;
  dialog.error = '';
  dialog.submitting = false;
}

async function onConfirmDeactivate() {
  if (!user.value) {
    return;
  }
  dialog.submitting = true;
  dialog.error = '';
  try {
    await deactivateUser(user.value.id);
    banner.value = 'User has been deactivated.';
    closeDeactivate();
    await loadUser(user.value.id);
  } catch (err) {
    dialog.error = errorMessage(err, 'Unable to deactivate this user.');
    dialog.submitting = false;
  }
}

onMounted(() => {
  if (route.query.created === '1') {
    banner.value = 'User created successfully.';
    router.replace({ name: 'user-detail', params: { id: route.params.id } });
  } else if (route.query.updated === '1') {
    banner.value = 'User updated successfully.';
    router.replace({ name: 'user-detail', params: { id: route.params.id } });
  }
  loadUser(route.params.id);
});

watch(
  () => route.params.id,
  (id, previous) => {
    if (id && id !== previous) {
      banner.value = '';
      loadUser(id);
    }
  }
);
</script>

<template>
  <div>
    <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
      <RouterLink :to="{ name: 'users' }" class="link-back">← Back to users</RouterLink>
      <div v-if="user" class="flex flex-wrap gap-2">
        <RouterLink
          v-if="canWrite"
          :to="{ name: 'user-edit', params: { id: user.id } }"
          class="btn btn-primary"
        >
          Edit
        </RouterLink>
        <button
          v-if="canDeactivate"
          type="button"
          class="btn btn-danger-outline"
          @click="openDeactivate"
        >
          Deactivate
        </button>
      </div>
    </div>

    <Alert v-if="banner" class="mb-4" variant="success" :message="banner" />
    <ErrorRetry
      v-if="error"
      class="mb-4"
      :message="error"
      :loading="loading"
      @retry="loadUser(route.params.id)"
    />

    <p v-if="loading" class="empty-panel">
      Loading user…
    </p>
    <p
      v-else-if="!error && !user"
      class="empty-panel"
    >
      User not found.
    </p>

    <div v-else-if="user" class="space-y-4">
      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">User information</h2>
        <dl class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Full name</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(user.fullName) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Email</dt>
            <dd class="mt-1 text-sm break-all text-navy-950">{{ displayValue(user.email) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Role</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(user.roleName || formatAction(user.role)) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Active status</dt>
            <dd class="mt-1">
              <StatusBadge :active="user.isActive" />
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Municipality</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ municipalityName }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">School</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ schoolName }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Created</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDateTime(user.createdAt) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Last login</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDateTime(user.lastLoginAt) }}</dd>
          </div>
        </dl>
      </section>

      <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h2 class="text-lg font-semibold text-navy-950">Permissions</h2>
        <ul v-if="user.permissions?.length" class="mt-4 flex flex-wrap gap-2">
          <li
            v-for="permission in user.permissions"
            :key="permission"
            class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
          >
            {{ permission }}
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-slate-500">No permissions listed.</p>
      </section>
    </div>

    <UserDeactivateDialog
      :open="dialog.open"
      :user="user"
      :submitting="dialog.submitting"
      :error="dialog.error"
      @close="closeDeactivate"
      @confirm="onConfirmDeactivate"
    />
  </div>
</template>
