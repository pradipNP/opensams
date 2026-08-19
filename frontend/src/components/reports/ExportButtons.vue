<script setup>
defineProps({
  exporting: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(['export']);
</script>

<template>
  <div class="flex flex-wrap gap-2">
    <button
      type="button"
      class="btn btn-primary"
      :disabled="disabled || Boolean(exporting)"
      @click="emit('export', 'xlsx')"
    >
      {{ exporting === 'xlsx' ? 'Exporting XLSX…' : 'Export XLSX' }}
    </button>
    <button
      type="button"
      class="btn btn-secondary"
      :disabled="disabled || Boolean(exporting)"
      @click="emit('export', 'pdf')"
    >
      {{ exporting === 'pdf' ? 'Exporting PDF…' : 'Export PDF' }}
    </button>
  </div>
</template>
