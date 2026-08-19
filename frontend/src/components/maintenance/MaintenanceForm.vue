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
          <label for="maintenance-asset-search" class="field-label">
            Search assets
          </label>
          <input
            id="maintenance-asset-search"
            v-model="assetQuery"
            type="search"
            placeholder="Search by tag or name"
            class="field-control"
          />
          <p v-if="assetsLoading" class="field-hint">Searching assets…</p>
          <p v-else-if="assetsError" class="field-error">{{ assetsError }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="maintenance-asset" class="field-label field-required">Asset</label>
          <select
            id="maintenance-asset"
            v-model="form.assetId"
            class="field-control"
            :class="fieldError('assetId') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('assetId'))"
          >
            <option value="">Select asset</option>
            <option v-for="asset in assets" :key="asset.id" :value="asset.id">
              {{ asset.assetTag }} — {{ asset.name }}
            </option>
          </select>
          <p v-if="fieldError('assetId')" class="field-error">{{ fieldError('assetId') }}</p>
          <p v-else-if="!assetsLoading && !assets.length" class="field-hint">
            No assets found in your scope.
          </p>
        </div>

        <div>
          <label for="maintenance-priority" class="field-label field-required">Priority</label>
          <select
            id="maintenance-priority"
            v-model="form.priority"
            class="field-control"
            :class="fieldError('priority') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('priority'))"
          >
            <option v-for="item in priorities" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
          <p v-if="fieldError('priority')" class="field-error">{{ fieldError('priority') }}</p>
        </div>

        <div>
          <label for="maintenance-cost" class="field-label">Estimated cost</label>
          <input
            id="maintenance-cost"
            v-model="form.estimatedCost"
            type="number"
            min="0"
            step="0.01"
            class="field-control"
            :class="fieldError('estimatedCost') ? 'field-invalid' : ''"
          />
          <p v-if="fieldError('estimatedCost')" class="field-error">{{ fieldError('estimatedCost') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="maintenance-description" class="field-label field-required">
            Problem description
          </label>
          <textarea
            id="maintenance-description"
            v-model="form.description"
            rows="4"
            maxlength="4000"
            class="field-control"
            :class="fieldError('description') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('description'))"
          />
          <p v-if="fieldError('description')" class="field-error">{{ fieldError('description') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="maintenance-notes" class="field-label">Notes</label>
          <textarea
            id="maintenance-notes"
            v-model="form.notes"
            rows="3"
            class="field-control"
            :class="fieldError('notes') ? 'field-invalid' : ''"
          />
          <p v-if="fieldError('notes')" class="field-error">{{ fieldError('notes') }}</p>
        </div>
      </div>
    </section>

    <div class="flex flex-wrap gap-3">
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="submitting"
      >
        {{ submitting ? 'Submitting…' : 'Create request' }}
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
