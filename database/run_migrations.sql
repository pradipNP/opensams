-- SAMS Nepal — Run all migrations
-- Usage: psql -U postgres -d sams_nepal -f run_migrations.sql
-- Run from database/ directory

\echo 'Running SAMS Nepal migrations...'

\ir migrations/001_extensions.sql
\ir migrations/002_create_provinces.sql
\ir migrations/003_create_roles.sql
\ir migrations/004_create_municipalities.sql
\ir migrations/005_create_schools.sql
\ir migrations/006_create_asset_categories.sql
\ir migrations/007_create_asset_statuses.sql
\ir migrations/008_create_users.sql
\ir migrations/009_create_asset_tag_sequences.sql
\ir migrations/010_create_assets.sql
\ir migrations/011_create_asset_history.sql
\ir migrations/012_create_asset_transfers.sql
\ir migrations/013_create_maintenance_requests.sql
\ir migrations/014_functions_and_triggers.sql
\ir migrations/015_indexes_and_views.sql
\ir migrations/016_maintenance_priority_critical.sql
\ir migrations/017_asset_transfer_workflow.sql

\echo 'Migrations complete.'
