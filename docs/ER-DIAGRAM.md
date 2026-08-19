# SAMS Nepal — Entity Relationship Diagram

> School Asset Management System · Database v1.0 · August 2026

## Overview

The SAMS Nepal database models a **four-tier geographic hierarchy** (Province → Municipality → School → Asset) with **role-based user scoping**, **asset lifecycle tracking**, **inter-school transfers**, and **maintenance workflows**.

---

## ER Diagram (Mermaid)

```mermaid
erDiagram
    provinces ||--o{ municipalities : contains
    provinces ||--o{ users : scopes
    municipalities ||--o{ schools : contains
    municipalities ||--o{ users : scopes
    municipalities ||--o{ asset_tag_sequences : tracks
    schools ||--o{ users : scopes
    schools ||--o{ assets : owns
    schools ||--o{ maintenance_requests : submits
    roles ||--o{ users : assigns
    asset_categories ||--o{ assets : classifies
    asset_statuses ||--o{ assets : status
    users ||--o{ assets : creates
    users ||--o{ asset_history : changes
    users ||--o{ asset_transfers : requests
    users ||--o{ asset_transfers : approves
    users ||--o{ maintenance_requests : requests
    users ||--o{ maintenance_requests : approves
    assets ||--o{ asset_history : logs
    assets ||--o{ asset_transfers : transfers
    assets ||--o{ maintenance_requests : maintains

    provinces {
        uuid id PK
        varchar name UK
        varchar code UK
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    municipalities {
        uuid id PK
        uuid province_id FK
        varchar name UK
        varchar code UK
        varchar district
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    schools {
        uuid id PK
        uuid municipality_id FK
        varchar name
        varchar school_code UK
        varchar school_type
        text address
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }

    roles {
        uuid id PK
        varchar name UK
        varchar slug UK
        text description
        jsonb permissions
        timestamptz created_at
    }

    users {
        uuid id PK
        uuid role_id FK
        uuid province_id FK
        uuid municipality_id FK
        uuid school_id FK
        varchar email UK
        varchar password_hash
        varchar full_name
        boolean is_active
        timestamptz last_login_at
        timestamptz created_at
        timestamptz updated_at
    }

    asset_categories {
        uuid id PK
        varchar name UK
        varchar department
        text description
        boolean is_active
        timestamptz created_at
    }

    asset_statuses {
        uuid id PK
        varchar name UK
        varchar slug UK
        varchar color_code
        text description
        int sort_order
    }

    asset_tag_sequences {
        uuid municipality_id PK_FK
        int year PK
        int last_sequence
    }

    assets {
        uuid id PK
        varchar asset_tag UK
        varchar name
        uuid category_id FK
        uuid school_id FK
        uuid status_id FK
        varchar department
        varchar location
        date purchase_date
        numeric purchase_cost
        date warranty_expiry
        varchar vendor
        varchar qr_code UK
        text notes
        uuid created_by FK
        timestamptz deleted_at
        timestamptz created_at
        timestamptz updated_at
    }

    asset_history {
        uuid id PK
        uuid asset_id FK
        varchar action
        varchar field_name
        text old_value
        text new_value
        uuid changed_by FK
        text notes
        jsonb metadata
        timestamptz created_at
    }

    asset_transfers {
        uuid id PK
        uuid asset_id FK
        uuid from_school_id FK
        uuid to_school_id FK
        uuid requested_by FK
        uuid approved_by FK
        varchar status
        date transfer_date
        text reason
        text rejection_reason
        text notes
        timestamptz requested_at
        timestamptz approved_at
        timestamptz completed_at
        timestamptz created_at
        timestamptz updated_at
    }

    maintenance_requests {
        uuid id PK
        uuid asset_id FK
        uuid school_id FK
        uuid requested_by FK
        uuid approved_by FK
        varchar assigned_to
        varchar status
        varchar priority
        text description
        numeric estimated_cost
        numeric actual_cost
        timestamptz requested_at
        timestamptz approved_at
        timestamptz started_at
        timestamptz completed_at
        text rejection_reason
        text notes
        timestamptz created_at
        timestamptz updated_at
    }
```

---

## Relationship Summary

| Parent | Child | Cardinality | On Delete |
|--------|-------|-------------|-----------|
| provinces | municipalities | 1:N | RESTRICT |
| provinces | users | 1:N | SET NULL |
| municipalities | schools | 1:N | RESTRICT |
| municipalities | users | 1:N | SET NULL |
| municipalities | asset_tag_sequences | 1:N | RESTRICT |
| schools | users | 1:N | SET NULL |
| schools | assets | 1:N | RESTRICT |
| schools | maintenance_requests | 1:N | RESTRICT |
| roles | users | 1:N | RESTRICT |
| asset_categories | assets | 1:N | RESTRICT |
| asset_statuses | assets | 1:N | RESTRICT |
| users | assets (created_by) | 1:N | SET NULL |
| users | asset_history | 1:N | SET NULL |
| assets | asset_history | 1:N | CASCADE |
| assets | asset_transfers | 1:N | RESTRICT |
| assets | maintenance_requests | 1:N | RESTRICT |

---

## Key Design Decisions

### Asset Tag Auto-Generation

Format: `SAMS-{MUN_CODE}-{YEAR}-{SEQ}`

| Municipality | Code | Example Tag |
|--------------|------|-------------|
| Butwal Sub-Metropolitan City | BTW | SAMS-BTW-2026-0001 |
| Siddharthanagar Municipality | SDH | SAMS-SDH-2026-0001 |
| Lumbini Sanskritik Municipality | LSM | SAMS-LSM-2026-0001 |

- Sequence is **per municipality, per calendar year**
- Managed by `asset_tag_sequences` table + `generate_asset_tag()` function
- Application must call `generate_asset_tag_for_school(school_id)` on asset creation

### QR Code Field

- Column: `assets.qr_code` (VARCHAR 500, UNIQUE, NOT NULL)
- Default payload: `https://sams.gov.np/verify/{asset_tag}`
- Generated via `default_qr_code(asset_tag)` function
- Frontend renders QR image from this payload using Chart.js is unrelated — QR via qrcode library later

### Soft Delete

- `assets.deleted_at` — assets are soft-deleted, not physically removed
- Partial indexes exclude `deleted_at IS NOT NULL` rows

### Audit Trail

- `asset_history` is **immutable** (no updated_at)
- Actions: `created`, `updated`, `status_changed`, `transferred`, `maintenance_requested`, `maintenance_completed`, `deleted`, `restored`, `transfer_requested`, `transfer_approved`, `transfer_rejected`, `transfer_completed`, `transfer_cancelled`

### User Scoping

| Role | Scope Field | Access |
|------|-------------|--------|
| state_admin | province_id (optional) | All data |
| municipal_officer | municipality_id | Own municipality |
| school_admin | school_id | Own school |

---

## Views

### `v_assets_detail`

Denormalized read-only view joining assets with category, status, school, municipality, province, and creator. Used for list endpoints and report exports.

---

## Seed Data Volume

| Entity | Count |
|--------|-------|
| Provinces | 1 |
| Municipalities | 3 |
| Schools | 27 |
| Asset Categories | 27 |
| Asset Statuses | 5 |
| Demo Users | 3 |
| Demo Assets | 500 |

---

## File Locations

```
database/
├── migrations/     001–015 DDL files
├── seeds/          001–008 seed files
├── schema.sql      Consolidated DDL reference
├── run_migrations.sql
└── run_seeds.sql
```
