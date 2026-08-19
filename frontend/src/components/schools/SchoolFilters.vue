<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  search: { type: String, default: '' },
  municipalityId: { type: String, default: '' },
  municipalities: { type: Array, default: () => [] },
  showMunicipality: { type: Boolean, default: false },
});

const emit = defineEmits(['update:search', 'update:municipalityId', 'change', 'clear']);

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

function onSelect(event) {
  emit('update:municipalityId', event.target.value);
  emit('change');
}

function onClear() {
  clearTimeout(debounceId);
  emit('clear');
}
</script>

<template>
  <section class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
    <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      <div class="md:col-span-2">
        <label for="school-search" class="mb-1 block text-sm font-medium text-slate-700">Search</label>
        <input
          id="school-search"
          v-model="searchDraft"
          type="search"
          placeholder="Name or school code"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
        />
      </div>

      <div v-if="showMunicipality">
        <label for="school-municipality" class="mb-1 block text-sm font-medium text-slate-700">Municipality</label>
        <select
          id="school-municipality"
          :value="municipalityId"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          @change="onSelect"
        >
          <option value="">All municipalities</option>
          <option v-for="municipality in municipalities" :key="municipality.id" :value="municipality.id">
            {{ municipality.name }}
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
