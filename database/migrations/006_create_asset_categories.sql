-- SAMS Nepal — Migration 006: Asset Categories

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
