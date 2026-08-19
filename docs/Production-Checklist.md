# SAMS Nepal — Production Checklist

School Asset Management System · Version 1.0.0

Use this list before a production release. Localhost values belong only in development `.env` files. Production values must be set on the host and must not be committed.

Related documents: `docs/Deployment-Guide.md`, `docs/Technical-Documentation.md`, `docs/User-Guide.md`.

## Frontend deployment

- [ ] `frontend/.env` (or CI secrets) sets `VITE_API_URL` to the **public** API base including `/api/v1`
- [ ] `VITE_API_URL` is **not** `http://localhost:...` in the production build
- [ ] From `frontend/`: `npm ci` then `npm run build` succeeds
- [ ] `frontend/dist/` is published to the static host (Cloudflare Pages: root `frontend`, output `dist`)
- [ ] SPA fallback is configured (unknown paths serve `index.html`)
- [ ] Favicon and `/assets/logo.png` are reachable on the live origin
- [ ] Browser title shows `SAMS Nepal` after login

Local development reference (not production):

```
VITE_API_URL=http://localhost:5001/api/v1
Frontend origin: http://localhost:5173
```

## Backend deployment

- [ ] `NODE_ENV=production`
- [ ] `PORT` is set to the platform listen port
- [ ] From `backend/`: `npm ci` then `npm start` (Render: root `backend`, health `/health`)
- [ ] Reverse proxy or platform TLS terminates HTTPS
- [ ] `CORS_ORIGIN` is the exact frontend origin (scheme + host, no trailing path)
- [ ] `GET /health` and `GET /api/v1/health` return success
- [ ] `GET /api/docs` loads if API docs should remain available (disable or restrict if not)

Local development reference (not production):

```
PORT=5001
CORS_ORIGIN=http://localhost:5173
```

## Database deployment

- [ ] Production PostgreSQL instance is separate from development (Neon or equivalent)
- [ ] `DATABASE_URL` points at production and uses SSL (`sslmode=require` where required)
- [ ] Migrations applied: `database/run_migrations.sql`
- [ ] Seed data reviewed: development passwords from `database/run_seeds.sql` are **not** left in production
- [ ] Backups are scheduled and restore has been tested at least once in a non-production copy

Local development reference (not production):

```
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Do not put production connection strings in this repository.

## Environment variables

| Variable | Where | Local example | Production |
|---|---|---|---|
| `VITE_API_URL` | Frontend build | `http://localhost:5001/api/v1` | `https://<api-host>/api/v1` |
| `NODE_ENV` | Backend | `development` | `production` |
| `PORT` | Backend | `5000` or `5001` | Platform port |
| `APP_VERSION` | Backend | `1.0.0` | Release version |
| `DATABASE_URL` | Backend | `postgresql://USER:PASSWORD@HOST:PORT/DATABASE` | Managed DB + SSL |
| `JWT_SECRET` | Backend | dev placeholder | Long unique secret |
| `JWT_EXPIRES_IN` | Backend | `24h` | Policy-appropriate TTL |
| `CORS_ORIGIN` | Backend | `http://localhost:5173` | Live frontend origin |

Required for a working production system: `VITE_API_URL`, `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`.

Templates: `frontend/.env.example`, `backend/.env.example`. Never commit real production `.env` files.

## Security checklist

- [ ] `JWT_SECRET` is unique, long, and not the development fallback
- [ ] HTTPS on frontend and API
- [ ] CORS allows only the production frontend origin
- [ ] Official demo/seed accounts are disabled or passwords rotated
- [ ] Database role is least-privilege (not a superuser for the app)
- [ ] Backups are encrypted at rest if the platform supports it
- [ ] API error responses do not expose stack traces (`NODE_ENV=production`)
- [ ] File uploads / extra packages were not added; attack surface stays the current Express app

## Post-deployment verification

- [ ] Login succeeds with a production administrator account
- [ ] Wrong password is rejected
- [ ] Logout prevents reuse of the previous token
- [ ] Dashboard KPIs load for each role
- [ ] Asset list is scoped (officer/school do not see other tenants)
- [ ] Create/edit/deactivate still follow existing permissions
- [ ] One report XLSX and one PDF export succeed
- [ ] `/about` and `/profile` show SAMS Nepal branding and version
- [ ] Browser tab icon is the SAMS logo (hard-refresh if an old favicon is cached)
- [ ] Unauthorized routes redirect authenticated users to the dashboard with the permission notice
