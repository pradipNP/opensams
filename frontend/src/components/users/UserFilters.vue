<script setup>
import { onBeforeUnmount, ref, watch } from 'vue';

const props = defineProps({
  search: { type: String, default: '' },
  role: { type: String, default: '' },
  isActive: { type: String, default: '' },
});

const emit = defineEmits(['update:search', 'update:role', 'update:isActive', 'change', 'clear']);

const roles = [
  { value: 'state_admin', label: 'State Admin' },
  { value: 'municipal_officer', label: 'Municipal Officer' },
  { value: 'school_admin', label: 'School Admin' },
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
        <label for="user-search" class="mb-1 block text-sm font-medium text-slate-700">Search</label>
        <input
          id="user-search"
          v-model="searchDraft"
          type="search"
          placeholder="Name or email"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
        />
      </div>

      <div>
        <label for="user-role" class="mb-1 block text-sm font-medium text-slate-700">Role</label>
        <select
          id="user-role"
          :value="role"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          @change="onSelect('role', $event)"
        >
          <option value="">All roles</option>
          <option v-for="item in roles" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </div>

      <div>
        <label for="user-active" class="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select
          id="user-active"
          :value="isActive"
          class="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          @change="onSelect('isActive', $event)"
        >
          <option value="">All users</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
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
