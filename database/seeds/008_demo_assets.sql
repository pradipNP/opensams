-- SAMS Nepal — Seed 008: Demo Assets (500 assets distributed across 27 schools)
-- Uses generate_asset_tag() for SAMS-{MUN}-{YEAR}-{SEQ} format
-- Inserts corresponding asset_history 'created' records

DO $$
DECLARE
    v_school          RECORD;
    v_category_id     UUID;
    v_status_id       UUID;
    v_tag             VARCHAR(50);
    v_asset_id        UUID;
    v_created_by      UUID;
    v_year            INT := EXTRACT(YEAR FROM CURRENT_DATE)::INT;
    v_assets_per_base INT := 18;
    v_extra_schools   INT := 14;  -- 27 * 18 = 486; +14 = 500
    v_school_idx      INT := 0;
    v_asset_idx       INT;
    v_count           INT;
    v_departments     TEXT[] := ARRAY[
        'Classroom', 'Computer Lab', 'Library', 'Science Lab',
        'Sports Ground', 'Admin Office', 'Staff Room', 'Store Room'
    ];
    v_locations       TEXT[] := ARRAY[
        'Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202',
        'Lab Block A', 'Lab Block B', 'Library Hall', 'Office Block',
        'Playground Shed', 'Main Building', 'Annex Building'
    ];
    v_vendors         TEXT[] := ARRAY[
        'Nepal Edu Supplies', 'Lumbini Traders', 'Butwal Hardware',
        'Rupandehi IT Solutions', 'Bhairahawa Office Mart', 'Sunrise Electronics'
    ];
    v_category_ids    UUID[];
    v_status_ids      UUID[];
    v_status_weights  INT[] := ARRAY[70, 12, 10, 5, 3]; -- active, damaged, maintenance, disposed, lost
    v_rand            INT;
    v_cost            NUMERIC(12,2);
    v_purchase_date   DATE;
    v_warranty        DATE;
    v_cat_name        TEXT;
    v_dept            TEXT;
    v_loc             TEXT;
BEGIN
    SELECT id INTO v_created_by
    FROM users
    WHERE email = 'state.admin@sams.gov.np';

    SELECT ARRAY_AGG(id ORDER BY name) INTO v_category_ids FROM asset_categories;
    SELECT ARRAY_AGG(id ORDER BY sort_order) INTO v_status_ids FROM asset_statuses;

    IF v_category_ids IS NULL OR v_status_ids IS NULL THEN
        RAISE EXCEPTION 'Categories and statuses must be seeded before demo assets';
    END IF;

    FOR v_school IN
        SELECT s.id, s.municipality_id, s.name, s.school_code
        FROM schools s
        ORDER BY s.school_code
    LOOP
        v_school_idx := v_school_idx + 1;
        v_count := v_assets_per_base + CASE WHEN v_school_idx <= v_extra_schools THEN 1 ELSE 0 END;

        FOR v_asset_idx IN 1..v_count LOOP
            v_category_id := v_category_ids[1 + (random() * (array_length(v_category_ids, 1) - 1))::INT];
            SELECT name, department INTO v_cat_name, v_dept FROM asset_categories WHERE id = v_category_id;

            -- Weighted random status (mostly active)
            v_rand := (random() * 100)::INT;
            IF v_rand < 70 THEN
                v_status_id := v_status_ids[1];
            ELSIF v_rand < 82 THEN
                v_status_id := v_status_ids[2];
            ELSIF v_rand < 92 THEN
                v_status_id := v_status_ids[3];
            ELSIF v_rand < 97 THEN
                v_status_id := v_status_ids[4];
            ELSE
                v_status_id := v_status_ids[5];
            END IF;

            v_tag := generate_asset_tag(v_school.municipality_id);
            v_asset_id := gen_random_uuid();
            v_loc := v_locations[1 + (random() * (array_length(v_locations, 1) - 1))::INT];
            v_dept := v_departments[1 + (random() * (array_length(v_departments, 1) - 1))::INT];
            v_cost := (500 + random() * 45000)::NUMERIC(12,2);
            v_purchase_date := (CURRENT_DATE - ((random() * 1825)::INT || ' days')::INTERVAL)::DATE;
            v_warranty := v_purchase_date + ((365 + (random() * 730)::INT || ' days')::INTERVAL);

            INSERT INTO assets (
                id, asset_tag, name, category_id, school_id, status_id,
                department, location, purchase_date, purchase_cost,
                warranty_expiry, vendor, qr_code, notes, created_by
            ) VALUES (
                v_asset_id,
                v_tag,
                v_cat_name || ' — ' || v_school.school_code || '-' || LPAD(v_asset_idx::TEXT, 3, '0'),
                v_category_id,
                v_school.id,
                v_status_id,
                v_dept,
                v_loc,
                v_purchase_date,
                v_cost,
                v_warranty,
                v_vendors[1 + (random() * (array_length(v_vendors, 1) - 1))::INT],
                default_qr_code(v_tag),
                'Demo seed asset for ' || v_school.name,
                v_created_by
            );

            INSERT INTO asset_history (
                asset_id, action, field_name, new_value, changed_by, notes
            ) VALUES (
                v_asset_id,
                'created',
                NULL,
                v_tag,
                v_created_by,
                'Asset registered via demo seed data'
            );
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Seeded 500 demo assets across % schools', v_school_idx;
END $$;

-- Verify count
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM assets WHERE deleted_at IS NULL;
    IF v_count <> 500 THEN
        RAISE WARNING 'Expected 500 assets, found %', v_count;
    END IF;
END $$;
