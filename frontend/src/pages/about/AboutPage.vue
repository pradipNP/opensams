<script setup>
import { APP_FULL_NAME, APP_LOGO_SRC, APP_NAME, APP_VERSION } from '@/constants/app';

const modules = [
  'Dashboard',
  'Asset Management',
  'Maintenance Management',
  'Asset Transfers',
  'Reports & Analytics',
  'User Management',
  'Municipality Management',
  'School Management',
  'Category Management',
];
</script>

<template>
  <div class="space-y-4">
    <section class="section-card p-6">
      <div class="flex items-start gap-4">
        <img
          :src="APP_LOGO_SRC"
          :alt="APP_NAME"
          class="h-16 w-16 shrink-0 object-contain"
          width="64"
          height="64"
        />
        <div class="min-w-0">
          <h2 class="text-lg font-semibold text-navy-950">System overview</h2>
          <p class="mt-3 text-base font-semibold text-navy-950">{{ APP_NAME }}</p>
          <p class="mt-1 text-sm font-medium text-slate-600">{{ APP_FULL_NAME }}</p>
        </div>
      </div>
      <p class="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
        {{ APP_NAME }} is a centralized platform for tracking school assets, managing maintenance,
        recording asset transfers, producing operational reports, and administering users,
        municipalities, schools, and categories within a defined role scope.
      </p>
    </section>

    <section class="section-card p-6">
      <h2 class="text-lg font-semibold text-navy-950">Modules</h2>
      <ul class="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        <li
          v-for="moduleName in modules"
          :key="moduleName"
          class="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-navy-950"
        >
          {{ moduleName }}
        </li>
      </ul>
    </section>

    <section class="section-card p-6">
      <h2 class="text-lg font-semibold text-navy-950">Technology stack</h2>
      <dl class="mt-4 grid gap-6 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Frontend</dt>
          <dd class="mt-2 text-sm leading-6 text-navy-950">Vue 3, Vite, Pinia, Tailwind CSS</dd>
        </div>
        <div>
          <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Backend</dt>
          <dd class="mt-2 text-sm leading-6 text-navy-950">Node.js, Express</dd>
        </div>
        <div>
          <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Database</dt>
          <dd class="mt-2 text-sm leading-6 text-navy-950">PostgreSQL</dd>
        </div>
        <div>
          <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Security</dt>
          <dd class="mt-2 text-sm leading-6 text-navy-950">
            JWT Authentication, Role-Based Access Control (RBAC)
          </dd>
        </div>
      </dl>
    </section>

    <section class="section-card p-6">
      <h2 class="text-lg font-semibold text-navy-950">Version information</h2>
      <dl class="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Version</dt>
          <dd class="mt-1 text-sm text-navy-950">v{{ APP_VERSION }}</dd>
        </div>
        <div>
          <dt class="text-xs font-medium tracking-wide text-slate-500 uppercase">Powered by</dt>
          <dd class="mt-1 text-sm text-navy-950">{{ APP_NAME }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>
