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
      class="rounded-md bg-navy-900 px-4 py-2 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="disabled || Boolean(exporting)"
      @click="emit('export', 'xlsx')"
    >
      {{ exporting === 'xlsx' ? 'Exporting XLSX…' : 'Export XLSX' }}
    </button>
    <button
      type="button"
      class="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
      :disabled="disabled || Boolean(exporting)"
      @click="emit('export', 'pdf')"
    >
      {{ exporting === 'pdf' ? 'Exporting PDF…' : 'Export PDF' }}
    </button>
  </div>
</template>
