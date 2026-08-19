-- SAMS Nepal — Migration 003: Roles

CREATE TABLE roles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)  NOT NULL,
    slug        VARCHAR(50)  NOT NULL,
    description TEXT,
    permissions JSONB        NOT NULL DEFAULT '[]'::jsonb,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_roles_name UNIQUE (name),
    CONSTRAINT uq_roles_slug UNIQUE (slug)
);

COMMENT ON TABLE roles IS 'System roles with JSONB permission arrays';
COMMENT ON COLUMN roles.slug IS 'Machine-readable role key: state_admin, municipal_officer, school_admin';
