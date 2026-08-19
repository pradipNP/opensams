-- SAMS Nepal — Seed 001: Roles
-- Run after migrations

INSERT INTO roles (id, name, slug, description, permissions) VALUES
(
    '11111111-1111-4111-8111-111111111101',
    'State Administrator',
    'state_admin',
    'Full system access across all provinces, municipalities, and schools',
    '[
        "municipalities:read", "municipalities:write",
        "schools:read", "schools:write",
        "assets:read", "assets:write", "assets:delete",
        "categories:read", "categories:write",
        "users:read", "users:write",
        "reports:read", "dashboard:read",
        "transfers:read", "transfers:request", "transfers:approve",
        "maintenance:read", "maintenance:request", "maintenance:approve",
        "history:read"
    ]'::jsonb
),
(
    '11111111-1111-4111-8111-111111111102',
    'Municipal Officer',
    'municipal_officer',
    'Municipality-scoped access for audits, approvals, and reports',
    '[
        "schools:read",
        "assets:read",
        "categories:read",
        "reports:read", "dashboard:read",
        "transfers:read", "transfers:approve",
        "maintenance:read", "maintenance:approve",
        "history:read"
    ]'::jsonb
),
(
    '11111111-1111-4111-8111-111111111103',
    'School Administrator',
    'school_admin',
    'School-scoped asset management and maintenance requests',
    '[
        "schools:read",
        "assets:read", "assets:write",
        "categories:read",
        "reports:read", "dashboard:read",
        "transfers:read", "transfers:request",
        "maintenance:read", "maintenance:request",
        "history:read"
    ]'::jsonb
);
