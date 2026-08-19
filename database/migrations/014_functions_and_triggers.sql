-- SAMS Nepal — Migration 014: Functions & Triggers

-- ---------------------------------------------------------------------------
-- updated_at trigger helper
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Auto-generate asset tag: SAMS-{MUN_CODE}-{YEAR}-{SEQ}
-- Example: SAMS-BTW-2026-0001
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_asset_tag(p_municipality_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_code  VARCHAR(10);
    v_year  INT;
    v_seq   INT;
BEGIN
    SELECT code INTO v_code
    FROM municipalities
    WHERE id = p_municipality_id;

    IF v_code IS NULL THEN
        RAISE EXCEPTION 'Municipality not found: %', p_municipality_id;
    END IF;

    v_year := EXTRACT(YEAR FROM CURRENT_DATE)::INT;

    INSERT INTO asset_tag_sequences (municipality_id, year, last_sequence)
    VALUES (p_municipality_id, v_year, 0)
    ON CONFLICT (municipality_id, year) DO NOTHING;

    UPDATE asset_tag_sequences
    SET last_sequence = last_sequence + 1
    WHERE municipality_id = p_municipality_id
      AND year = v_year
    RETURNING last_sequence INTO v_seq;

    RETURN 'SAMS-' || v_code || '-' || v_year::TEXT || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION generate_asset_tag(UUID) IS
    'Returns next asset tag for municipality in format SAMS-BTW-2026-0001';

-- ---------------------------------------------------------------------------
-- Resolve municipality_id from school_id for tag generation
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION generate_asset_tag_for_school(p_school_id UUID)
RETURNS VARCHAR AS $$
DECLARE
    v_municipality_id UUID;
BEGIN
    SELECT municipality_id INTO v_municipality_id
    FROM schools
    WHERE id = p_school_id;

    IF v_municipality_id IS NULL THEN
        RAISE EXCEPTION 'School not found: %', p_school_id;
    END IF;

    RETURN generate_asset_tag(v_municipality_id);
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Default QR code payload from asset tag
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION default_qr_code(p_asset_tag VARCHAR)
RETURNS VARCHAR AS $$
BEGIN
    RETURN 'https://sams.gov.np/verify/' || p_asset_tag;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
CREATE TRIGGER trg_provinces_updated_at
    BEFORE UPDATE ON provinces
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_municipalities_updated_at
    BEFORE UPDATE ON municipalities
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_schools_updated_at
    BEFORE UPDATE ON schools
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_assets_updated_at
    BEFORE UPDATE ON assets
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_asset_transfers_updated_at
    BEFORE UPDATE ON asset_transfers
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_maintenance_requests_updated_at
    BEFORE UPDATE ON maintenance_requests
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
