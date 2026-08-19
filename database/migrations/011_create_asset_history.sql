-- SAMS Nepal — Migration 011: Asset History

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
