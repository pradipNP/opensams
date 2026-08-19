<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  search: { type: String, default: '' },
  categoryId: { type: String, default: '' },
  statusId: { type: String, default: '' },
  status: { type: String, default: '' },
  municipalityId: { type: String, default: '' },
  schoolId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  assetStatuses: { type: Array, default: () => [] },
  statusOptions: { type: Array, default: () => [] },
  municipalities: { type: Array, default: () => [] },
  schools: { type: Array, default: () => [] },
  showSearch: { type: Boolean, default: false },
  showCategory: { type: Boolean, default: false },
  showStatusId: { type: Boolean, default: false },
  showStatus: { type: Boolean, default: false },
  showMunicipality: { type: Boolean, default: false },
  showSchool: { type: Boolean, default: false },
});

const emit = defineEmits([
  'update:search',
  'update:categoryId',
  'update:statusId',
  'update:status',
  'update:municipalityId',
  'update:schoolId',
  'change',
  'clear',
]);

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
      <div v-if="showSearch" class="md:col-span-2">
        <label for="report-search" class="field-label">Search</label>
        <input
          id="report-search"
          v-model="searchDraft"
          type="search"
          placeholder="Search report records"
          class="field-control"
        />
      </div>

      <div v-if="showCategory">
        <label for="report-category" class="field-label">Category</label>
        <select
          id="report-category"
          :value="categoryId"
          class="field-control"
          @change="onSelect('categoryId', $event)"
        >
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div v-if="showStatusId">
        <label for="report-status-id" class="field-label">Status</label>
        <select
          id="report-status-id"
          :value="statusId"
          class="field-control"
          @change="onSelect('statusId', $event)"
        >
          <option value="">All statuses</option>
          <option v-for="item in assetStatuses" :key="item.id" :value="item.id">
            {{ item.name }}
          </option>
        </select>
      </div>

      <div v-if="showStatus">
        <label for="report-status" class="field-label">Status</label>
        <select
          id="report-status"
          :value="status"
          class="field-control"
          @change="onSelect('status', $event)"
        >
          <option value="">All statuses</option>
          <option v-for="item in statusOptions" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div v-if="showMunicipality">
        <label for="report-municipality" class="field-label">Municipality</label>
        <select
          id="report-municipality"
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
        <label for="report-school" class="field-label">School</label>
        <select
          id="report-school"
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
