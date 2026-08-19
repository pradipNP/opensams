-- SAMS Nepal — Migration 010: Assets

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
COMMENT ON COLUMN assets.qr_code IS 'QR payload — typically verification URL or asset tag string';

CREATE INDEX idx_assets_school ON assets(school_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_category ON assets(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_status ON assets(status_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_assets_asset_tag ON assets(asset_tag);
CREATE INDEX idx_assets_qr_code ON assets(qr_code);
CREATE INDEX idx_assets_deleted_at ON assets(deleted_at);
