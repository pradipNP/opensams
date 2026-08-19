<script setup>
import Alert from '@/components/ui/Alert.vue';

defineProps({
  message: { type: String, required: true },
  loading: { type: Boolean, default: false },
});

defineEmits(['retry']);
</script>

<template>
  <div>
    <Alert :message="message" />
    <button
      type="button"
      class="btn btn-secondary btn-sm mt-2"
      :disabled="loading"
      @click="$emit('retry')"
    >
      {{ loading ? 'Loading…' : 'Retry' }}
    </button>
  </div>
</template>
