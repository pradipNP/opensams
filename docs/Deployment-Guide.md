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

Example:

```
NODE_ENV=production
PORT=5001
APP_VERSION=1.0.0
DATABASE_URL=postgresql://user:password@host:5432/sams_nepal?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-frontend-origin
```

Copy `backend/.env.example` and replace secrets. Never commit production secrets.

### Frontend (`frontend/.env`)

| Variable | Required | Purpose |
|---|---|---|
| `VITE_API_URL` | **Yes** | Public API base, including `/api/v1` |

Example:

```
VITE_API_URL=https://your-api-origin/api/v1
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
