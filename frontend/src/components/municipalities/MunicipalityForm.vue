<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  municipality: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Save municipality' },
  serverErrors: { type: Object, default: () => ({}) },
  provinces: { type: Array, default: () => [] },
});

const emit = defineEmits(['submit', 'cancel']);

const isEdit = computed(() => Boolean(props.municipality?.id));
const form = reactive(emptyForm());
const errors = reactive(emptyErrors());

watch(
  () => props.municipality,
  (municipality) => {
    applyMunicipality(municipality);
  },
  { immediate: true }
);

function emptyForm() {
  return {
    name: '',
    code: '',
    district: '',
    provinceId: '',
    isActive: true,
  };
}

function emptyErrors() {
  return {
    name: '',
    code: '',
    district: '',
    provinceId: '',
    isActive: '',
  };
}

function applyMunicipality(municipality) {
  const next = emptyForm();
  if (municipality) {
    next.name = municipality.name || '';
    next.code = municipality.code || '';
    next.district = municipality.district || '';
    next.provinceId = municipality.provinceId || '';
    next.isActive = municipality.isActive !== false;
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
  } else if (name.length > 200) {
    errors.name = 'Name must be 200 characters or fewer.';
  }

  const code = form.code.trim();
  if (!code) {
    errors.code = 'Code is required.';
  } else if (code.length > 10) {
    errors.code = 'Code must be 10 characters or fewer.';
  }

  const district = form.district.trim();
  if (!district) {
    errors.district = 'District is required.';
  } else if (district.length > 100) {
    errors.district = 'District must be 100 characters or fewer.';
  }

  if (!form.provinceId) {
    errors.provinceId = 'Province is required.';
  }

  return !Object.values(errors).some(Boolean);
}

function buildPayload() {
  const payload = {
    name: form.name.trim(),
    code: form.code.trim(),
    district: form.district.trim(),
    provinceId: form.provinceId,
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
      <h2 class="text-lg font-semibold text-navy-950">Municipality details</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="municipality-name" class="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input
            id="municipality-name"
            v-model="form.name"
            type="text"
            maxlength="200"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('name') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('name')" class="mt-1 text-xs text-red-700">{{ fieldError('name') }}</p>
        </div>

        <div>
          <label for="municipality-code" class="mb-1 block text-sm font-medium text-slate-700">Code</label>
          <input
            id="municipality-code"
            v-model="form.code"
            type="text"
            maxlength="10"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('code') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('code')" class="mt-1 text-xs text-red-700">{{ fieldError('code') }}</p>
        </div>

        <div>
          <label for="municipality-district" class="mb-1 block text-sm font-medium text-slate-700">District</label>
          <input
            id="municipality-district"
            v-model="form.district"
            type="text"
            maxlength="100"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('district') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('district')" class="mt-1 text-xs text-red-700">{{ fieldError('district') }}</p>
        </div>

        <div>
          <label for="municipality-province" class="mb-1 block text-sm font-medium text-slate-700">Province</label>
          <select
            id="municipality-province"
            v-model="form.provinceId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('provinceId') ? 'border-red-400' : ''"
          >
            <option value="">Select province</option>
            <option v-for="province in provinces" :key="province.id" :value="province.id">
              {{ province.name }}
            </option>
          </select>
          <p v-if="fieldError('provinceId')" class="mt-1 text-xs text-red-700">{{ fieldError('provinceId') }}</p>
        </div>

        <div v-if="isEdit">
          <label for="municipality-active" class="mb-1 block text-sm font-medium text-slate-700">Active status</label>
          <select
            id="municipality-active"
            v-model="form.isActive"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('isActive') ? 'border-red-400' : ''"
          >
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
          <p v-if="fieldError('isActive')" class="mt-1 text-xs text-red-700">{{ fieldError('isActive') }}</p>
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
