<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { listAssets } from '@/api/asset.api';
import { errorMessage } from '@/utils/format';

const props = defineProps({
  submitting: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
  assetId: '',
  description: '',
  notes: '',
  priority: 'medium',
  estimatedCost: '',
});
const errors = reactive({
  assetId: '',
  description: '',
  notes: '',
  priority: '',
  estimatedCost: '',
});

const assetQuery = ref('');
const assets = ref([]);
const assetsLoading = ref(false);
const assetsError = ref('');
let debounceId = null;

const priorities = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function fieldError(field) {
  return errors[field] || props.serverErrors[field] || '';
}

async function loadAssets() {
  assetsLoading.value = true;
  assetsError.value = '';
  try {
    const params = { page: 1, limit: 20 };
    if (assetQuery.value.trim()) {
      params.search = assetQuery.value.trim();
    }
    const response = await listAssets(params);
    assets.value = response.data || [];
  } catch (err) {
    assets.value = [];
    assetsError.value = errorMessage(err, 'Unable to load assets.');
  } finally {
    assetsLoading.value = false;
  }
}

watch(assetQuery, () => {
  clearTimeout(debounceId);
  debounceId = setTimeout(loadAssets, 350);
});

onBeforeUnmount(() => {
  clearTimeout(debounceId);
});

function validate() {
  errors.assetId = '';
  errors.description = '';
  errors.notes = '';
  errors.priority = '';
  errors.estimatedCost = '';

  if (!form.assetId) {
    errors.assetId = 'Asset is required.';
  }

  const description = form.description.trim();
  if (!description) {
    errors.description = 'Problem description is required.';
  } else if (description.length > 4000) {
    errors.description = 'Description must be 4000 characters or fewer.';
  }

  if (!priorities.some((item) => item.value === form.priority)) {
    errors.priority = 'Priority must be low, medium, high, or critical.';
  }

  if (form.estimatedCost !== '') {
    const cost = Number(form.estimatedCost);
    if (Number.isNaN(cost) || cost < 0) {
      errors.estimatedCost = 'Estimated cost must be 0 or greater.';
    }
  }

  return !Object.values(errors).some(Boolean);
}

function onSubmit() {
  if (!validate()) {
    return;
  }

  const payload = {
    assetId: form.assetId,
    description: form.description.trim(),
    priority: form.priority,
  };
  payload.notes = form.notes.trim() || null;
  payload.estimatedCost = form.estimatedCost === '' ? null : Number(form.estimatedCost);
  emit('submit', payload);
}

onMounted(loadAssets);
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-navy-950">Request details</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="maintenance-asset-search" class="mb-1 block text-sm font-medium text-slate-700">
            Search assets
          </label>
          <input
            id="maintenance-asset-search"
            v-model="assetQuery"
            type="search"
            placeholder="Search by tag or name"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          />
          <p v-if="assetsLoading" class="mt-1 text-xs text-slate-500">Searching assets…</p>
          <p v-else-if="assetsError" class="mt-1 text-xs text-red-700">{{ assetsError }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="maintenance-asset" class="mb-1 block text-sm font-medium text-slate-700">Asset</label>
          <select
            id="maintenance-asset"
            v-model="form.assetId"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('assetId') ? 'border-red-400' : ''"
          >
            <option value="">Select asset</option>
            <option v-for="asset in assets" :key="asset.id" :value="asset.id">
              {{ asset.assetTag }} — {{ asset.name }}
            </option>
          </select>
          <p v-if="fieldError('assetId')" class="mt-1 text-xs text-red-700">{{ fieldError('assetId') }}</p>
          <p v-else-if="!assetsLoading && !assets.length" class="mt-1 text-xs text-slate-500">
            No assets found in your scope.
          </p>
        </div>

        <div>
          <label for="maintenance-priority" class="mb-1 block text-sm font-medium text-slate-700">Priority</label>
          <select
            id="maintenance-priority"
            v-model="form.priority"
            class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('priority') ? 'border-red-400' : ''"
          >
            <option v-for="item in priorities" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <p v-if="fieldError('priority')" class="mt-1 text-xs text-red-700">{{ fieldError('priority') }}</p>
        </div>

        <div>
          <label for="maintenance-cost" class="mb-1 block text-sm font-medium text-slate-700">Estimated cost</label>
          <input
            id="maintenance-cost"
            v-model="form.estimatedCost"
            type="number"
            min="0"
            step="0.01"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('estimatedCost') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('estimatedCost')" class="mt-1 text-xs text-red-700">{{ fieldError('estimatedCost') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="maintenance-description" class="mb-1 block text-sm font-medium text-slate-700">
            Problem description
          </label>
          <textarea
            id="maintenance-description"
            v-model="form.description"
            rows="4"
            maxlength="4000"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('description') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('description')" class="mt-1 text-xs text-red-700">{{ fieldError('description') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="maintenance-notes" class="mb-1 block text-sm font-medium text-slate-700">Notes</label>
          <textarea
            id="maintenance-notes"
            v-model="form.notes"
            rows="3"
            class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
            :class="fieldError('notes') ? 'border-red-400' : ''"
          />
          <p v-if="fieldError('notes')" class="mt-1 text-xs text-red-700">{{ fieldError('notes') }}</p>
        </div>
      </div>
    </section>

    <div class="flex flex-wrap gap-3">
      <button
        type="submit"
        class="rounded-md bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="submitting"
      >
        {{ submitting ? 'Submitting…' : 'Create request' }}
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
