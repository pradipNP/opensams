<script setup>
import { computed } from 'vue';
import { formatAction } from '@/utils/format';

const props = defineProps({
  status: { type: String, default: '' },
  label: { type: String, default: '' },
  color: { type: String, default: '' },
  active: { type: [Boolean, null], default: null },
});

const TONES = {
  active: 'badge-emerald',
  completed: 'badge-emerald',
  approved: 'badge-emerald',
  pending: 'badge-amber',
  draft: 'badge-slate',
  in_progress: 'badge-sky',
  under_maintenance: 'badge-sky',
  damaged: 'badge-amber',
  rejected: 'badge-red',
  cancelled: 'badge-red',
  disposed: 'badge-slate',
  lost: 'badge-red',
  inactive: 'badge-slate',
  'under-maintenance': 'badge-sky',
};

const text = computed(() => {
  if (props.label) {
    return props.label;
  }
  if (props.active === true) {
    return 'Active';
  }
  if (props.active === false) {
    return 'Inactive';
  }
  return formatAction(props.status);
});

const tone = computed(() => {
  if (props.active === true) {
    return 'badge-emerald';
  }
  if (props.active === false) {
    return 'badge-slate';
  }
  return TONES[String(props.status || '').toLowerCase()] || 'badge-slate';
});

const customStyle = computed(() => {
  if (!props.color) {
    return null;
  }
  return {
    color: props.color,
    backgroundColor: `${props.color}22`,
    borderColor: `${props.color}44`,
  };
});
</script>

<template>
  <span class="badge" :class="customStyle ? '' : tone" :style="customStyle || undefined">
    {{ text }}
  </span>
</template>
