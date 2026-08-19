-- SAMS Nepal — Migration 007: Asset Statuses

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
