-- SAMS Nepal — Migration 016: Maintenance priority includes critical
-- Existing databases created from 013 only allow low/medium/high/urgent.

ALTER TABLE maintenance_requests
    DROP CONSTRAINT IF EXISTS chk_maintenance_requests_priority;

ALTER TABLE maintenance_requests
    ADD CONSTRAINT chk_maintenance_requests_priority
    CHECK (priority IN ('low', 'medium', 'high', 'urgent', 'critical'));
