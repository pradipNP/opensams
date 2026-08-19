<script setup>
import { computed, onMounted, ref } from 'vue';
import Alert from '@/components/ui/Alert.vue';
import { getCurrentUser } from '@/api/auth.api';
import { listMunicipalities, listSchools } from '@/api/lookup.api';
import { displayValue, errorMessage, formatAction, formatDateTime } from '@/utils/format';
import { useAppStore } from '@/stores/app.store';

const app = useAppStore();

const loading = ref(true);
const error = ref('');
const profile = ref(null);
const municipalityName = ref('—');
const schoolName = ref('—');

const initials = computed(() => {
  const parts = String(profile.value?.fullName || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) {
    return 'U';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
});

async function resolveNames(user) {
  municipalityName.value = '—';
  schoolName.value = '—';

  const tasks = [];
  if (user.schoolId) {
    tasks.push(
      listSchools({ page: 1, limit: 100 })
        .then((response) => {
          const school = (response.data || []).find((item) => item.id === user.schoolId);
          if (school) {
            schoolName.value = school.name || '—';
            if (school.municipalityName) {
              municipalityName.value = school.municipalityName;
            }
          }
        })
        .catch(() => {})
    );
  }

  if (user.municipalityId) {
    tasks.push(
      listMunicipalities({ page: 1, limit: 100 })
        .then((response) => {
          const municipality = (response.data || []).find((item) => item.id === user.municipalityId);
          if (municipality?.name) {
            municipalityName.value = municipality.name;
          }
        })
        .catch(() => {})
    );
  }

  await Promise.all(tasks);
}

async function loadProfile() {
  loading.value = true;
  error.value = '';
  try {
    const response = await getCurrentUser();
    profile.value = response.data || null;
    if (profile.value?.fullName) {
      app.setPageTitle('My profile');
    }
    if (profile.value) {
      await resolveNames(profile.value);
    }
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load your profile.');
    profile.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(loadProfile);
</script>

<template>
  <div>
    <div class="mb-4">
      <h2 class="text-lg font-semibold text-navy-950">My profile</h2>
      <p class="mt-1 text-sm text-slate-600">
        This is your signed-in account. Role, municipality, and school assignments can only be changed by a State
        Administrator.
      </p>
    </div>

    <Alert v-if="error" class="mb-4" :message="error" />

    <p v-if="loading" class="empty-panel">Loading profile…</p>
    <p v-else-if="!error && !profile" class="empty-panel">Profile not found.</p>

    <div v-else-if="profile" class="space-y-4">
      <section class="section-card p-6">
        <div class="flex items-start gap-4">
          <span
            class="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy-900 text-sm font-semibold text-white"
            aria-hidden="true"
          >
            {{ initials }}
          </span>
          <div class="min-w-0">
            <p class="text-lg font-semibold text-navy-950">{{ displayValue(profile.fullName) }}</p>
            <p class="text-sm text-slate-600">{{ displayValue(profile.roleName || formatAction(profile.role)) }}</p>
          </div>
        </div>

        <dl class="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Email</dt>
            <dd class="mt-1 text-sm break-all text-navy-950">{{ displayValue(profile.email) }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Role</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ displayValue(profile.roleName || formatAction(profile.role)) }}</dd>
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
            <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Last login</dt>
            <dd class="mt-1 text-sm text-navy-950">{{ formatDateTime(profile.lastLoginAt) }}</dd>
          </div>
        </dl>
      </section>

      <section class="section-card p-6">
        <h3 class="text-lg font-semibold text-navy-950">Permissions</h3>
        <ul v-if="profile.permissions?.length" class="mt-4 flex flex-wrap gap-2">
          <li
            v-for="permission in profile.permissions"
            :key="permission"
            class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700"
          >
            {{ permission }}
          </li>
        </ul>
        <p v-else class="mt-4 text-sm text-slate-500">No permissions listed.</p>
      </section>
    </div>
  </div>
</template>
