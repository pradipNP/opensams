-- SAMS Nepal — Migration 017: Transfer workflow columns, statuses, and history actions

ALTER TABLE asset_transfers
    ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;

ALTER TABLE asset_transfers
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

ALTER TABLE asset_transfers
    ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;

UPDATE asset_transfers
SET requested_at = created_at
WHERE requested_at IS NULL;

ALTER TABLE asset_transfers
    ALTER COLUMN requested_at SET DEFAULT NOW();

ALTER TABLE asset_transfers
    ALTER COLUMN requested_at SET NOT NULL;

ALTER TABLE asset_transfers
    DROP CONSTRAINT IF EXISTS chk_asset_transfers_status;

ALTER TABLE asset_transfers
    ADD CONSTRAINT chk_asset_transfers_status
    CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'completed', 'cancelled'));

ALTER TABLE asset_history
    DROP CONSTRAINT IF EXISTS chk_asset_history_action;

ALTER TABLE asset_history
    ADD CONSTRAINT chk_asset_history_action
    CHECK (
        action IN (
            'created',
            'updated',
            'status_changed',
            'transferred',
            'maintenance_requested',
            'maintenance_completed',
            'deleted',
            'restored',
            'transfer_requested',
            'transfer_approved',
            'transfer_rejected',
            'transfer_completed',
            'transfer_cancelled'
        )
    );

CREATE INDEX IF NOT EXISTS idx_asset_transfers_requested_at
    ON asset_transfers(requested_at DESC);
