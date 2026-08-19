-- SAMS Nepal — Seed 007: Demo Users
-- Development password for all demo accounts: password
-- bcrypt ($2b$10$, cost 10) — regenerate for production via backend auth setup

INSERT INTO users (
    id, role_id, province_id, municipality_id, school_id,
    email, password_hash, full_name
) VALUES
(
    '77777777-7777-4777-8777-777777777701',
    '11111111-1111-4111-8111-111111111101',
    '22222222-2222-4222-8222-222222222201',
    NULL,
    NULL,
    'state.admin@sams.gov.np',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Rajesh Sharma'
),
(
    '77777777-7777-4777-8777-777777777702',
    '11111111-1111-4111-8111-111111111102',
    '22222222-2222-4222-8222-222222222201',
    '33333333-3333-4333-8333-333333333301',
    NULL,
    'municipal.butwal@sams.gov.np',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Priya Thapa'
),
(
    '77777777-7777-4777-8777-777777777703',
    '11111111-1111-4111-8111-111111111103',
    '22222222-2222-4222-8222-222222222201',
    '33333333-3333-4333-8333-333333333301',
    '44444444-4444-4444-8444-444444444401',
    'school.kmg@sams.gov.np',
    '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    'Amit KC'
);
