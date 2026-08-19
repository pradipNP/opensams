-- SAMS Nepal — Migration 004: Municipalities

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
COMMENT ON COLUMN municipalities.code IS 'Municipality code for asset tags (e.g. BTW → SAMS-BTW-2026-0001)';

CREATE INDEX idx_municipalities_province ON municipalities(province_id);
