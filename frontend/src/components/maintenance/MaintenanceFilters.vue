<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  search: { type: String, default: '' },
  status: { type: String, default: '' },
  schoolId: { type: String, default: '' },
  schools: { type: Array, default: () => [] },
  showSchool: { type: Boolean, default: false },
});

const emit = defineEmits(['update:search', 'update:status', 'update:schoolId', 'change', 'clear']);

const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
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
  emit(`update:${field}`, event.target.value);
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
        <label for="maintenance-search" class="field-label">Search</label>
        <input
          id="maintenance-search"
          v-model="searchDraft"
          type="search"
          placeholder="Description, asset tag, or name"
          class="field-control"
        />
      </div>

      <div>
        <label for="maintenance-status" class="field-label">Status</label>
        <select
          id="maintenance-status"
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

      <div v-if="showSchool">
        <label for="maintenance-school" class="field-label">School</label>
        <select
          id="maintenance-school"
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
