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
        <label for="school-search" class="field-label">Search</label>
        <input
          id="school-search"
          v-model="searchDraft"
          type="search"
          placeholder="Name or school code"
          class="field-control"
        />
      </div>

      <div v-if="showMunicipality">
        <label for="school-municipality" class="field-label">Municipality</label>
        <select
          id="school-municipality"
          :value="municipalityId"
          class="field-control"
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
        class="btn btn-secondary btn-sm"
        @click="onClear"
      >
        Clear filters
      </button>
    </div>
  </section>
</template>
