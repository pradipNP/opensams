-- SAMS Nepal — Migration 009: Asset Tag Sequences
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
