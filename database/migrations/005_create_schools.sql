-- SAMS Nepal — Migration 005: Schools

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
