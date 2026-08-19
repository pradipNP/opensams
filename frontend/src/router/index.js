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
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Assets' },
      },
      {
        path: 'maintenance',
        name: 'maintenance',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Maintenance' },
      },
      {
        path: 'transfers',
        name: 'transfers',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Transfers' },
      },
      {
        path: 'reports',
        name: 'reports',
        component: () => import('@/pages/ComingSoon.vue'),
        meta: { requiresAuth: true, title: 'Reports' },
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
