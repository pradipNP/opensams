-- =============================================================================
-- SAMS Nepal — Consolidated PostgreSQL Schema
-- Generated from database/migrations/ (001–015)
-- Do not edit directly; update migration files and regenerate.
-- =============================================================================

-- --- FILE: 001_extensions.sql ---
-- SAMS Nepal â€” Migration 001: Extensions
-- Enables UUID generation and cryptographic functions

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
 
-- --- FILE: 002_create_provinces.sql ---
-- SAMS Nepal â€” Migration 002: Provinces

CREATE TABLE provinces (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(150) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_provinces_name UNIQUE (name),
    CONSTRAINT uq_provinces_code UNIQUE (code)
);

COMMENT ON TABLE provinces IS 'Administrative provinces (e.g. Lumbini Province)';
COMMENT ON COLUMN provinces.code IS 'Short code used in reports and references (e.g. LUM)';
 
-- --- FILE: 003_create_roles.sql ---
-- SAMS Nepal â€” Migration 003: Roles

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
 
-- --- FILE: 004_create_municipalities.sql ---
-- SAMS Nepal â€” Migration 004: Municipalities

CREATE TABLE municipalities (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    province_id UUID         NOT NULL REFERENCES provinces(id) ON DELETE RESTRICT,
    name        VARCHAR(200) NOT NULL,
    code        VARCHAR(10)  NOT NULL,
    district    VARCHAR(100) NOT NULL,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_municipalities_name UNIQUE (name),
    CONSTRAINT uq_municipalities_code UNIQUE (code)
);

COMMENT ON TABLE municipalities IS 'Municipalities within a province';
COMMENT ON COLUMN municipalities.code IS 'Municipality code for asset tags (e.g. BTW â†’ SAMS-BTW-2026-0001)';

CREATE INDEX idx_municipalities_province ON municipalities(province_id);
 
-- --- FILE: 005_create_schools.sql ---
-- SAMS Nepal â€” Migration 005: Schools

CREATE TABLE schools (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    municipality_id  UUID         NOT NULL REFERENCES municipalities(id) ON DELETE RESTRICT,
    name             VARCHAR(300) NOT NULL,
    school_code      VARCHAR(20)  NOT NULL,
    school_type      VARCHAR(50)  NOT NULL DEFAULT 'Secondary',
    address          TEXT,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_schools_code UNIQUE (school_code)
);

COMMENT ON TABLE schools IS 'Government schools under a municipality';

CREATE INDEX idx_schools_municipality ON schools(municipality_id);
CREATE INDEX idx_schools_name ON schools(name);
 
-- --- FILE: 006_create_asset_categories.sql ---
-- SAMS Nepal â€” Migration 006: Asset Categories

CREATE TABLE asset_categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) NOT NULL,
    department  VARCHAR(100) NOT NULL,
    description TEXT,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_asset_categories_name UNIQUE (name)
);

COMMENT ON TABLE asset_categories IS 'Asset classification (e.g. Desks, Laptops) grouped by department';

CREATE INDEX idx_asset_categories_department ON asset_categories(department);
 
-- --- FILE: 007_create_asset_statuses.sql ---
-- SAMS Nepal â€” Migration 007: Asset Statuses

CREATE TABLE asset_statuses (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(50)  NOT NULL,
    slug        VARCHAR(50)  NOT NULL,
    color_code  VARCHAR(7)   NOT NULL DEFAULT '#64748B',
    description TEXT,
    sort_order  INT          NOT NULL DEFAULT 0,

    CONSTRAINT uq_asset_statuses_name UNIQUE (name),
    CONSTRAINT uq_asset_statuses_slug UNIQUE (slug)
);

COMMENT ON TABLE asset_statuses IS 'Lifecycle states: active, damaged, under_maintenance, disposed, lost';
 
-- --- FILE: 008_create_users.sql ---
-- SAMS Nepal â€” Migration 008: Users

CREATE TABLE users (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id          UUID         NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    province_id      UUID         REFERENCES provinces(id) ON DELETE SET NULL,
    municipality_id  UUID         REFERENCES municipalities(id) ON DELETE SET NULL,
    school_id        UUID         REFERENCES schools(id) ON DELETE SET NULL,
    email            VARCHAR(255) NOT NULL,
    password_hash    VARCHAR(255) NOT NULL,
    full_name        VARCHAR(200) NOT NULL,
    is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
    last_login_at    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_users_email UNIQUE (email)
);

COMMENT ON TABLE users IS 'Application users scoped by role to province, municipality, or school';

CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_municipality ON users(municipality_id);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_users_email ON users(email);
 
-- --- FILE: 009_create_asset_tag_sequences.sql ---
-- SAMS Nepal â€” Migration 009: Asset Tag Sequences
-- Tracks per-municipality, per-year counters for auto-generated asset tags

CREATE TABLE asset_tag_sequences (
    municipality_id UUID    NOT NULL REFERENCES municipalities(id) ON DELETE RESTRICT,
    year            INT     NOT NULL,
    last_sequence   INT     NOT NULL DEFAULT 0,

    PRIMARY KEY (municipality_id, year),
    CONSTRAINT chk_asset_tag_sequences_year CHECK (year >= 2000 AND year <= 2100),
    CONSTRAINT chk_asset_tag_sequences_sequence CHECK (last_sequence >= 0)
);

COMMENT ON TABLE asset_tag_sequences IS 'Sequence counter for SAMS-{MUN_CODE}-{YEAR}-{SEQ} asset tags';
 
-- --- FILE: 010_create_assets.sql ---
-- SAMS Nepal â€” Migration 010: Assets

CREATE TABLE assets (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_tag       VARCHAR(50)    NOT NULL,
    name            VARCHAR(300)   NOT NULL,
    category_id     UUID           NOT NULL REFERENCES asset_categories(id) ON DELETE RESTRICT,
    school_id       UUID           NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    status_id       UUID           NOT NULL REFERENCES asset_statuses(id) ON DELETE RESTRICT,
    department      VARCHAR(100),
    location        VARCHAR(200),
    purchase_date   DATE,
    purchase_cost   NUMERIC(12, 2) NOT NULL DEFAULT 0,
    warranty_expiry DATE,
    vendor          VARCHAR(200),
    qr_code         VARCHAR(500)   NOT NULL,
    notes           TEXT,
    created_by      UUID           REFERENCES users(id) ON DELETE SET NULL,
    deleted_at      TIMESTAMPTZ,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_assets_asset_tag UNIQUE (asset_tag),
    CONSTRAINT uq_assets_qr_code UNIQUE (qr_code),
    CONSTRAINT chk_assets_purchase_cost CHECK (purchase_cost >= 0)
);

COMMENT ON TABLE assets IS 'School-owned physical assets';
COMMENT ON COLUMN assets.asset_tag IS 'Auto-generated: SAMS-BTW-2026-0001';
COMMENT ON COLUMN assets.qr_code IS 'QR payload â€” typically verification URL or asset tag string';

CREATE INDEX idx_assets_school ON assets(school_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_category ON assets(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_status ON assets(status_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assets_qr_code ON assets(qr_code);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);
 
-- --- FILE: 011_create_asset_history.sql ---
-- SAMS Nepal â€” Migration 011: Asset History

CREATE TABLE asset_history (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id      UUID         NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
    action        VARCHAR(50)  NOT NULL,
    field_name    VARCHAR(100),
    old_value     TEXT,
    new_value     TEXT,
    changed_by    UUID         REFERENCES users(id) ON DELETE SET NULL,
    notes         TEXT,
    metadata      JSONB        NOT NULL DEFAULT '{}'::jsonb,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_asset_history_action CHECK (
        action IN (
            'created',
            'updated',
            'status_changed',
            'transferred',
            'maintenance_requested',
            'maintenance_completed',
            'deleted',
            'restored'
        )
    )
);

COMMENT ON TABLE asset_history IS 'Immutable audit log of asset lifecycle events and field changes';

CREATE INDEX idx_asset_history_asset ON asset_history(asset_id);
CREATE INDEX idx_asset_history_action ON asset_history(action);
CREATE INDEX idx_asset_history_created_at ON asset_history(created_at DESC);
CREATE INDEX idx_asset_history_changed_by ON asset_history(changed_by);
 
-- --- FILE: 012_create_asset_transfers.sql ---
-- SAMS Nepal â€” Migration 012: Asset Transfers

CREATE TABLE asset_transfers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID         NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    from_school_id  UUID         NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    to_school_id    UUID         NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    requested_by    UUID         NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by     UUID         REFERENCES users(id) ON DELETE SET NULL,
    status          VARCHAR(30)  NOT NULL DEFAULT 'pending',
    transfer_date   DATE,
    reason          TEXT         NOT NULL,
    rejection_reason TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_asset_transfers_status CHECK (
        status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')
    ),
    CONSTRAINT chk_asset_transfers_different_schools CHECK (from_school_id <> to_school_id)
);

COMMENT ON TABLE asset_transfers IS 'Inter-school asset transfer requests and approvals';

CREATE INDEX idx_asset_transfers_asset ON asset_transfers(asset_id);
CREATE INDEX idx_asset_transfers_from_school ON asset_transfers(from_school_id);
CREATE INDEX idx_asset_transfers_to_school ON asset_transfers(to_school_id);
CREATE INDEX idx_asset_transfers_status ON asset_transfers(status);
CREATE INDEX idx_asset_transfers_requested_by ON asset_transfers(requested_by);
 
-- --- FILE: 013_create_maintenance_requests.sql ---
-- SAMS Nepal â€” Migration 013: Maintenance Requests

CREATE TABLE maintenance_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID           NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    school_id       UUID           NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    requested_by    UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by     UUID           REFERENCES users(id) ON DELETE SET NULL,
    assigned_to     VARCHAR(200),
    status          VARCHAR(30)    NOT NULL DEFAULT 'pending',
    priority        VARCHAR(20)    NOT NULL DEFAULT 'medium',
    description     TEXT           NOT NULL,
    estimated_cost  NUMERIC(12, 2),
    actual_cost     NUMERIC(12, 2),
    requested_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    approved_at     TIMESTAMPTZ,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    rejection_reason TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_maintenance_requests_status CHECK (
        status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled')
    ),
    CONSTRAINT chk_maintenance_requests_priority CHECK (
        priority IN ('low', 'medium', 'high', 'urgent')
    ),
    CONSTRAINT chk_maintenance_requests_estimated_cost CHECK (
        estimated_cost IS NULL OR estimated_cost >= 0
    ),
    CONSTRAINT chk_maintenance_requests_actual_cost CHECK (
        actual_cost IS NULL OR actual_cost >= 0
    )
);

COMMENT ON TABLE maintenance_requests IS 'Asset repair and maintenance workflow from school to municipal approval';

CREATE INDEX idx_maintenance_requests_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_requests_school ON maintenance_requests(school_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX idx_maintenance_requests_requested_by ON maintenance_requests(requested_by);
CREATE INDEX idx_maintenance_requests_requested_at ON maintenance_requests(requested_at DESC);
 
-- --- FILE: 014_functions_and_triggers.sql ---
-- SAMS Nepal â€” Migration 014: Functions & Triggers

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Auto-generate asset tag: SAMS-{MUN_CODE}-{YEAR}-{SEQ}
-- Example: SAMS-BTW-2026-0001
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_asset_tag(p_municipality_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_code  VARCHAR(10);
    v_year  INT;
    v_seq   INT;
BEGIN
    SELECT code INTO v_code
    FROM municipalities
    WHERE id = p_municipality_id;

    IF v_code IS NULL THEN
        RAISE EXCEPTION 'Municipality not found: %', p_municipality_id;
    END IF;

    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;

    INSERT INTO asset_tag_sequences (municipality_id, year, last_sequence)
    VALUES (p_municipality_id, v_year, 0)
    ON CONFLICT (municipality_id, year) DO NOTHING;

    UPDATE asset_tag_sequences
    SET last_sequence = last_sequence + 1
    WHERE municipality_id = p_municipality_id
      AND year = v_year
    RETURNING last_sequence INTO v_seq;

    RETURN 'SAMS-' || v_code || '-' || v_year::TEXT || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_asset_tag(UUID) IS
    'Returns next asset tag for municipality in format SAMS-BTW-2026-0001';

-- ---------------------------------------------------------------------------
-- Resolve municipality_id from school_id for tag generation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_asset_tag_for_school(p_school_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_municipality_id UUID;
BEGIN
    SELECT municipality_id INTO v_municipality_id
    FROM schools
    WHERE id = p_school_id;

    IF v_municipality_id IS NULL THEN
        RAISE EXCEPTION 'School not found: %', p_school_id;
    END IF;

    RETURN generate_asset_tag(v_municipality_id);
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Default QR code payload from asset tag
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION default_qr_code(p_asset_tag VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN 'https://sams.gov.np/verify/' || p_asset_tag;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_provinces_updated_at
    BEFORE UPDATE ON provinces
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_municipalities_updated_at
    BEFORE UPDATE ON municipalities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_transfers_updated_at
    BEFORE UPDATE ON asset_transfers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_maintenance_requests_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
 
-- --- FILE: 015_indexes_and_views.sql ---
-- SAMS Nepal â€” Migration 015: Additional Indexes & Views

-- Composite indexes for common scoped queries
CREATE INDEX idx_assets_school_status
    ON assets(school_id, status_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_assets_school_category
    ON assets(school_id, category_id)
    WHERE deleted_at IS NULL;

-- Dashboard aggregation helpers
CREATE INDEX idx_assets_purchase_cost
    ON assets(purchase_cost)
    WHERE deleted_at IS NULL;

-- Maintenance workflow queue
CREATE INDEX idx_maintenance_requests_school_status
    ON maintenance_requests(school_id, status);

-- Transfer approval queue
CREATE INDEX idx_asset_transfers_status_created
    ON asset_transfers(status, created_at DESC);

-- ---------------------------------------------------------------------------
-- View: assets with resolved names (read-only, for reports)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_assets_detail AS
SELECT
    a.id,
    a.asset_tag,
    a.name,
    a.department,
    a.location,
    a.purchase_date,
    a.purchase_cost,
    a.warranty_expiry,
    a.vendor,
    a.qr_code,
    a.notes,
    a.deleted_at,
    a.created_at,
    a.updated_at,
    ac.id          AS category_id,
    ac.name        AS category_name,
    ac.department  AS category_department,
    ast.id         AS status_id,
    ast.name       AS status_name,
    ast.slug       AS status_slug,
    ast.color_code AS status_color,
    s.id           AS school_id,
    s.name         AS school_name,
    s.school_code,
    m.id           AS municipality_id,
    m.name         AS municipality_name,
    m.code         AS municipality_code,
    p.id           AS province_id,
    p.name         AS province_name,
    p.code         AS province_code,
    u.id           AS created_by_id,
    u.full_name    AS created_by_name
FROM assets a
JOIN asset_categories ac ON ac.id = a.category_id
JOIN asset_statuses ast ON ast.id = a.status_id
JOIN schools s ON s.id = a.school_id
JOIN municipalities m ON m.id = s.municipality_id
JOIN provinces p ON p.id = m.province_id
LEFT JOIN users u ON u.id = a.created_by
WHERE a.deleted_at IS NULL;

COMMENT ON VIEW v_assets_detail IS 'Denormalized asset view for reporting and API list responses';

