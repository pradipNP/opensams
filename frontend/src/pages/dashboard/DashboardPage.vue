<script setup>
import { onMounted, ref } from 'vue';
import KpiCard from '@/components/ui/KpiCard.vue';
import Alert from '@/components/ui/Alert.vue';
import { getKpis, getMunicipalityCount } from '@/api/dashboard.api';
import { formatNumber, errorMessage } from '@/utils/format';
import { useAuthStore } from '@/stores/auth.store';

const auth = useAuthStore();
const loading = ref(true);
const error = ref('');
const cards = ref({
  totalAssets: '—',
  activeAssets: '—',
  totalSchools: '—',
  totalMunicipalities: '—',
});

async function loadDashboard() {
  loading.value = true;
  error.value = '';

  try {
    const kpisResponse = await getKpis();
    const kpis = kpisResponse.data || {};

    cards.value.totalAssets = formatNumber(kpis.totalAssets);
    cards.value.activeAssets = formatNumber(kpis.activeAssets);
    cards.value.totalSchools = formatNumber(kpis.totalSchools);

    if (kpis.totalMunicipalities != null) {
      cards.value.totalMunicipalities = formatNumber(kpis.totalMunicipalities);
    } else {
      try {
        const municipalities = await getMunicipalityCount();
        cards.value.totalMunicipalities = formatNumber(municipalities.meta?.total || 0);
      } catch {
        cards.value.totalMunicipalities = auth.role === 'state_admin' ? '—' : '1';
      }
    }
  } catch (err) {
    error.value = errorMessage(err, 'Unable to load dashboard figures.');
  } finally {
    loading.value = false;
  }
}

onMounted(loadDashboard);
</script>

<template>
  <div>
    <p class="mb-6 text-sm text-slate-600">
      Scoped summary for {{ auth.user?.fullName }} ({{ auth.user?.roleName }}).
    </p>

    <Alert v-if="error" class="mb-6" :message="error" />

    <section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Total Assets" :value="cards.totalAssets" :loading="loading" />
      <KpiCard label="Active Assets" :value="cards.activeAssets" :loading="loading" />
      <KpiCard label="Total Schools" :value="cards.totalSchools" :loading="loading" />
      <KpiCard label="Total Municipalities" :value="cards.totalMunicipalities" :loading="loading" />
    </section>
  </div>
</template>
