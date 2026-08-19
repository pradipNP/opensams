<script setup>
import { computed, reactive, watch } from 'vue';

const props = defineProps({
  category: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  submitLabel: { type: String, default: 'Save category' },
  serverErrors: { type: Object, default: () => ({}) },
  departments: { type: Array, default: () => [] },
});

const emit = defineEmits(['submit', 'cancel']);

const isEdit = computed(() => Boolean(props.category?.id));
const form = reactive(emptyForm());
const errors = reactive(emptyErrors());

watch(
  () => props.category,
  (category) => {
    applyCategory(category);
  },
  { immediate: true }
);

function emptyForm() {
  return {
    name: '',
    department: '',
    description: '',
    isActive: true,
  };
}

function emptyErrors() {
  return {
    name: '',
    department: '',
    description: '',
    isActive: '',
  };
}

function applyCategory(category) {
  const next = emptyForm();
  if (category) {
    next.name = category.name || '';
    next.department = category.department || '';
    next.description = category.description || '';
    next.isActive = category.isActive !== false;
  }
  Object.assign(form, next);
  Object.assign(errors, emptyErrors());
}

function fieldError(field) {
  return errors[field] || props.serverErrors[field] || '';
}

function validate() {
  Object.assign(errors, emptyErrors());

  const name = form.name.trim();
  if (!name) {
    errors.name = 'Name is required.';
  } else if (name.length > 100) {
    errors.name = 'Name must be 100 characters or fewer.';
  }

  const department = form.department.trim();
  if (!department) {
    errors.department = 'Department is required.';
  } else if (department.length > 100) {
    errors.department = 'Department must be 100 characters or fewer.';
  }

  return !Object.values(errors).some(Boolean);
}

function buildPayload() {
  const payload = {
    name: form.name.trim(),
    department: form.department.trim(),
    description: form.description.trim() || null,
  };
  if (isEdit.value) {
    payload.isActive = form.isActive === true || form.isActive === 'true';
  }
  return payload;
}

function onSubmit() {
  if (!validate()) {
    return;
  }
  emit('submit', buildPayload());
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="onSubmit">
    <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <h2 class="text-lg font-semibold text-navy-950">Category details</h2>
      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <label for="category-name" class="field-label field-required">Name</label>
          <input
            id="category-name"
            v-model="form.name"
            type="text"
            maxlength="100"
            class="field-control"
            :class="fieldError('name') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('name'))"
          />
          <p v-if="fieldError('name')" class="field-error">{{ fieldError('name') }}</p>
        </div>

        <div>
          <label for="category-department" class="field-label field-required">Department</label>
          <input
            id="category-department"
            v-model="form.department"
            type="text"
            maxlength="100"
            list="category-department-options"
            class="field-control"
            :class="fieldError('department') ? 'field-invalid' : ''"
            :aria-invalid="Boolean(fieldError('department'))"
          />
          <datalist id="category-department-options">
            <option v-for="item in departments" :key="item" :value="item" />
          </datalist>
          <p v-if="fieldError('department')" class="field-error">{{ fieldError('department') }}</p>
        </div>

        <div v-if="isEdit">
          <label for="category-active" class="field-label">Active status</label>
          <select
            id="category-active"
            v-model="form.isActive"
            class="field-control"
            :class="fieldError('isActive') ? 'field-invalid' : ''"
          >
            <option :value="true">Active</option>
            <option :value="false">Inactive</option>
          </select>
          <p v-if="fieldError('isActive')" class="field-error">{{ fieldError('isActive') }}</p>
        </div>

        <div class="md:col-span-2">
          <label for="category-description" class="field-label">Description</label>
          <textarea
            id="category-description"
            v-model="form.description"
            rows="3"
            class="field-control"
            :class="fieldError('description') ? 'field-invalid' : ''"
          />
          <p v-if="fieldError('description')" class="field-error">{{ fieldError('description') }}</p>
        </div>
      </div>
    </section>

    <div class="flex flex-wrap gap-3">
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="submitting"
      >
        {{ submitting ? 'Saving…' : submitLabel }}
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
