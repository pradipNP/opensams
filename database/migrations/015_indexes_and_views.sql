-- SAMS Nepal — Migration 015: Additional Indexes & Views

-- Composite indexes for common scoped queries
CREATE INDEX idx_assets_school_status
    ON assets(school_id, status_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_assets_school_category
    ON assets(school_id, category_id)
    WHERE deleted_at IS NULL;

-- Dashboard aggregation helpers
CREATE INDEX idx_assets_purchase_cost
    ON assets(purchase_cost)
    WHERE deleted_at IS NULL;

-- Maintenance workflow queue
CREATE INDEX idx_maintenance_requests_school_status
    ON maintenance_requests(school_id, status);

-- Transfer approval queue
CREATE INDEX idx_asset_transfers_status_created
    ON asset_transfers(status, created_at DESC);

-- ---------------------------------------------------------------------------
-- View: assets with resolved names (read-only, for reports)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW v_assets_detail AS
SELECT
    a.id,
    a.asset_tag,
    a.name,
    a.department,
    a.location,
    a.purchase_date,
    a.purchase_cost,
    a.warranty_expiry,
    a.vendor,
    a.qr_code,
    a.notes,
    a.deleted_at,
    a.created_at,
    a.updated_at,
    ac.id          AS category_id,
    ac.name        AS category_name,
    ac.department  AS category_department,
    ast.id         AS status_id,
    ast.name       AS status_name,
    ast.slug       AS status_slug,
    ast.color_code AS status_color,
    s.id           AS school_id,
    s.name         AS school_name,
    s.school_code,
    m.id           AS municipality_id,
    m.name         AS municipality_name,
    m.code         AS municipality_code,
    p.id           AS province_id,
    p.name         AS province_name,
    p.code         AS province_code,
    u.id           AS created_by_id,
    u.full_name    AS created_by_name
FROM assets a
JOIN asset_categories ac ON ac.id = a.category_id
JOIN asset_statuses ast ON ast.id = a.status_id
JOIN schools s ON s.id = a.school_id
JOIN municipalities m ON m.id = s.municipality_id
JOIN provinces p ON p.id = m.province_id
LEFT JOIN users u ON u.id = a.created_by
WHERE a.deleted_at IS NULL;

COMMENT ON VIEW v_assets_detail IS 'Denormalized asset view for reporting and API list responses';
