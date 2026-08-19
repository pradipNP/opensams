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
        <label for="email" class="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="username"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          :class="errors.email ? 'border-red-400' : ''"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-red-700">{{ errors.email }}</p>
      </div>

      <div>
        <label for="password" class="mb-1 block text-sm font-medium text-slate-700">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          class="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-navy-700"
          :class="errors.password ? 'border-red-400' : ''"
        />
        <p v-if="errors.password" class="mt-1 text-xs text-red-700">{{ errors.password }}</p>
      </div>

      <button
        type="submit"
        class="w-full rounded-md bg-navy-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-navy-800 disabled:cursor-not-allowed disabled:opacity-60"
        :disabled="auth.loading"
      >
        {{ auth.loading ? 'Signing in…' : 'Sign in' }}
      </button>
    </form>
  </AuthLayout>
</template>
