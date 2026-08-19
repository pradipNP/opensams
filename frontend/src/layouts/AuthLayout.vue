<script setup>
defineProps({
  title: {
    type: String,
    default: 'Sign in',
  },
});
</script>

<template>
  <div class="min-h-screen bg-slate-100">
    <div class="grid min-h-screen lg:grid-cols-[420px_1fr]">
      <aside class="hidden bg-navy-950 px-10 pt-12 pb-16 text-slate-100 lg:flex lg:flex-col">
        <div>
          <h1 class="mt-4 text-3xl font-semibold tracking-tight">School Asset Management System</h1>
          <p class="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Manage school assets across municipalities and schools through a centralized platform.
          </p>
          <ul class="mt-8 space-y-3 text-sm text-slate-200">
            <li class="flex gap-3">
              <span class="shrink-0 font-semibold text-slate-100" aria-hidden="true">✓</span>
              <span>Asset Registration</span>
            </li>
            <li class="flex gap-3">
              <span class="shrink-0 font-semibold text-slate-100" aria-hidden="true">✓</span>
              <span>Asset Tracking</span>
            </li>
            <li class="flex gap-3">
              <span class="shrink-0 font-semibold text-slate-100" aria-hidden="true">✓</span>
              <span>Maintenance Management</span>
            </li>
            <li class="flex gap-3">
              <span class="shrink-0 font-semibold text-slate-100" aria-hidden="true">✓</span>
              <span>Asset Transfers</span>
            </li>
            <li class="flex gap-3">
              <span class="shrink-0 font-semibold text-slate-100" aria-hidden="true">✓</span>
              <span>Reports &amp; Analytics</span>
            </li>
            <li class="flex gap-3">
              <span class="shrink-0 font-semibold text-slate-100" aria-hidden="true">✓</span>
              <span>Role-Based Access Control</span>
            </li>
          </ul>
        </div>
        <p class="mt-auto shrink-0 pt-8 text-xs text-slate-500">Authorized personnel only</p>
      </aside>

      <main class="flex items-center justify-center px-4 py-10 sm:px-8">
        <div class="w-full max-w-md">
          <div class="mb-8 text-center">
            <img
              src="/assets/logo.png"
              alt="SAMS Nepal"
              class="mx-auto h-24 w-24 object-contain"
              width="96"
              height="96"
            />
            <h1 class="mt-4 text-2xl font-semibold text-navy-950">SAMS Nepal</h1>
            <p class="mt-1 text-sm font-medium text-slate-600">School Asset Management System</p>
            <p class="mt-2 text-xs text-slate-500">Asset Tracking, Maintenance &amp; Transfer Management</p>
          </div>
          <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 class="text-lg font-semibold text-navy-950">{{ title }}</h2>
            <p class="mt-1 text-sm text-slate-500">Use your official SAMS Nepal account.</p>
            <slot />
          </section>
        </div>
      </main>
    </div>
  </div>
</template>
