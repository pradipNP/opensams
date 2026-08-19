<script setup>
import { reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AuthLayout from '@/layouts/AuthLayout.vue';
import Alert from '@/components/ui/Alert.vue';
import { useAuthStore } from '@/stores/auth.store';
import { errorMessage } from '@/utils/format';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const form = reactive({
  email: '',
  password: '',
});
const errors = reactive({
  email: '',
  password: '',
});
const submitError = ref('');

function validate() {
  errors.email = '';
  errors.password = '';

  const email = form.email.trim();
  if (!email) {
    errors.email = 'Email is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Enter a valid email address.';
  }

  if (!form.password) {
    errors.password = 'Password is required.';
  }

  return !errors.email && !errors.password;
}

async function onSubmit() {
  submitError.value = '';
  if (!validate()) {
    return;
  }

  try {
    await auth.login(form.email.trim(), form.password);
    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
    await router.replace(redirect);
  } catch (error) {
    submitError.value = errorMessage(error, 'Invalid email or password');
  }
}
</script>

<template>
  <AuthLayout title="Sign in to your account">
    <form class="mt-6 space-y-4" @submit.prevent="onSubmit">
      <Alert v-if="submitError" :message="submitError" />

      <div>
        <label for="email" class="field-label field-required">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          class="field-control"
          :class="errors.email ? 'field-invalid' : ''"
          :aria-invalid="Boolean(errors.email)"
          autocomplete="username"
        />
        <p v-if="errors.email" class="field-error">{{ errors.email }}</p>
      </div>

      <div>
        <label for="password" class="field-label field-required">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          class="field-control"
          :class="errors.password ? 'field-invalid' : ''"
          :aria-invalid="Boolean(errors.password)"
          autocomplete="current-password"
        />
        <p v-if="errors.password" class="field-error">{{ errors.password }}</p>
      </div>

      <button
        type="submit"
        class="btn btn-primary w-full"
        :disabled="auth.loading"
        :aria-busy="auth.loading"
      >
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </AuthLayout>
</template>
