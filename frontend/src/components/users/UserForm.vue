<script setup>
import { computed, reactive, watch } from 'vue';

const ROLES = [
  { value: 'state_admin', label: 'State Admin' },
  { value: 'municipal_officer', label: 'Municipal Officer' },
  { value: 'school_admin', label: 'School Admin' },
];

const props = defineProps({
  user: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Save user' },
  serverErrors: { type: Object, default: () => ({}) },
  municipalities: { type: Array, default: () => [] },
  schools: { type: Array, default: () => [] },
});

const emit = defineEmits(['submit', 'cancel']);

const isEdit = computed(() => Boolean(props.user?.id));
const form = reactive(emptyForm());
const errors = reactive(emptyErrors());

watch(
  () => props.user,
  (user) => {
    applyUser(user);
  },
  { immediate: true }
);

watch(
  () => form.role,
  (role) => {
    if (role === 'state_admin') {
      form.municipalityId = '';
      form.schoolId = '';
    } else if (role === 'municipal_officer') {
      form.schoolId = '';
    }
  }
);

watch(
  () => form.schoolId,
  (schoolId) => {
    if (form.role !== 'school_admin') {
      return;
    }
    const school = props.schools.find((item) => item.id === schoolId);
    if (school?.municipalityId) {
      form.municipalityId = school.municipalityId;
    }
  }
);

const showMunicipality = computed(() => form.role === 'municipal_officer' || form.role === 'school_admin');
const showSchool = computed(() => form.role === 'school_admin');

const filteredSchools = computed(() => {
  if (!form.municipalityId) {
    return props.schools;
  }
  return props.schools.filter((school) => school.municipalityId === form.municipalityId);
});

const assignmentHint = computed(() => {
  if (form.role === 'state_admin') {
    return 'State admins are not assigned to a municipality or school.';
  }
  if (form.role === 'municipal_officer') {
    return 'Municipal officers must be assigned to a municipality and cannot have a school.';
  }
  return 'School admins must be assigned to a school. Municipality is taken from that school.';
});

function emptyForm() {
  return {
    fullName: '',
    email: '',
    password: '',
    role: 'school_admin',
    municipalityId: '',
    schoolId: '',
    isActive: true,
  };
}

function emptyErrors() {
  return {
    fullName: '',
    email: '',
    password: '',
    role: '',
    municipalityId: '',
    schoolId: '',
    isActive: '',
  };
}

function applyUser(user) {
  const next = emptyForm();
  if (user) {
    next.fullName = user.fullName || '';
    next.email = user.email || '';
    next.password = '';
    next.role = user.role || 'school_admin';
    next.municipalityId = user.municipalityId || '';
    next.schoolId = user.schoolId || '';
    next.isActive = user.isActive !== false;
  }
  Object.assign(form, next);
  Object.assign(errors, emptyErrors());
}

function fieldError(field) {
  return errors[field] || props.serverErrors[field] || '';
}

function validate() {
  Object.assign(errors, emptyErrors());

  const fullName = form.fullName.trim();
  if (!fullName) {
    errors.fullName = 'Full name is required.';
  } else if (fullName.length > 200) {
    errors.fullName = 'Full name must be 200 characters or fewer.';
  }

  const email = form.email.trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!ROLES.some((item) => item.value === form.role)) {
    errors.role = 'Role is invalid.';
  }

  if (!isEdit.value && !form.password) {
    errors.password = 'Password is required.';
  } else if (form.password && (form.password.length < 8 || form.password.length > 128)) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (form.role === 'municipal_officer' && !form.municipalityId) {
    errors.municipalityId = 'Municipality is required for municipal officers.';
  }

  if (form.role === 'school_admin' && !form.schoolId) {
    errors.schoolId = 'School is required for school admins.';
  }

  return !Object.values(errors).some(Boolean);
}

function buildPayload() {
  const payload = {
    fullName: form.fullName.trim(),
    email: form.email.trim().toLowerCase(),
    role: form.role,
  };

  if (form.password) {
    payload.password = form.password;
  }

  if (form.role === 'municipal_officer') {
    payload.municipalityId = form.municipalityId;
  }

  if (form.role === 'school_admin') {
    payload.schoolId = form.schoolId;
    if (form.municipalityId) {
      payload.municipalityId = form.municipalityId;
    }
  }

  if (isEdit.value) {
    payload.isActive = form.isActive === true || form.isActive === 'true';
  }

  return payload;
}

function onSubmit() {
  if (!validate()) {
    return;
  }
  emit('submit', buildPayload());
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-navy-950">Account</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="user-full-name" class="mb-1 block text-sm font-medium text-slate-700">Full name</label>
          <input
            id="user-full-name"
            v-model="form.fullName"
            type="text"
            maxlength="200"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('fullName') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('fullName')" class="mt-1 text-xs text-red-700">{{ fieldError('fullName') }}</p>
        </div>

        <div>
          <label for="user-email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input
            id="user-email"
            v-model="form.email"
            type="email"
            maxlength="200"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('email') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('email')" class="mt-1 text-xs text-red-700">{{ fieldError('email') }}</p>
        </div>

        <div>
          <label for="user-password" class="mb-1 block text-sm font-medium text-slate-700">
            {{ isEdit ? 'Password (optional)' : 'Password' }}
          </label>
          <input
            id="user-password"
            v-model="form.password"
            type="password"
            autocomplete="new-password"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('password') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('password')" class="mt-1 text-xs text-red-700">{{ fieldError('password') }}</p>
          <p v-else class="mt-1 text-xs text-slate-500">
            {{ isEdit ? 'Leave blank to keep the current password. Minimum 8 characters if changing.' : 'Minimum 8 characters.' }}
          </p>
        </div>
      </div>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-navy-950">Role and assignment</h2>
      <p class="mt-1 text-sm text-slate-600">{{ assignmentHint }}</p>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label for="user-role" class="mb-1 block text-sm font-medium text-slate-700">Role</label>
          <select
            id="user-role"
            v-model="form.role"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('role') ? 'border-red-400' : ''"
          >
            <option v-for="item in ROLES" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <p v-if="fieldError('role')" class="mt-1 text-xs text-red-700">{{ fieldError('role') }}</p>
        </div>

        <div v-if="isEdit">
          <label for="user-active" class="mb-1 block text-sm font-medium text-slate-700">Active status</label>
          <select
            id="user-active"
            v-model="form.isActive"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('isActive') ? 'border-red-400' : ''"
          >
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
          <p v-if="fieldError('isActive')" class="mt-1 text-xs text-red-700">{{ fieldError('isActive') }}</p>
        </div>

        <div v-if="showMunicipality">
          <label for="user-municipality" class="mb-1 block text-sm font-medium text-slate-700">Municipality</label>
          <select
            id="user-municipality"
            v-model="form.municipalityId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('municipalityId') ? 'border-red-400' : ''"
            :disabled="form.role === 'school_admin' && Boolean(form.schoolId)"
          >
            <option value="">Select municipality</option>
            <option v-for="municipality in municipalities" :key="municipality.id" :value="municipality.id">
              {{ municipality.name }}
            </option>
          </select>
          <p v-if="fieldError('municipalityId')" class="mt-1 text-xs text-red-700">{{ fieldError('municipalityId') }}</p>
        </div>

        <div v-if="showSchool">
          <label for="user-school" class="mb-1 block text-sm font-medium text-slate-700">School</label>
          <select
            id="user-school"
            v-model="form.schoolId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('schoolId') ? 'border-red-400' : ''"
          >
            <option value="">Select school</option>
            <option v-for="school in filteredSchools" :key="school.id" :value="school.id">
              {{ school.name }}
            </option>
          </select>
          <p v-if="fieldError('schoolId')" class="mt-1 text-xs text-red-700">{{ fieldError('schoolId') }}</p>
        </div>
      </div>
    </section>

    <div class="flex flex-wrap gap-3">
      <button
        type="submit"
        class="rounded-md bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? 'Saving…' : submitLabel }}
      </button>
      <button
        type="button"
        class="rounded-md border border-slate-200 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
