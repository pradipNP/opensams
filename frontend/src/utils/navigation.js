export const NAV_ITEMS = [
  { name: 'dashboard', label: 'Dashboard', to: { name: 'dashboard' }, section: 'Overview' },
  { name: 'assets', label: 'Assets', to: { name: 'assets' }, section: 'Operations' },
  { name: 'maintenance', label: 'Maintenance', to: { name: 'maintenance' }, section: 'Operations' },
  { name: 'transfers', label: 'Transfers', to: { name: 'transfers' }, section: 'Operations' },
  { name: 'reports', label: 'Reports', to: { name: 'reports' }, permission: 'reports:read', section: 'Operations' },
  { name: 'users', label: 'Users', to: { name: 'users' }, permission: 'users:read', section: 'Administration' },
  {
    name: 'municipalities',
    label: 'Municipalities',
    to: { name: 'municipalities' },
    roles: ['state_admin', 'municipal_officer'],
    section: 'Administration',
  },
  { name: 'schools', label: 'Schools', to: { name: 'schools' }, permission: 'schools:read', section: 'Administration' },
  { name: 'categories', label: 'Categories', to: { name: 'categories' }, permission: 'categories:read', section: 'Administration' },
];
