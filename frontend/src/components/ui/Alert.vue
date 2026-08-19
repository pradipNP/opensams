<script setup>
defineProps({
  message: { type: String, required: true },
  variant: { type: String, default: 'error' },
});
</script>

<template>
  <div
    class="rounded-md border px-3 py-2 text-sm"
    :class="
      variant === 'success'
        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
        : 'border-red-200 bg-red-50 text-red-800'
    "
  >
    {{ message }}
  </div>
</template>
