<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  search: { type: String, default: '' },
  categoryId: { type: String, default: '' },
  statusId: { type: String, default: '' },
  municipalityId: { type: String, default: '' },
  schoolId: { type: String, default: '' },
  categories: { type: Array, default: () => [] },
  statuses: { type: Array, default: () => [] },
  municipalities: { type: Array, default: () => [] },
  schools: { type: Array, default: () => [] },
  showMunicipality: { type: Boolean, default: false },
  showSchool: { type: Boolean, default: true },
});

const emit = defineEmits(['update:search', 'update:categoryId', 'update:statusId', 'update:municipalityId', 'update:schoolId', 'change', 'clear']);

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
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
      <div class="md:col-span-2">
        <label for="asset-search" class="mb-1 block text-sm font-medium text-slate-700">Search</label>
        <input
          id="asset-search"
          v-model="searchDraft"
          type="search"
          placeholder="Tag, name, or vendor"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
        />
      </div>

      <div>
        <label for="asset-category" class="mb-1 block text-sm font-medium text-slate-700">Category</label>
        <select
          id="asset-category"
          :value="categoryId"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          @change="onSelect('categoryId', $event)"
        >
          <option value="">All categories</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.name }}
          </option>
        </select>
      </div>

      <div>
        <label for="asset-status" class="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select
          id="asset-status"
          :value="statusId"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          @change="onSelect('statusId', $event)"
        >
          <option value="">All statuses</option>
          <option v-for="status in statuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>

      <div v-if="showMunicipality">
        <label for="asset-municipality" class="mb-1 block text-sm font-medium text-slate-700">Municipality</label>
        <select
          id="asset-municipality"
          :value="municipalityId"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          @change="onSelect('municipalityId', $event)"
        >
          <option value="">All municipalities</option>
          <option v-for="municipality in municipalities" :key="municipality.id" :value="municipality.id">
            {{ municipality.name }}
          </option>
        </select>
      </div>

      <div v-if="showSchool">
        <label for="asset-school" class="mb-1 block text-sm font-medium text-slate-700">School</label>
        <select
          id="asset-school"
          :value="schoolId"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
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
        class="rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        @click="onClear"
      >
        Clear filters
      </button>
    </div>
  </section>
</template>
