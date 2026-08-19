-- SAMS Nepal — Migration 002: Provinces

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
