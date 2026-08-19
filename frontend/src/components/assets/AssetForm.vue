<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
  asset: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Save asset' },
  serverErrors: { type: Object, default: () => ({}) },
  categories: { type: Array, default: () => [] },
  statuses: { type: Array, default: () => [] },
  schools: { type: Array, default: () => [] },
  lockSchool: { type: Boolean, default: false },
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive(emptyForm());
const errors = reactive(emptyErrors());

watch(
  () => props.asset,
  (asset) => {
    applyAsset(asset);
  },
  { immediate: true }
);

function emptyForm() {
  return {
    name: '',
    categoryId: '',
    schoolId: '',
    statusId: '',
    department: '',
    location: '',
    purchaseDate: '',
    purchaseCost: '',
    warrantyExpiry: '',
    vendor: '',
    notes: '',
  };
}

function emptyErrors() {
  return {
    name: '',
    categoryId: '',
    schoolId: '',
    statusId: '',
    department: '',
    location: '',
    purchaseDate: '',
    purchaseCost: '',
    warrantyExpiry: '',
    vendor: '',
    notes: '',
  };
}

function applyAsset(asset) {
  const next = emptyForm();
  if (asset) {
    next.name = asset.name || '';
    next.categoryId = asset.category?.id || asset.categoryId || '';
    next.schoolId = asset.school?.id || asset.schoolId || '';
    next.statusId = asset.status?.id || asset.statusId || '';
    next.department = asset.department || '';
    next.location = asset.location || '';
    next.purchaseDate = asset.purchaseDate ? String(asset.purchaseDate).slice(0, 10) : '';
    next.purchaseCost = asset.purchaseCost == null || asset.purchaseCost === '' ? '' : String(asset.purchaseCost);
    next.warrantyExpiry = asset.warrantyExpiry ? String(asset.warrantyExpiry).slice(0, 10) : '';
    next.vendor = asset.vendor || '';
    next.notes = asset.notes || '';
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
    errors.name = 'Asset name is required.';
  } else if (name.length > 300) {
    errors.name = 'Asset name must be 300 characters or fewer.';
  }

  if (!form.categoryId) {
    errors.categoryId = 'Category is required.';
  }
  if (!form.schoolId) {
    errors.schoolId = 'School is required.';
  }
  if (!form.statusId) {
    errors.statusId = 'Status is required.';
  }
  if (form.department.trim().length > 100) {
    errors.department = 'Department must be 100 characters or fewer.';
  }
  if (form.location.trim().length > 200) {
    errors.location = 'Location must be 200 characters or fewer.';
  }
  if (form.vendor.trim().length > 200) {
    errors.vendor = 'Vendor must be 200 characters or fewer.';
  }

  if (form.purchaseCost !== '') {
    const cost = Number(form.purchaseCost);
    if (Number.isNaN(cost) || cost < 0) {
      errors.purchaseCost = 'Purchase cost must be 0 or greater.';
    }
  }

  return !Object.values(errors).some(Boolean);
}

function optional(value) {
  const trimmed = typeof value === 'string' ? value.trim() : value;
  return trimmed === '' || trimmed == null ? null : trimmed;
}

function buildPayload() {
  const payload = {
    name: form.name.trim(),
    categoryId: form.categoryId,
    schoolId: form.schoolId,
    statusId: form.statusId,
    department: optional(form.department),
    location: optional(form.location),
    purchaseDate: optional(form.purchaseDate),
    warrantyExpiry: optional(form.warrantyExpiry),
    vendor: optional(form.vendor),
    notes: optional(form.notes),
    purchaseCost: form.purchaseCost === '' ? null : Number(form.purchaseCost),
  };
  return payload;
}

function onSubmit() {
  if (!validate()) {
    return;
  }
  emit('submit', buildPayload());
}

defineExpose({ applyAsset, setSchoolId: (id) => { form.schoolId = id; } });
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-navy-950">Basic information</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="asset-name" class="mb-1 block text-sm font-medium text-slate-700">Asset name</label>
          <input
            id="asset-name"
            v-model="form.name"
            type="text"
            maxlength="300"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('name') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('name')" class="mt-1 text-xs text-red-700">{{ fieldError('name') }}</p>
        </div>

        <div>
          <label for="asset-category" class="mb-1 block text-sm font-medium text-slate-700">Category</label>
          <select
            id="asset-category"
            v-model="form.categoryId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('categoryId') ? 'border-red-400' : ''"
          >
            <option value="">Select category</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <p v-if="fieldError('categoryId')" class="mt-1 text-xs text-red-700">{{ fieldError('categoryId') }}</p>
        </div>

        <div>
          <label for="asset-status" class="mb-1 block text-sm font-medium text-slate-700">Status</label>
          <select
            id="asset-status"
            v-model="form.statusId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('statusId') ? 'border-red-400' : ''"
          >
            <option value="">Select status</option>
            <option v-for="status in statuses" :key="status.id" :value="status.id">
              {{ status.name }}
            </option>
          </select>
          <p v-if="fieldError('statusId')" class="mt-1 text-xs text-red-700">{{ fieldError('statusId') }}</p>
        </div>

        <div>
          <label for="asset-school" class="mb-1 block text-sm font-medium text-slate-700">School</label>
          <select
            id="asset-school"
            v-model="form.schoolId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700 disabled:bg-slate-50"
            :class="fieldError('schoolId') ? 'border-red-400' : ''"
            :disabled="lockSchool"
          >
            <option value="">Select school</option>
            <option v-for="school in schools" :key="school.id" :value="school.id">
              {{ school.name }}
            </option>
          </select>
          <p v-if="fieldError('schoolId')" class="mt-1 text-xs text-red-700">{{ fieldError('schoolId') }}</p>
        </div>

        <div>
          <label for="asset-department" class="mb-1 block text-sm font-medium text-slate-700">Department</label>
          <input
            id="asset-department"
            v-model="form.department"
            type="text"
            maxlength="100"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('department') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('department')" class="mt-1 text-xs text-red-700">{{ fieldError('department') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="asset-notes" class="mb-1 block text-sm font-medium text-slate-700">Description</label>
          <textarea
            id="asset-notes"
            v-model="form.notes"
            rows="3"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('notes') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('notes')" class="mt-1 text-xs text-red-700">{{ fieldError('notes') }}</p>
        </div>
      </div>
    </section>

    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-navy-950">Location and purchase</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="asset-location" class="mb-1 block text-sm font-medium text-slate-700">Location</label>
          <input
            id="asset-location"
            v-model="form.location"
            type="text"
            maxlength="200"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('location') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('location')" class="mt-1 text-xs text-red-700">{{ fieldError('location') }}</p>
        </div>

        <div>
          <label for="asset-cost" class="mb-1 block text-sm font-medium text-slate-700">Purchase cost</label>
          <input
            id="asset-cost"
            v-model="form.purchaseCost"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('purchaseCost') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('purchaseCost')" class="mt-1 text-xs text-red-700">{{ fieldError('purchaseCost') }}</p>
        </div>

        <div>
          <label for="asset-purchase-date" class="mb-1 block text-sm font-medium text-slate-700">Purchase date</label>
          <input
            id="asset-purchase-date"
            v-model="form.purchaseDate"
            type="date"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('purchaseDate') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('purchaseDate')" class="mt-1 text-xs text-red-700">{{ fieldError('purchaseDate') }}</p>
        </div>

        <div>
          <label for="asset-warranty" class="mb-1 block text-sm font-medium text-slate-700">Warranty expiry</label>
          <input
            id="asset-warranty"
            v-model="form.warrantyExpiry"
            type="date"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('warrantyExpiry') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('warrantyExpiry')" class="mt-1 text-xs text-red-700">{{ fieldError('warrantyExpiry') }}</p>
        </div>

        <div>
          <label for="asset-vendor" class="mb-1 block text-sm font-medium text-slate-700">Vendor</label>
          <input
            id="asset-vendor"
            v-model="form.vendor"
            type="text"
            maxlength="200"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('vendor') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('vendor')" class="mt-1 text-xs text-red-700">{{ fieldError('vendor') }}</p>
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
