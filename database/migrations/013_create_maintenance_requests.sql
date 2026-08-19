-- SAMS Nepal — Migration 013: Maintenance Requests

CREATE TABLE maintenance_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id        UUID           NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
    school_id       UUID           NOT NULL REFERENCES schools(id) ON DELETE RESTRICT,
    requested_by    UUID           NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approved_by     UUID           REFERENCES users(id) ON DELETE SET NULL,
    assigned_to     VARCHAR(200),
    status          VARCHAR(30)    NOT NULL DEFAULT 'pending',
    priority        VARCHAR(20)    NOT NULL DEFAULT 'medium',
    description     TEXT           NOT NULL,
    estimated_cost  NUMERIC(12, 2),
    actual_cost     NUMERIC(12, 2),
    requested_at    TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    approved_at     TIMESTAMPTZ,
    started_at      TIMESTAMPTZ,
    completed_at    TIMESTAMPTZ,
    rejection_reason TEXT,
    notes           TEXT,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_maintenance_requests_status CHECK (
        status IN ('pending', 'approved', 'in_progress', 'completed', 'rejected', 'cancelled')
    ),
    CONSTRAINT chk_maintenance_requests_priority CHECK (
        priority IN ('low', 'medium', 'high', 'urgent', 'critical')
    ),
    CONSTRAINT chk_maintenance_requests_estimated_cost CHECK (
        estimated_cost IS NULL OR estimated_cost >= 0
    ),
    CONSTRAINT chk_maintenance_requests_actual_cost CHECK (
        actual_cost IS NULL OR actual_cost >= 0
    )
);

COMMENT ON TABLE maintenance_requests IS 'Asset repair and maintenance workflow from school to municipal approval';

CREATE INDEX idx_maintenance_requests_asset ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_requests_school ON maintenance_requests(school_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority ON maintenance_requests(priority);
CREATE INDEX idx_maintenance_requests_requested_by ON maintenance_requests(requested_by);
CREATE INDEX idx_maintenance_requests_requested_at ON maintenance_requests(requested_at DESC);
