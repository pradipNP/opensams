<script setup>
defineProps({
  message: { type: String, required: true },
  variant: { type: String, default: 'error' },
});
</script>

<template>
  <div
    role="alert"
    class="rounded-md border px-3 py-2 text-sm"
    :class="{
      'border-emerald-200 bg-emerald-50 text-emerald-800': variant === 'success',
      'border-amber-200 bg-amber-50 text-amber-800': variant === 'warning',
      'border-red-200 bg-red-50 text-red-800': variant !== 'success' && variant !== 'warning',
    }"
  >
    {{ message }}
  </div>
</template>
