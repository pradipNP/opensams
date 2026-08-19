<script setup>
defineProps({
  message: { type: String, required: true },
});
</script>

<template>
  <div class="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
    {{ message }}
  </div>
</template>
