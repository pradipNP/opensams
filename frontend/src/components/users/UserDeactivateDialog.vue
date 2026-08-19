<script setup>
import { computed } from 'vue';
import Alert from '@/components/ui/Alert.vue';
import UiDialog from '@/components/ui/UiDialog.vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  user: { type: Object, default: null },
  submitting: { type: Boolean, default: false },
  error: { type: String, default: '' },
});

const emit = defineEmits(['close', 'confirm']);

const displayName = computed(() => props.user?.fullName || props.user?.email || 'this user');
</script>

<template>
  <UiDialog
    :open="open"
    title="Deactivate user"
    :description="`Deactivate ${displayName}? They will no longer be able to sign in. You can reactivate the account later from Edit user.`"
    :submitting="submitting"
    @close="emit('close')"
  >
    <Alert v-if="error" class="mt-3" :message="error" />
    <template #actions>
      <button type="button" class="btn btn-secondary" :disabled="submitting" @click="emit('close')">Cancel</button>
      <button type="button" class="btn btn-danger" :disabled="submitting" @click="emit('confirm')">
        {{ submitting ? 'Working…' : 'Deactivate' }}
      </button>
    </template>
  </UiDialog>
</template>
