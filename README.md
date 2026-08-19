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
| [docs/API-CONTRACT.md](docs/API-CONTRACT.md) | REST API specification |
| [docs/ER-DIAGRAM.md](docs/ER-DIAGRAM.md) | Database model |

## Local development (not production)

Typical local values:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5001` (`PORT=5001` in `backend/.env`)
- Frontend API base: `VITE_API_URL=http://localhost:5001/api/v1`
- PostgreSQL: see `backend/.env.example` (`localhost:5433` when using the published Docker port)

```
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
```

Copy `backend/.env.example` and `frontend/.env.example` before the first run. Production hosts must replace every localhost value. See the deployment guide and production checklist.
