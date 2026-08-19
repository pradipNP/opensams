<script setup>
import { computed, reactive, watch } from 'vue';

const SCHOOL_TYPES = ['Secondary', 'Basic', 'Primary', 'Higher Secondary'];

const props = defineProps({
  school: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Save school' },
  serverErrors: { type: Object, default: () => ({}) },
  municipalities: { type: Array, default: () => [] },
});

const emit = defineEmits(['submit', 'cancel']);

const isEdit = computed(() => Boolean(props.school?.id));
const form = reactive(emptyForm());
const errors = reactive(emptyErrors());

watch(
  () => props.school,
  (school) => {
    applySchool(school);
  },
  { immediate: true }
);

function emptyForm() {
  return {
    name: '',
    schoolCode: '',
    schoolType: 'Secondary',
    municipalityId: '',
    address: '',
    isActive: true,
  };
}

function emptyErrors() {
  return {
    name: '',
    schoolCode: '',
    schoolType: '',
    municipalityId: '',
    address: '',
    isActive: '',
  };
}

function applySchool(school) {
  const next = emptyForm();
  if (school) {
    next.name = school.name || '';
    next.schoolCode = school.schoolCode || '';
    next.schoolType = school.schoolType || 'Secondary';
    next.municipalityId = school.municipality?.id || school.municipalityId || '';
    next.address = school.address || '';
    next.isActive = school.isActive !== false;
  }
  Object.assign(form, next);
  Object.assign(errors, emptyErrors());
}

function fieldError(field) {
  return errors[field] || props.serverErrors[field] || '';
}

function validate() {
  Object.assign(errors, emptyErrors());

  const name = form.name.trim();
  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length > 300) {
    errors.name = 'Name must be 300 characters or fewer.';
  }

  const schoolCode = form.schoolCode.trim();
  if (!schoolCode) {
    errors.schoolCode = 'School code is required.';
  } else if (schoolCode.length > 20) {
    errors.schoolCode = 'School code must be 20 characters or fewer.';
  }

  const schoolType = form.schoolType.trim();
  if (!schoolType) {
    errors.schoolType = 'School type is required.';
  } else if (schoolType.length > 50) {
    errors.schoolType = 'School type must be 50 characters or fewer.';
  }

  if (!form.municipalityId) {
    errors.municipalityId = 'Municipality is required.';
  }

  return !Object.values(errors).some(Boolean);
}

function buildPayload() {
  const payload = {
    name: form.name.trim(),
    schoolCode: form.schoolCode.trim(),
    schoolType: form.schoolType.trim(),
    municipalityId: form.municipalityId,
    address: form.address.trim() || null,
  };
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
      <h2 class="text-lg font-semibold text-navy-950">School details</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="school-name" class="field-label field-required">Name</label>
          <input
            id="school-name"
            v-model="form.name"
            type="text"
            maxlength="300"
            class="field-control"
            :class="fieldError('name') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('name'))"
          />
          <p v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</p>
        </div>

        <div>
          <label for="school-code" class="field-label field-required">School code</label>
          <input
            id="school-code"
            v-model="form.schoolCode"
            type="text"
            maxlength="20"
            class="field-control"
            :class="fieldError('schoolCode') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('schoolCode'))"
          />
          <p v-if="fieldError('schoolCode')" class="field-error">{{ fieldError('schoolCode') }}</p>
        </div>

        <div>
          <label for="school-type" class="field-label field-required">School type</label>
          <input
            id="school-type"
            v-model="form.schoolType"
            type="text"
            maxlength="50"
            list="school-type-options"
            class="field-control"
            :class="fieldError('schoolType') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('schoolType'))"
          />
          <datalist id="school-type-options">
            <option v-for="type in SCHOOL_TYPES" :key="type" :value="type" />
          </datalist>
          <p v-if="fieldError('schoolType')" class="field-error">{{ fieldError('schoolType') }}</p>
        </div>

        <div>
          <label for="school-municipality" class="field-label field-required">Municipality</label>
          <select
            id="school-municipality"
            v-model="form.municipalityId"
            class="field-control"
            :class="fieldError('municipalityId') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('municipalityId'))"
          >
            <option value="">Select municipality</option>
            <option v-for="municipality in municipalities" :key="municipality.id" :value="municipality.id">
              {{ municipality.name }}
            </option>
          </select>
          <p v-if="fieldError('municipalityId')" class="field-error">{{ fieldError('municipalityId') }}</p>
        </div>

        <div v-if="isEdit">
          <label for="school-active" class="field-label">Active status</label>
          <select
            id="school-active"
            v-model="form.isActive"
            class="field-control"
            :class="fieldError('isActive') ? 'field-invalid' : ''"
          >
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
          <p v-if="fieldError('isActive')" class="field-error">{{ fieldError('isActive') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="school-address" class="field-label">Address</label>
          <textarea
            id="school-address"
            v-model="form.address"
            rows="3"
            class="field-control"
            :class="fieldError('address') ? 'field-invalid' : ''"
          />
          <p v-if="fieldError('address')" class="field-error">{{ fieldError('address') }}</p>
        </div>
      </div>
    </section>

    <div class="flex flex-wrap gap-3">
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="submitting"
      >
        {{ submitting ? 'Saving…' : submitLabel }}
      </button>
      <button
        type="button"
        class="btn btn-secondary"
        :disabled="submitting"
        @click="emit('cancel')"
      >
        Cancel
      </button>
    </div>
  </form>
</template>
