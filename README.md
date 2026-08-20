# SAMS Nepal

**School Asset Management System** · Version 1.0.0

Asset tracking, maintenance, transfers, and reporting for schools — with role-based access across province, municipality, and school.

This is an independent portfolio project. It is not an official government production system.

| | |
|---|---|
| **Author** | Pradip Kumar Prajapati |
| **Version** | 1.0.0 |
| **License** | [MIT](LICENSE) |
| **Copyright** | © 2026 Pradip Kumar Prajapati |

## Features

- JWT authentication and three roles (State Administrator, Municipal Officer, School Administrator)
- Scoped inventory: assets, categories, schools, and municipalities
- Maintenance and inter-school transfer workflows
- Dashboard KPIs and reports (XLSX / PDF)
- User administration for the State Administrator role

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Vue 3, Vite, Vue Router, Pinia, Tailwind CSS |
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Auth | JWT, bcrypt, RBAC |

## Demo credentials

These accounts are for a **public portfolio demo**. Anyone can sign in. Visitors can create or change records.

The hosted demo can restore the original seed snapshot on a timer (default every 24 hours) when `DEMO_RESET_ENABLED=true` on the API. That is optional and off unless you set it. Local databases are not reset unless you run the reset yourself.

| Role | Email | Password |
|---|---|---|
| State Administrator | `state.admin@sams.gov.np` | `password` |
| Municipal Officer | `municipal.butwal@sams.gov.np` | `password` |
| School Administrator | `school.kmg@sams.gov.np` | `password` |

Try each role to see scoped dashboards, assets, maintenance, transfers, and reports.

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

## Local development

Requires Node.js 20+ and PostgreSQL. Copy `backend/.env.example` and `frontend/.env.example` to `.env` before the first run. Do not commit `.env` files.

Typical local values:

- Frontend: `http://localhost:5173`
- API: `http://localhost:5001` (`PORT=5001` in your local `backend/.env`)
- Frontend API base: `VITE_API_URL=http://localhost:5001/api/v1`
- PostgreSQL: set `DATABASE_URL` in local `backend/.env`

```
cd backend
npm install
npm run dev

cd frontend
npm install
npm run dev
```

Production hosts must replace every localhost value. See the [deployment guide](docs/Deployment-Guide.md) and [production checklist](docs/Production-Checklist.md).

## License

This project is licensed under the [MIT License](LICENSE).

Copyright © 2026 Pradip Kumar Prajapati. See `LICENSE` for terms.
