-- SAMS Nepal — Run all seed files
-- Usage: psql -U postgres -d sams_nepal -f run_seeds.sql
-- Run after run_migrations.sql

\echo 'Running SAMS Nepal seeds...'

\ir seeds/001_roles.sql
\ir seeds/002_provinces.sql
\ir seeds/003_municipalities.sql
\ir seeds/004_schools.sql
\ir seeds/005_asset_categories.sql
\ir seeds/006_asset_statuses.sql
\ir seeds/007_demo_users.sql
\ir seeds/008_demo_assets.sql

\echo 'Seeds complete.'
