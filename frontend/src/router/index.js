import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth.store';
import { useAppStore } from '@/stores/app.store';

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/pages/auth/LoginPage.vue'),
    meta: { guestOnly: true, layout: 'auth', title: 'Sign in' },
  },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'dashboard' } },
      {
        path: 'dashboard',
        name: 'dashboard',
        component: () => import('@/pages/dashboard/DashboardPage.vue'),
        meta: { requiresAuth: true, title: 'Dashboard' },
      },
      {
        path: 'assets',
        name: 'assets',
        component: () => import('@/pages/assets/AssetListPage.vue'),
        meta: { requiresAuth: true, title: 'Assets' },
      },
      {
        path: 'assets/create',
        name: 'asset-create',
        component: () => import('@/pages/assets/AssetCreatePage.vue'),
        meta: { requiresAuth: true, title: 'Create asset', permission: 'assets:write' },
      },
      {
        path: 'assets/:id/edit',
        name: 'asset-edit',
        component: () => import('@/pages/assets/AssetEditPage.vue'),
        meta: { requiresAuth: true, title: 'Edit asset', permission: 'assets:write' },
      },
      {
        path: 'assets/:id',
        name: 'asset-detail',
        component: () => import('@/pages/assets/AssetDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Asset details' },
      },
      {
        path: 'maintenance',
        name: 'maintenance',
        component: () => import('@/pages/maintenance/MaintenanceListPage.vue'),
        meta: { requiresAuth: true, title: 'Maintenance' },
      },
      {
        path: 'maintenance/create',
        name: 'maintenance-create',
        component: () => import('@/pages/maintenance/MaintenanceCreatePage.vue'),
        meta: { requiresAuth: true, title: 'Create maintenance request', permission: 'maintenance:request' },
      },
      {
        path: 'maintenance/:id',
        name: 'maintenance-detail',
        component: () => import('@/pages/maintenance/MaintenanceDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Maintenance request' },
      },
      {
        path: 'transfers',
        name: 'transfers',
        component: () => import('@/pages/transfers/TransferListPage.vue'),
        meta: { requiresAuth: true, title: 'Transfers' },
      },
      {
        path: 'transfers/create',
        name: 'transfer-create',
        component: () => import('@/pages/transfers/TransferCreatePage.vue'),
        meta: { requiresAuth: true, title: 'Create transfer', permission: 'transfers:request' },
      },
      {
        path: 'transfers/:id',
        name: 'transfer-detail',
        component: () => import('@/pages/transfers/TransferDetailPage.vue'),
        meta: { requiresAuth: true, title: 'Transfer details' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/pages/reports/ReportsPage.vue'),
        meta: { requiresAuth: true, title: 'Reports', permission: 'reports:read' },
      },
      {
        path: 'reports/inventory',
        name: 'report-inventory',
        component: () => import('@/pages/reports/InventoryReportPage.vue'),
        meta: { requiresAuth: true, title: 'Inventory report', permission: 'reports:read' },
      },
      {
        path: 'reports/municipality',
        name: 'report-municipality',
        component: () => import('@/pages/reports/MunicipalityReportPage.vue'),
        meta: { requiresAuth: true, title: 'Municipality report', permission: 'reports:read' },
      },
      {
        path: 'reports/school',
        name: 'report-school',
        component: () => import('@/pages/reports/SchoolReportPage.vue'),
        meta: { requiresAuth: true, title: 'School report', permission: 'reports:read' },
      },
      {
        path: 'reports/maintenance',
        name: 'report-maintenance',
        component: () => import('@/pages/reports/MaintenanceReportPage.vue'),
        meta: { requiresAuth: true, title: 'Maintenance report', permission: 'reports:read' },
      },
      {
        path: 'reports/transfers',
        name: 'report-transfers',
        component: () => import('@/pages/reports/TransferReportPage.vue'),
        meta: { requiresAuth: true, title: 'Transfer report', permission: 'reports:read' },
      },
      {
        path: 'reports/summary',
        name: 'report-summary',
        component: () => import('@/pages/reports/SummaryReportPage.vue'),
        meta: { requiresAuth: true, title: 'Summary report', permission: 'reports:read' },
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Users', permission: 'users:read' },
      },
      {
        path: 'municipalities',
        name: 'municipalities',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Municipalities' },
      },
      {
        path: 'schools',
        name: 'schools',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Schools' },
      },
      {
        path: 'categories',
        name: 'categories',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Categories' },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: { name: 'dashboard' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 };
  },
});

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  const app = useAppStore();

  if (!auth.initialized) {
    await auth.initializeAuth();
  }

  app.setPageTitle(to.meta.title || 'SAMS Nepal');

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }

  if (to.meta.permission && !auth.hasPermission(to.meta.permission)) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
