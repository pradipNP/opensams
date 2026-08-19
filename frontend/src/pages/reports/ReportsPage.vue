<script setup>
import ReportCard from '@/components/reports/ReportCard.vue';

const reports = [
  {
    title: 'Inventory Report',
    description: 'Paginated asset inventory with category, status, municipality, and school filters.',
    to: { name: 'report-inventory' },
  },
  {
    title: 'Municipality Report',
    description: 'School counts, asset totals, and inventory value grouped by municipality.',
    to: { name: 'report-municipality' },
  },
  {
    title: 'School Report',
    description: 'Asset counts, inventory value, and maintenance figures for each school.',
    to: { name: 'report-school' },
  },
  {
    title: 'Maintenance Report',
    description: 'Paginated maintenance requests filtered by status and school.',
    to: { name: 'report-maintenance' },
  },
  {
    title: 'Transfer Report',
    description: 'Paginated asset transfers filtered by status, municipality, and school.',
    to: { name: 'report-transfers' },
  },
  {
    title: 'Summary Report',
    description: 'Scoped KPI snapshot with breakdowns by category, status, municipality, and transfers.',
    to: { name: 'report-summary' },
  },
];
</script>

<template>
  <div>
    <p class="mb-6 text-sm text-slate-600">
      Official reports for the current user scope. Each report can be exported as XLSX or PDF.
    </p>
    <section class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ReportCard
        v-for="report in reports"
        :key="report.title"
        :title="report.title"
        :description="report.description"
        :to="report.to"
      />
    </section>
  </div>
</template>
