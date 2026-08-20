-- SAMS Nepal — Reset public/demo data to the seed snapshot
-- Usage (from database/): psql "$DATABASE_URL" -f reset_demo.sql
-- This deletes visitor-created rows and reloads seeds. Schema is unchanged.

\echo 'Truncating operational tables...'

TRUNCATE TABLE
  asset_history,
  maintenance_requests,
  asset_transfers,
  assets,
  asset_tag_sequences,
  users,
  schools,
  municipalities,
  asset_categories,
  asset_statuses,
  roles,
  provinces
RESTART IDENTITY CASCADE;

\ir run_seeds.sql
