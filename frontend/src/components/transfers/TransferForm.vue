<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { listAssets } from '@/api/asset.api';
import { listSchools } from '@/api/lookup.api';
import { errorMessage } from '@/utils/format';

const props = defineProps({
  submitting: { type: Boolean, default: false },
  serverErrors: { type: Object, default: () => ({}) },
});

const emit = defineEmits(['submit', 'cancel']);

const form = reactive({
  assetId: '',
  toSchoolId: '',
  reason: '',
  notes: '',
});
const errors = reactive({
  assetId: '',
  toSchoolId: '',
  reason: '',
  notes: '',
});

const assetQuery = ref('');
const assets = ref([]);
const assetsLoading = ref(false);
const assetsError = ref('');
const schools = ref([]);
const schoolsLoading = ref(false);
const schoolsError = ref('');
let debounceId = null;

const selectedAsset = computed(() => assets.value.find((item) => item.id === form.assetId) || null);

const destinationSchools = computed(() => {
  const currentSchoolId = selectedAsset.value?.school?.id;
  return schools.value.filter((school) => school.id !== currentSchoolId);
});

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

async function loadSchools() {
  schoolsLoading.value = true;
  schoolsError.value = '';
  try {
    const response = await listSchools({ page: 1, limit: 100 });
    schools.value = (response.data || []).filter((item) => item.isActive !== false);
  } catch (err) {
    schools.value = [];
    schoolsError.value = errorMessage(err, 'Unable to load destination schools.');
  } finally {
    schoolsLoading.value = false;
  }
}

watch(assetQuery, () => {
  clearTimeout(debounceId);
  debounceId = setTimeout(loadAssets, 350);
});

watch(
  () => form.assetId,
  () => {
    if (selectedAsset.value && form.toSchoolId === selectedAsset.value.school?.id) {
      form.toSchoolId = '';
    }
  }
);

onBeforeUnmount(() => {
  clearTimeout(debounceId);
});

function validate() {
  errors.assetId = '';
  errors.toSchoolId = '';
  errors.reason = '';
  errors.notes = '';

  if (!form.assetId) {
    errors.assetId = 'Asset is required.';
  }
  if (!form.toSchoolId) {
    errors.toSchoolId = 'Destination school is required.';
  } else if (selectedAsset.value?.school?.id && form.toSchoolId === selectedAsset.value.school.id) {
    errors.toSchoolId = 'Transfer between the same school is not allowed.';
  }

  const reason = form.reason.trim();
  if (!reason) {
    errors.reason = 'Transfer reason is required.';
  } else if (reason.length > 4000) {
    errors.reason = 'Reason must be 4000 characters or fewer.';
  }

  return !Object.values(errors).some(Boolean);
}

function onSubmit() {
  if (!validate()) {
    return;
  }
  emit('submit', {
    assetId: form.assetId,
    toSchoolId: form.toSchoolId,
    reason: form.reason.trim(),
    notes: form.notes.trim() || null,
  });
}

onMounted(async () => {
  await Promise.all([loadAssets(), loadSchools()]);
});
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-navy-950">Transfer details</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div class="md:col-span-2">
          <label for="transfer-asset-search" class="field-label">Search assets</label>
          <input
            id="transfer-asset-search"
            v-model="assetQuery"
            type="search"
            placeholder="Search by tag or name"
            class="field-control"
          />
          <p v-if="assetsLoading" class="field-hint">Searching assets…</p>
          <p v-else-if="assetsError" class="field-error">{{ assetsError }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="transfer-asset" class="field-label field-required">Asset</label>
          <select
            id="transfer-asset"
            v-model="form.assetId"
            class="field-control"
            :class="fieldError('assetId') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('assetId'))"
          >
            <option value="">Select asset</option>
            <option v-for="asset in assets" :key="asset.id" :value="asset.id">
              {{ asset.assetTag }} — {{ asset.name }} ({{ asset.school?.name || 'Unknown school' }})
            </option>
          </select>
          <p v-if="fieldError('assetId')" class="field-error">{{ fieldError('assetId') }}</p>
          <p v-else-if="!assetsLoading && !assets.length" class="field-hint">
            No assets found in your scope.
          </p>
        </div>

        <div class="md:col-span-2">
          <label for="transfer-destination" class="field-label field-required">
            Destination school
          </label>
          <select
            id="transfer-destination"
            v-model="form.toSchoolId"
            class="field-control"
            :class="fieldError('toSchoolId') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('toSchoolId'))"
          >
            <option value="">Select destination school</option>
            <option v-for="school in destinationSchools" :key="school.id" :value="school.id">
              {{ school.name }}{{ school.municipalityName ? ` (${school.municipalityName})` : '' }}
            </option>
          </select>
          <p v-if="fieldError('toSchoolId')" class="field-error">{{ fieldError('toSchoolId') }}</p>
          <p v-else-if="schoolsLoading" class="field-hint">Loading schools…</p>
          <p v-else-if="schoolsError" class="field-error">{{ schoolsError }}</p>
          <p v-else-if="form.assetId && !destinationSchools.length" class="field-hint">
            No destination schools are available in the current API scope.
          </p>
        </div>

        <div class="md:col-span-2">
          <label for="transfer-reason" class="field-label field-required">Transfer reason</label>
          <textarea
            id="transfer-reason"
            v-model="form.reason"
            rows="4"
            maxlength="4000"
            class="field-control"
            :class="fieldError('reason') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('reason'))"
          />
          <p v-if="fieldError('reason')" class="field-error">{{ fieldError('reason') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="transfer-notes" class="field-label">Notes</label>
          <textarea
            id="transfer-notes"
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
        {{ submitting ? 'Submitting…' : 'Create transfer' }}
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
