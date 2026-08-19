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
      <aside class="hidden bg-navy-950 px-10 py-12 text-slate-100 lg:flex lg:flex-col lg:justify-between">
        <div>
          <p class="text-xs font-semibold tracking-[0.2em] text-slate-400 uppercase">Government of Nepal</p>
          <h1 class="mt-6 text-3xl font-semibold tracking-tight">SAMS Nepal</h1>
          <p class="mt-3 max-w-sm text-sm leading-6 text-slate-300">
            School Asset Management System for municipalities and public schools.
          </p>
        </div>
        <p class="text-xs text-slate-500">Authorized personnel only</p>
      </aside>

      <main class="flex items-center justify-center px-4 py-10 sm:px-8">
        <div class="w-full max-w-md">
          <div class="mb-8 lg:hidden">
            <p class="text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">Government of Nepal</p>
            <h1 class="mt-2 text-2xl font-semibold text-navy-950">SAMS Nepal</h1>
          </div>
          <section class="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <h2 class="text-lg font-semibold text-navy-950">{{ title }}</h2>
            <slot />
          </section>
        </div>
      </main>
    </div>
  </div>
</template>
