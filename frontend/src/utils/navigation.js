export const NAV_ITEMS = [
  { name: 'dashboard', label: 'Dashboard', to: { name: 'dashboard' } },
  { name: 'assets', label: 'Assets', to: { name: 'assets' } },
  { name: 'maintenance', label: 'Maintenance', to: { name: 'maintenance' } },
  { name: 'transfers', label: 'Transfers', to: { name: 'transfers' } },
  { name: 'reports', label: 'Reports', to: { name: 'reports' }, permission: 'reports:read' },
  { name: 'users', label: 'Users', to: { name: 'users' }, permission: 'users:read' },
  {
    name: 'municipalities',
    label: 'Municipalities',
    to: { name: 'municipalities' },
    roles: ['state_admin', 'municipal_officer'],
  },
  { name: 'schools', label: 'Schools', to: { name: 'schools' }, permission: 'schools:read' },
  { name: 'categories', label: 'Categories', to: { name: 'categories' }, permission: 'categories:read' },
];
