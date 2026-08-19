# SAMS Nepal — Technical Documentation

School Asset Management System · Version 1.0.0

This document describes the software architecture. It is not an API contract. For endpoint details see `docs/API-CONTRACT.md`. For the data model see `docs/ER-DIAGRAM.md`.

## Architecture overview

SAMS Nepal is a separated web application:

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Vue 3, Vite, Vue Router, Pinia, Axios, Tailwind CSS | Authenticated SPA, forms, reports UI |
| Backend | Node.js, Express | REST API, JWT auth, RBAC, Excel/PDF export |
| Database | PostgreSQL | Durable inventory, users, workflow, history |

The frontend talks only to `/api/v1`. The backend uses a repository → service → controller → route structure. Scope is applied in query builders so list and detail results stay within the caller’s municipality or school.

```
Browser (Vue SPA)
    → HTTPS → Express API (/api/v1)
        → PostgreSQL
```

## Folder structure

```
Asset-Management/
  frontend/          Vue 3 application
    public/          Static files (logo, favicon)
    src/
      api/           Axios wrappers
      components/    Shared and feature UI
      constants/     Application branding constants
      layouts/       Auth and main shells
      pages/         Route-level views
      router/        Vue Router
      stores/        Pinia stores
      utils/         Formatters and helpers
  backend/
    src/
      config/        Environment and database pool
      constants/     Roles and permissions
      controllers/
      middleware/    Auth, authorize, validation, errors
      repositories/
      routes/
      services/
      validators/
      docs/          OpenAPI
    server.js
  database/
    migrations/
    seeds/
    schema.sql
  docs/              This documentation set
```

## Frontend application

- Entry: `frontend/src/main.js`
- Layouts: `AuthLayout` (login), `MainLayout` (authenticated chrome: sidebar, header, footer)
- Branding constants: `frontend/src/constants/app.js` (`APP_NAME`, `APP_FULL_NAME`, `APP_VERSION`)
- Session token: stored locally and sent as `Authorization: Bearer`
- Route guards enforce authentication, permission, and role metadata
- Operational lists hide inactive assignment targets; admin writers may still see inactive rows for reactivation

## Backend API structure

Base path: `/api/v1`

Mounted modules include `auth`, `health`, `dashboard`, `provinces`, `municipalities`, `schools`, `assets`, `maintenance`, `transfers`, `reports`, `categories`, `statuses`, and `users`.

Public (unauthenticated) examples:

- `POST /api/v1/auth/login`
- `GET /health` and `GET /api/v1/health`
- Asset tag verify route as documented in the API contract

Authenticated requests require a valid JWT. Revoked tokens (after logout) are rejected.

OpenAPI UI: `/api/docs`.

## RBAC model

Three roles:

| Role slug | Scope |
|---|---|
| `state_admin` | National / all records |
| `municipal_officer` | Assigned municipality |
| `school_admin` | Assigned school |

Permissions are stored on the role and copied into the JWT (for example `assets:read`, `assets:write`, `reports:read`, `transfers:approve`). Route middleware checks permission and, where required, role. Services additionally enforce school or municipality scope so hidden UI is not the security boundary.

Typical capabilities:

- **State Administrator:** full administration, including users, municipalities, categories, and cross-scope assets
- **Municipal Officer:** read and approve within the municipality; cannot create assets or manage users
- **School Administrator:** create/edit/deactivate own-school assets; request maintenance and transfers; cannot approve those workflows

Out-of-scope identifiers return **404** or **403**, not other tenants’ payloads.

## Database overview

Geographic hierarchy: **Province → Municipality → School → Asset**.

Principal tables:

- `users`, `roles`
- `municipalities`, `schools`
- `asset_categories`, `asset_statuses`, `assets`
- `asset_history` (append-only lifecycle events)
- `maintenance_requests`
- `asset_transfers`
- `asset_tag_sequences`

Assets use **soft deactivation** (`deleted_at`). Related history and completed workflow rows are retained. Operational inventory and assignment dropdowns use active records.

Apply schema with `database/run_migrations.sql`. Optional demo data uses `database/run_seeds.sql`.

## Security notes

- Passwords are hashed (bcrypt)
- JWT secret must be unique in production
- CORS is origin-restricted
- Helmet is enabled on the API
- Input is validated with express-validator

## Deployment architecture

1. PostgreSQL instance with backups
2. Node API process behind TLS
3. Static frontend (`frontend/dist`) with SPA fallback
4. Frontend `VITE_API_URL` pointing at the API `/api/v1`

See `docs/Deployment-Guide.md` for commands and environment variables.
