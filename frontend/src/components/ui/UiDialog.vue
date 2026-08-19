<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';

const props = defineProps({
  open: { type: Boolean, default: false },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  submitting: { type: Boolean, default: false },
});

const emit = defineEmits(['close']);
const panel = ref(null);

function onKeydown(event) {
  if (event.key === 'Escape' && props.open && !props.submitting) {
    emit('close');
  }
}

function onOverlayClick() {
  if (!props.submitting) {
    emit('close');
  }
}

watch(
  () => props.open,
  async (open) => {
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      await nextTick();
      panel.value?.focus();
    }
  }
);

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <div
    v-if="open"
    class="dialog-overlay"
    role="presentation"
    @click.self="onOverlayClick"
  >
    <div
      ref="panel"
      class="dialog-panel"
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      aria-labelledby="dialog-title"
      :aria-describedby="description ? 'dialog-description' : undefined"
    >
      <h3 id="dialog-title" class="text-lg font-semibold text-navy-950">{{ title }}</h3>
      <p v-if="description" id="dialog-description" class="mt-1 text-sm text-slate-600">
        {{ description }}
      </p>
      <slot />
      <div class="mt-5 flex flex-wrap justify-end gap-2">
        <slot name="actions" />
      </div>
    </div>
  </div>
</template>
