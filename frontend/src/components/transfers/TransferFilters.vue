<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: '' },
  municipalityId: { type: String, default: '' },
  schoolId: { type: String, default: '' },
  municipalities: { type: Array, default: () => [] },
  schools: { type: Array, default: () => [] },
  showMunicipality: { type: Boolean, default: false },
  showSchool: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:search',
  'update:status',
  'update:municipalityId',
  'update:schoolId',
  'change',
  'clear',
]);

const statuses = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

const searchDraft = ref(props.search);
let debounceId = null;

watch(
  () => props.search,
  (value) => {
    if (value !== searchDraft.value) {
      searchDraft.value = value;
    }
  }
);

watch(searchDraft, (value) => {
  if (value === props.search) {
    return;
  }
  clearTimeout(debounceId);
  debounceId = setTimeout(() => {
    emit('update:search', value);
    emit('change');
  }, 350);
});

onBeforeUnmount(() => {
  clearTimeout(debounceId);
});

function onSelect(field, event) {
  const value = event.target.value;
  emit(`update:${field}`, value);
  if (field === 'municipalityId') {
    emit('update:schoolId', '');
  }
  emit('change');
}

function onClear() {
  clearTimeout(debounceId);
  emit('clear');
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
      <div class="md:col-span-2">
        <label for="transfer-search" class="field-label">Search</label>
        <input
          id="transfer-search"
          v-model="searchDraft"
          type="search"
          placeholder="Reason, asset tag, name, or school"
          class="field-control"
        />
      </div>

      <div>
        <label for="transfer-status" class="field-label">Status</label>
        <select
          id="transfer-status"
          :value="status"
          class="field-control"
          @change="onSelect('status', $event)"
        >
          <option value="">All statuses</option>
          <option v-for="item in statuses" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div v-if="showMunicipality">
        <label for="transfer-municipality" class="field-label">Municipality</label>
        <select
          id="transfer-municipality"
          :value="municipalityId"
          class="field-control"
          @change="onSelect('municipalityId', $event)"
        >
          <option value="">All municipalities</option>
          <option v-for="municipality in municipalities" :key="municipality.id" :value="municipality.id">
            {{ municipality.name }}
          </option>
        </select>
      </div>

      <div v-if="showSchool">
        <label for="transfer-school" class="field-label">School</label>
        <select
          id="transfer-school"
          :value="schoolId"
          class="field-control"
          @change="onSelect('schoolId', $event)"
        >
          <option value="">All schools</option>
          <option v-for="school in schools" :key="school.id" :value="school.id">
            {{ school.name }}
          </option>
        </select>
      </div>
    </div>

    <div class="mt-3 flex justify-end">
      <button
        type="button"
        class="btn btn-secondary btn-sm"
        @click="onClear"
      >
        Clear filters
      </button>
    </div>
  </section>
</template>
