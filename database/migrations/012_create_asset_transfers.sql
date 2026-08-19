-- SAMS Nepal — Migration 012: Asset Transfers

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
