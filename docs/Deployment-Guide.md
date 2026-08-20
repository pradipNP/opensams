# SAMS Nepal — Deployment Guide

School Asset Management System · Version 1.0.0

This guide describes how to build and run the SAMS Nepal frontend and backend for production. It does not deploy the application for you.

## Architecture (runtime)

- **Frontend:** Vue 3 single-page application (Vite). Serves static files from a web server or CDN.
- **Backend:** Node.js / Express API on `/api/v1`.
- **Database:** PostgreSQL.
- The browser calls the API using `VITE_API_URL`. The API connects to PostgreSQL using `DATABASE_URL`.

## Prerequisites

- Node.js 20 or later
- npm
- PostgreSQL 14 or later (managed instance or self-hosted)
- Ability to set environment variables on the host

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `NODE_ENV` | Recommended | Use `production` in production |
| `PORT` | No (default `5000`) | HTTP listen port |
| `APP_VERSION` | No (default `1.0.0`) | Reported by health/root |
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `JWT_SECRET` | **Yes** in production | Signing secret for access tokens |
| `JWT_EXPIRES_IN` | No (default `24h`) | Token lifetime |
| `CORS_ORIGIN` | Recommended | Exact frontend origin, e.g. `https://app.example.com` |

Example (placeholders only — replace every value on the host):

```
NODE_ENV=production
PORT=5000
APP_VERSION=1.0.0
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
JWT_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://YOUR_FRONTEND_ORIGIN
```

Copy `backend/.env.example` and replace secrets. Never commit production secrets.

### Frontend (`frontend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | **Yes** | Public API base, including `/api/v1` |

Example:

```
VITE_API_URL=https://YOUR_API_HOST/api/v1
```

Copy `frontend/.env.example`. Vite inlines this value at **build** time. Changing it later requires a new frontend build.

## Database setup

From the `database/` directory:

```
psql -U postgres -d sams_nepal -f run_migrations.sql
psql -U postgres -d sams_nepal -f run_seeds.sql
```

Use a dedicated production database. Change or disable development seed passwords before going live. Regenerated password hashes should be created with the backend hashing utility, not reused from development seeds.

## Backend deployment

From `backend/`:

```
npm ci
npm start
```

Development (not for production):

```
npm run dev
```

The process listens on `PORT`. Confirm:

- `GET /health`
- `GET /api/v1/health`
- `GET /api/docs` (Swagger UI)

Place a reverse proxy (nginx, Caddy, or a platform load balancer) in front of Node if TLS termination is required. Restrict CORS to the frontend origin.

## Frontend deployment

From `frontend/`:

```
npm ci
npm run build
```

This writes a static site to `frontend/dist/`.

Serve `dist/` with any static host (nginx, object storage + CDN, or a platform static site). Configure the host for SPA fallback: unknown paths should return `index.html` so Vue Router history mode works.

Preview the production build locally:

```
npm run preview
```

## Cloudflare Pages (frontend)

The frontend is a static Vite build and can be hosted on Cloudflare Pages.

1. Set the Pages project root to `frontend` (or set the build root equivalently in the dashboard).
2. Build command: `npm ci && npm run build`
3. Output directory: `dist`
4. Environment variable (build time): `VITE_API_URL=https://YOUR_API_HOST/api/v1`
5. Vue Router history mode: `frontend/public/_redirects` is copied into `dist` and sends unknown paths to `index.html`. Existing files (including `/assets/logo.png`) are still served when present.
6. Confirm the Pages origin is the exact value used in backend `CORS_ORIGIN` (scheme + host, no trailing slash).

Do not set `VITE_API_URL` to a localhost address in the Pages build.

## Render (backend)

The API is a Node.js process and can run as a Render Web Service.

1. Root directory: `backend`
2. Runtime: Node 20 or later (`engines.node` is `>=20`)
3. Build command: `npm ci`
4. Start command: `npm start`
5. Health check path: `/health` (also available at `/api/v1/health`)
6. Set `PORT` from Render (the app already listens on `process.env.PORT`)

Environment variables on Render (never commit these):

| Variable | Notes |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Neon (or other) connection string with `sslmode=require` |
| `JWT_SECRET` | Long unique secret, not any documented placeholder |
| `CORS_ORIGIN` | Exact Cloudflare Pages origin |
| `JWT_EXPIRES_IN` | Optional; default `24h` |
| `APP_VERSION` | Optional; default `1.0.0` |
| `DEMO_RESET_ENABLED` | Optional. Set `true` only for the public portfolio demo |
| `DEMO_RESET_INTERVAL_HOURS` | Optional; default `24`. Restores seed users/schools/assets |

Manual restore (same snapshot): from `backend/` with `DEMO_RESET_FORCE=true`, run `npm run reset-demo`. From `database/`, `psql "$DATABASE_URL" -f reset_demo.sql`.

OpenAPI UI is served at `/api/docs`. Restrict or disable it on the platform if you do not want the contract public.

`backend/Dockerfile` can be used instead of a native Node service if you prefer a container. `.dockerignore` excludes `.env`.

Logout token revocation is stored in process memory. A multi-instance Render service will not share that list; use a single instance unless you add shared storage later.

## Neon (database)

PostgreSQL on Neon is compatible with this API.

1. Create a Neon project and database (name is your choice; local docs often use `sams_nepal`).
2. Copy the connection string into Render `DATABASE_URL`. Include `sslmode=require`.
3. From a machine that can reach Neon, apply schema:

```
psql "$DATABASE_URL" -f database/run_migrations.sql
```

4. Optional development seed:

```
psql "$DATABASE_URL" -f database/run_seeds.sql
```

Do **not** load development seeds into a public production database without rotating every seeded password. Seed accounts are for local/demo use.

The API enables TLS for the pool when `DATABASE_URL` contains `sslmode=require` or `PGSSLMODE=require`.

## Production checklist

- [ ] `NODE_ENV=production`
- [ ] Strong unique `JWT_SECRET`
- [ ] `CORS_ORIGIN` matches the live frontend origin
- [ ] `VITE_API_URL` points at the live API `/api/v1`
- [ ] PostgreSQL backups are scheduled
- [ ] TLS is enabled on public endpoints
- [ ] Development seed accounts are rotated or disabled
- [ ] `npm run build` succeeds for the frontend
- [ ] Health endpoints respond
- [ ] Login, scoped asset list, and one report export are verified after release

## Local reference ports (development)

These are typical local values, not production defaults:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001` (if `PORT=5001`)
- PostgreSQL: often published on host port `5433` when using a container
