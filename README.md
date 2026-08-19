# SAMS Nepal

School Asset Management System (v1.0.0)

SAMS Nepal is a web application for tracking school assets, maintenance, transfers, reports, and administration with role-based access.

## Documentation

| Document | Description |
|---|---|
| [docs/User-Guide.md](docs/User-Guide.md) | How to use the application |
| [docs/Deployment-Guide.md](docs/Deployment-Guide.md) | How to build and run frontend, backend, and database |
| [docs/Production-Checklist.md](docs/Production-Checklist.md) | Release checklist |
| [docs/Technical-Documentation.md](docs/Technical-Documentation.md) | Architecture, RBAC, and folder structure |
| [docs/SAMS-Nepal-Architecture-Plan.html](docs/SAMS-Nepal-Architecture-Plan.html) | As-built architecture plan (HTML) |
| [docs/SAMS-Nepal-Architecture-Plan.pdf](docs/SAMS-Nepal-Architecture-Plan.pdf) | As-built architecture plan (PDF) |
| [docs/API-CONTRACT.md](docs/API-CONTRACT.md) | REST API specification |
| [docs/ER-DIAGRAM.md](docs/ER-DIAGRAM.md) | Database model |

## Local development (not production)

Typical local values:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5001` (`PORT=5001` in your local `backend/.env`, which is not committed)
- Frontend API base: `VITE_API_URL=http://localhost:5001/api/v1`
- PostgreSQL: set `DATABASE_URL` in local `backend/.env` using placeholders from `backend/.env.example`

```
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
```

Copy `backend/.env.example` and `frontend/.env.example` before the first run. Production hosts must replace every localhost value. See the deployment guide and production checklist.
