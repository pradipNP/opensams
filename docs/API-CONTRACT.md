# SAMS Nepal — API Contract v1.0

> School Asset Management System · REST API Specification  
> Base URL: `/api/v1` · August 2026

---

## General Conventions

### Base URLs

| Environment | URL |
|-------------|-----|
| Production | `https://sams-api.onrender.com/api/v1` |
| Development | `http://localhost:5000/api/v1` |

### Authentication

All endpoints except `POST /auth/login` and `GET /assets/verify/:tag` require:

```
Authorization: Bearer <jwt_token>
```

### Response Envelope

**Success**

```json
{
  "success": true,
  "data": { },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

`meta` is included only on paginated list endpoints.

**Error**

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have access to this resource",
    "details": []
  }
}
```

### Error Codes

| HTTP | Code | Description |
|------|------|-------------|
| 400 | `VALIDATION_ERROR` | Invalid request body or query params |
| 401 | `UNAUTHORIZED` | Missing or invalid JWT |
| 403 | `FORBIDDEN` | Role/scope denied |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate asset_tag, email, etc. |
| 500 | `INTERNAL_ERROR` | Server error |

### Pagination Query Params

| Param | Default | Max |
|-------|---------|-----|
| `page` | 1 | — |
| `limit` | 20 | 100 |
| `sort` | `created_at` | — |
| `order` | `desc` | `asc` \| `desc` |

### Data Scoping

All list/detail endpoints automatically filter by user role:

| Role | Scope |
|------|-------|
| `state_admin` | All records |
| `municipal_officer` | Records in assigned `municipality_id` |
| `school_admin` | Records in assigned `school_id` |

---

## 1. Authentication

### POST `/auth/login`

Public. Authenticate user and receive JWT.

**Request**

```json
{
  "email": "state.admin@sams.gov.np",
  "password": "password"
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": "24h",
    "user": {
      "id": "uuid",
      "email": "state.admin@sams.gov.np",
      "fullName": "Rajesh Sharma",
      "role": "state_admin",
      "roleName": "State Administrator",
      "permissions": ["assets:read", "assets:write", ...],
      "provinceId": "uuid",
      "municipalityId": null,
      "schoolId": null
    }
  }
}
```

**Response `401`**

```json
{
  "success": false,
  "error": { "code": "UNAUTHORIZED", "message": "Invalid email or password" }
}
```

---

### POST `/auth/logout`

Authenticated. Invalidate session (client clears token; optional server blacklist).

**Response `200`**

```json
{
  "success": true,
  "data": { "message": "Logged out successfully" }
}
```

---

### GET `/auth/me`

Authenticated. Return current user profile.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "state.admin@sams.gov.np",
    "fullName": "Rajesh Sharma",
    "role": "state_admin",
    "roleName": "State Administrator",
    "permissions": ["assets:read", ...],
    "provinceId": "uuid",
    "municipalityId": null,
    "schoolId": null,
    "lastLoginAt": "2026-08-18T06:00:00Z"
  }
}
```

---

## 2. Dashboard

### GET `/dashboard/kpis`

**Permission:** `dashboard:read`  
**Scope:** Role-scoped

**Response `200`**

```json
{
  "success": true,
  "data": {
    "totalAssets": 500,
    "activeAssets": 352,
    "damagedAssets": 58,
    "underMaintenance": 48,
    "disposedAssets": 25,
    "lostAssets": 17,
    "totalSchools": 27,
    "totalAssetValue": 12450000.00,
    "pendingMaintenance": 12,
    "pendingTransfers": 3,
    "approvedTransfers": 1,
    "completedTransfers": 8
  }
}
```

---

### GET `/dashboard/charts/municipality`

**Permission:** `dashboard:read`  
**Roles:** `state_admin`, `municipal_officer`

**Response `200`**

```json
{
  "success": true,
  "data": {
    "labels": ["Butwal Sub-Metropolitan City", "Siddharthanagar Municipality", "Lumbini Sanskritik Municipality"],
    "values": [185, 128, 187],
    "codes": ["BTW", "SDH", "LSM"]
  }
}
```

---

### GET `/dashboard/charts/category`

**Permission:** `dashboard:read`

**Response `200`**

```json
{
  "success": true,
  "data": {
    "labels": ["Desks", "Laptops", "Chairs", ...],
    "values": [45, 38, 52, ...],
    "departments": ["Classroom Assets", "Computer Lab Assets", ...]
  }
}
```

---

### GET `/dashboard/charts/status`

**Permission:** `dashboard:read`

**Response `200`**

```json
{
  "success": true,
  "data": {
    "labels": ["Active", "Damaged", "Under Maintenance", "Disposed", "Lost"],
    "values": [352, 58, 48, 25, 17],
    "colors": ["#16A34A", "#DC2626", "#D97706", "#64748B", "#7C3AED"]
  }
}
```

---

### GET `/dashboard/charts/transfers`

**Permission:** `dashboard:read`

**Response `200`**

```json
{
  "success": true,
  "data": {
    "labels": ["Draft", "Pending", "Approved", "Rejected", "Completed", "Cancelled"],
    "values": [0, 3, 1, 0, 8, 1]
  }
}
```

---

## 3. Provinces

### GET `/provinces`

**Permission:** `municipalities:read`  
**Roles:** `state_admin`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Lumbini Province",
      "code": "LUM",
      "isActive": true,
      "municipalityCount": 3
    }
  ]
}
```

---

### GET `/provinces/:id`

**Permission:** `municipalities:read`  
**Roles:** `state_admin`

**Response `200`** — same DTO as list item (`id`, `name`, `code`, `isActive`, `municipalityCount`).

**Errors:** `400` invalid UUID, `401`, `403`, `404` if the province does not exist.

---

## 4. Municipalities

### GET `/municipalities`

**Permission:** `municipalities:read`  
**Roles:** `state_admin`, `municipal_officer` (own only)

**Query params:** `provinceId`, `search`, `page`, `limit`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Butwal Sub-Metropolitan City",
      "code": "BTW",
      "district": "Rupandehi",
      "provinceId": "uuid",
      "provinceName": "Lumbini Province",
      "schoolCount": 10,
      "assetCount": 185,
      "isActive": true
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

### GET `/municipalities/:id`

**Roles:** `state_admin`, `municipal_officer` (own)

---

### POST `/municipalities`

**Permission:** `municipalities:write`  
**Roles:** `state_admin`

**Request**

```json
{
  "name": "Butwal Sub-Metropolitan City",
  "code": "BTW",
  "provinceId": "uuid",
  "district": "Rupandehi"
}
```

`name`, `code`, `provinceId`, and `district` are required. `provinceId` must exist.

**Response `201`** — same DTO as municipality detail (`schoolCount`, `assetCount`, timestamps).

**Errors:** `400` validation / invalid provinceId, `401`, `403`, `409` duplicate name or code.

Municipalities are never hard-deleted.

---

### PUT `/municipalities/:id`

**Permission:** `municipalities:write`  
**Roles:** `state_admin`

**Request** (all fields optional)

```json
{
  "name": "Butwal Sub-Metropolitan City",
  "code": "BTW",
  "provinceId": "uuid",
  "district": "Rupandehi",
  "isActive": false
}
```

Deactivate with `"isActive": false`.

**Response `200`** — municipality detail DTO.

**Errors:** `400`, `401`, `403`, `404`, `409` duplicate name or code.

---

## 5. Schools

### GET `/schools`

**Permission:** `schools:read`  
**Scope:** Role-scoped

**Query params:** `municipalityId`, `search`, `schoolType`, `page`, `limit`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Kalika Manavgyan Secondary School",
      "schoolCode": "BTW-KMG",
      "schoolType": "Secondary",
      "address": null,
      "municipalityId": "uuid",
      "municipalityName": "Butwal Sub-Metropolitan City",
      "municipalityCode": "BTW",
      "assetCount": 19,
      "isActive": true
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 27, "totalPages": 2 }
}
```

---

### GET `/schools/:id`

**Permission:** `schools:read`  
**Scope:** Role-scoped

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Kalika Manavgyan Secondary School",
    "schoolCode": "BTW-KMG",
    "schoolType": "Secondary",
    "address": null,
    "municipality": {
      "id": "uuid",
      "name": "Butwal Sub-Metropolitan City",
      "code": "BTW"
    },
    "stats": {
      "totalAssets": 19,
      "activeAssets": 14,
      "damagedAssets": 2,
      "underMaintenance": 2,
      "totalValue": 485000.00
    },
    "isActive": true
  }
}
```

---

### GET `/schools/:id/assets`

**Permission:** `assets:read`  
**Scope:** Role-scoped. School outside scope → `404`.

Thin alias of `GET /assets` with `schoolId` taken from the path. Extra query `schoolId` cannot widen access. Same filters, pagination, and response shape as `GET /assets`.

---

### POST `/schools`

**Permission:** `schools:write`  
**Roles:** `state_admin`

**Request**

```json
{
  "name": "Kalika Manavgyan Secondary School",
  "schoolCode": "BTW-KMG",
  "schoolType": "Secondary",
  "municipalityId": "uuid",
  "address": "Butwal-5, Rupandehi"
}
```

`name`, `schoolCode`, `schoolType`, and `municipalityId` are required. `municipalityId` must exist.

**Response `201`** — school detail DTO.

**Errors:** `400`, `401`, `403`, `409` duplicate `schoolCode`.

Schools are never hard-deleted.

---

### PUT `/schools/:id`

**Permission:** `schools:write`  
**Roles:** `state_admin`

**Request** (all fields optional)

```json
{
  "name": "Kalika Manavgyan Secondary School",
  "schoolCode": "BTW-KMG",
  "schoolType": "Secondary",
  "municipalityId": "uuid",
  "address": "Butwal-5, Rupandehi",
  "isActive": false
}
```

**Response `200`** — school detail DTO.

**Errors:** `400`, `401`, `403`, `404`, `409` duplicate `schoolCode`.

---

## 6. Assets

### GET `/assets`

**Permission:** `assets:read`  
**Scope:** Role-scoped

**Query params:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | int | Page number |
| `limit` | int | Items per page |
| `search` | string | Search name, asset_tag, vendor |
| `categoryId` | uuid | Filter by category |
| `statusId` | uuid | Filter by status |
| `schoolId` | uuid | Filter by school |
| `municipalityId` | uuid | Filter by municipality |
| `department` | string | Filter by department |
| `sort` | string | `created_at`, `name`, `purchase_cost`, `asset_tag` |
| `order` | string | `asc` or `desc` |

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetTag": "SAMS-BTW-2026-0001",
      "name": "Desks — BTW-KMG-001",
      "category": { "id": "uuid", "name": "Desks", "department": "Classroom Assets" },
      "status": { "id": "uuid", "name": "Active", "slug": "active", "colorCode": "#16A34A" },
      "school": { "id": "uuid", "name": "Kalika Manavgyan Secondary School", "schoolCode": "BTW-KMG" },
      "municipality": { "id": "uuid", "name": "Butwal Sub-Metropolitan City", "code": "BTW" },
      "department": "Classroom",
      "location": "Room 101",
      "purchaseDate": "2024-03-15",
      "purchaseCost": 12500.00,
      "warrantyExpiry": "2026-03-15",
      "vendor": "Nepal Edu Supplies",
      "qrCode": "https://sams.gov.np/verify/SAMS-BTW-2026-0001",
      "notes": null,
      "createdAt": "2026-01-10T08:00:00Z",
      "updatedAt": "2026-01-10T08:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

---

### GET `/assets/:id`

**Permission:** `assets:read`  
**Scope:** Role-scoped

Full asset detail including `createdBy` and recent history summary.

---

### POST `/assets`

**Permission:** `assets:write`  
**Roles:** `state_admin`, `school_admin` (own school)

**Note:** `assetTag` and `qrCode` are **auto-generated** by the server. Do not send them in the request body.

**Request**

```json
{
  "name": "Dell Latitude Laptop",
  "categoryId": "uuid",
  "schoolId": "uuid",
  "statusId": "uuid",
  "department": "Computer Lab",
  "location": "Lab Block A",
  "purchaseDate": "2026-01-15",
  "purchaseCost": 85000.00,
  "warrantyExpiry": "2028-01-15",
  "vendor": "Rupandehi IT Solutions",
  "notes": "Purchased under government grant"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "assetTag": "SAMS-BTW-2026-042",
    "qrCode": "https://sams.gov.np/verify/SAMS-BTW-2026-042",
    "name": "Dell Latitude Laptop",
    ...
  }
}
```

Server actions on create:
1. Resolve `municipality_id` from `schoolId`
2. Call `generate_asset_tag(municipality_id)`
3. Set `qr_code = default_qr_code(asset_tag)`
4. Insert `asset_history` record with `action: created`

---

### PUT `/assets/:id`

**Permission:** `assets:write`  
**Roles:** `state_admin`, `school_admin` (own school)

**Request** (partial update supported)

```json
{
  "name": "Dell Latitude Laptop (Updated)",
  "statusId": "uuid",
  "location": "Room 203",
  "purchaseCost": 85000.00,
  "notes": "Relocated to Room 203"
}
```

Server logs field changes to `asset_history`.

---

### DELETE `/assets/:id`

**Permission:** `assets:delete`  
**Roles:** `state_admin`, `school_admin` (own school)

Soft delete — sets `deleted_at`. Logs `asset_history` with `action: deleted`.

**Response `200`**

```json
{
  "success": true,
  "data": { "id": "uuid", "deletedAt": "2026-08-18T12:00:00Z" }
}
```

---

### GET `/assets/verify/:tag`

**Public** (no auth). QR scan landing endpoint.

**Example:** `GET /assets/verify/SAMS-BTW-2026-0001`

**Response `200`**

```json
{
  "success": true,
  "data": {
    "assetTag": "SAMS-BTW-2026-0001",
    "name": "Desks — BTW-KMG-001",
    "status": { "name": "Active", "colorCode": "#16A34A" },
    "school": { "name": "Kalika Manavgyan Secondary School" },
    "municipality": { "name": "Butwal Sub-Metropolitan City" },
    "location": "Room 101",
    "verified": true
  }
}
```

---

### GET `/assets/:id/qr`

**Permission:** `assets:read`

Returns QR payload and optional SVG/PNG image data URL for printing labels.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "assetTag": "SAMS-BTW-2026-0001",
    "qrCode": "https://sams.gov.np/verify/SAMS-BTW-2026-0001",
    "qrImageDataUrl": "data:image/png;base64,..."
  }
}
```

---

## 7. Asset History

### GET `/assets/:id/history`

**Permission:** `history:read`  
**Scope:** Role-scoped via asset

**Query params:** `page`, `limit`, `action`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "action": "status_changed",
      "fieldName": "status_id",
      "oldValue": "Active",
      "newValue": "Damaged",
      "changedBy": { "id": "uuid", "fullName": "Amit KC" },
      "notes": "Screen cracked during transport",
      "createdAt": "2026-06-12T10:30:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
}
```

---

## 8. Asset Transfers

Workflow: `draft` → `pending` → `approved` → `completed`. Alternate endings: `rejected`, `cancelled`.

Business rules:
- Asset must exist and must not be soft-deleted
- Asset cannot have another active transfer (`draft`, `pending`, `approved`)
- Asset under maintenance cannot be transferred
- Source and destination schools must be different
- Completing a transfer updates `assets.school_id`; municipality follows the destination school

Every status change writes `asset_history`.

### GET `/transfers`

**Permission:** `transfers:read`  
**Scope:** Role-scoped (municipal officer: from or to school in assigned municipality; school administrator: from or to own school)

**Query params:** `page`, `limit`, `status`, `assetId`, `schoolId`, `municipalityId`, `search`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "asset": { "id": "uuid", "assetTag": "SAMS-BTW-2026-0001", "name": "Projector" },
      "fromSchool": { "id": "uuid", "name": "Kalika Manavgyan Secondary School", "schoolCode": "BTW-KMG" },
      "toSchool": { "id": "uuid", "name": "Amar Secondary School" },
      "requestedBy": { "id": "uuid", "fullName": "Amit KC" },
      "approvedBy": null,
      "status": "pending",
      "reason": "Computer lab expansion",
      "requestedAt": "2026-08-15T09:00:00Z",
      "approvedAt": null,
      "completedAt": null,
      "createdAt": "2026-08-15T09:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

### GET `/transfers/:id`

**Permission:** `transfers:read`

**Response `200`** — transfer detail. Scoped 404 if outside role.

---

### POST `/transfers`

**Permission:** `transfers:request`  
**Roles:** `school_admin` (own school assets), `state_admin`  
Municipal Officer cannot create transfers.

**Request**

```json
{
  "assetId": "uuid",
  "toSchoolId": "uuid",
  "reason": "Computer lab expansion",
  "notes": "Approved by municipality"
}
```

`fromSchoolId` is derived from the asset's current school. Created status is `pending`. Logs `transfer_requested`.

**Response `201`**

---

### PUT `/transfers/:id/approve`

**Permission:** `transfers:approve`  
**Roles:** `municipal_officer`, `state_admin`

`pending` → `approved`. Logs `transfer_approved`.

**Request**

```json
{
  "notes": "Approved by municipal office"
}
```

---

### PUT `/transfers/:id/reject`

**Permission:** `transfers:approve`  
**Roles:** `municipal_officer`, `state_admin`

`pending` → `rejected`. Logs `transfer_rejected`.

**Request**

```json
{
  "rejectionReason": "Asset still required at source school"
}
```

---

### PUT `/transfers/:id/complete`

**Permission:** `transfers:approve`  
**Roles:** `municipal_officer`, `state_admin`

`approved` → `completed`.

Server actions:
- Update `assets.school_id` to `to_school_id` (municipality via destination school)
- Set `completed_at`
- Log `asset_history` with `action: transfer_completed`

---

### PUT `/transfers/:id/cancel`

**Permission:** `transfers:request`  
**Roles:** `school_admin`, `state_admin`

`draft` or `pending` → `cancelled`. Logs `transfer_cancelled`.

---

## 9. Maintenance Requests

### GET `/maintenance`

**Permission:** `maintenance:read`  
**Scope:** Role-scoped

**Query params:** `status`, `priority`, `schoolId`, `assetId`, `page`, `limit`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "asset": { "id": "uuid", "assetTag": "SAMS-BTW-2026-0005", "name": "Desktop Computer" },
      "school": { "id": "uuid", "name": "Kalika Manavgyan Secondary School" },
      "requestedBy": { "id": "uuid", "fullName": "Amit KC" },
      "approvedBy": null,
      "assignedTo": null,
      "status": "pending",
      "priority": "high",
      "description": "Computer does not power on",
      "estimatedCost": 5000.00,
      "actualCost": null,
      "requestedAt": "2026-08-10T14:00:00Z",
      "approvedAt": null,
      "completedAt": null
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 12, "totalPages": 1 }
}
```

---

### POST `/maintenance`

**Permission:** `maintenance:request`  
**Roles:** `school_admin`, `state_admin`

**Request**

```json
{
  "assetId": "uuid",
  "priority": "high",
  "description": "Projector bulb needs replacement",
  "estimatedCost": 3500.00,
  "notes": "Urgent — needed for upcoming exams"
}
```

`schoolId` derived from asset. Asset status may auto-update to `under_maintenance` on approval.

**Response `201`**

---

### PUT `/maintenance/:id/approve`

**Permission:** `maintenance:approve`  
**Roles:** `municipal_officer`, `state_admin`

**Request**

```json
{
  "assignedTo": "Butwal IT Services",
  "notes": "Approved for repair"
}
```

---

### PUT `/maintenance/:id/reject`

**Permission:** `maintenance:approve`

**Request**

```json
{
  "rejectionReason": "Issue resolved locally"
}
```

---

### PUT `/maintenance/:id/complete`

**Permission:** `maintenance:approve` or assigned technician flow

**Request**

```json
{
  "actualCost": 3200.00,
  "notes": "Bulb replaced, tested working"
}
```

Server actions:
- Set `status` to `completed`, `completed_at` to now
- Restore asset status to `active` if was `under_maintenance`
- Log `asset_history` with `action: maintenance_completed`

---

## 10. Asset Categories

### GET `/categories`

**Permission:** `categories:read` (all authenticated users)

**Query params:** `department`, `search`

`assetCount` excludes soft-deleted assets (`deleted_at IS NOT NULL`). Inactive categories are included.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Desks",
      "department": "Classroom Assets",
      "description": "Student and teacher desks",
      "assetCount": 45,
      "isActive": true
    }
  ]
}
```

---

### POST `/categories`

**Permission:** `categories:write`  
**Roles:** `state_admin`

**Request**

```json
{
  "name": "Desks",
  "department": "Classroom Assets",
  "description": "Student and teacher desks"
}
```

`name` and `department` are required (1–100 characters). `description` is optional.

**Response `201`** — same DTO as list item, including `assetCount` (0 for a new category).

**Errors:** `400` validation, `401`, `403`, `409` if the category name already exists (case-insensitive).

Categories are never hard-deleted.

---

### PUT `/categories/:id`

**Permission:** `categories:write`  
**Roles:** `state_admin`

**Request** (all fields optional; omitted fields keep their current values)

```json
{
  "name": "Desks",
  "department": "Classroom Assets",
  "description": "Student and teacher desks",
  "isActive": false
}
```

Deactivate with `"isActive": false`. Never hard-deletes the row.

**Response `200`** — same DTO as list item.

**Errors:** `400` validation, `401`, `403`, `404`, `409` duplicate name.

---

## 11. Asset Statuses

### GET `/statuses`

All authenticated users. Read-only. Sorted by `sortOrder` ascending.

**Response `200`**

```json
{
  "success": true,
  "data": [
    { "id": "uuid", "name": "Active", "slug": "active", "colorCode": "#16A34A", "sortOrder": 1 }
  ]
}
```

---

## 12. Users

State Administrator only. `password_hash` is never returned.

### GET `/users`

**Permission:** `users:read`  
**Roles:** `state_admin`

**Query params:** `role` (`state_admin` \| `municipal_officer` \| `school_admin`), `municipalityId`, `schoolId`, `search`, `isActive`, `page`, `limit`

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "email": "school.kmg@sams.gov.np",
      "fullName": "Amit KC",
      "role": "school_admin",
      "roleName": "School Administrator",
      "permissions": ["schools:read", "assets:read"],
      "provinceId": "uuid",
      "municipalityId": "uuid",
      "schoolId": "uuid",
      "isActive": true
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

### GET `/users/:id`

**Permission:** `users:read`  
**Roles:** `state_admin`

**Response `200`** — list DTO plus `lastLoginAt` and `createdAt`.

**Errors:** `400` invalid UUID, `401`, `403`, `404`.

---

### POST `/users`

**Permission:** `users:write`  
**Roles:** `state_admin`

**Request**

```json
{
  "email": "school.new@sams.gov.np",
  "password": "SecurePass@123",
  "fullName": "New School Admin",
  "role": "school_admin",
  "provinceId": "uuid",
  "municipalityId": "uuid",
  "schoolId": "uuid"
}
```

Assignment rules:

- `state_admin` — `municipalityId` and `schoolId` must be null; `provinceId` optional
- `municipal_officer` — `municipalityId` required; `schoolId` null; province taken from the municipality
- `school_admin` — `schoolId` required; `municipalityId` derived from the school if omitted

Password minimum length: 8. Duplicate email → `409`.

**Response `201`** — user detail DTO.

---

### PUT `/users/:id`

**Permission:** `users:write`  
**Roles:** `state_admin`

Partial update of `fullName`, `email`, `password`, `role`, `provinceId`, `municipalityId`, `schoolId`, `isActive`. Same assignment rules as create. Password is re-hashed when provided.

Self-deactivation → `400`. Demoting or deactivating the last active `state_admin` → `409`.

---

### DELETE `/users/:id`

**Permission:** `users:write`  
**Roles:** `state_admin`

Soft deactivate — sets `is_active = false`. The row is not deleted.

**Response `200`**

```json
{ "success": true, "data": { "id": "uuid", "isActive": false } }
```

Self-deactivation → `400`. Last active `state_admin` → `409`. Inactive users cannot log in.

---

## 13. Reports

**Permission for all report endpoints:** `reports:read`  
Role-scoped. Extra `municipalityId` / `schoolId` filters cannot widen access.

### GET `/reports/inventory`

Paginated row-level asset inventory. Soft-deleted assets are excluded.

**Query params:** `page`, `limit`, `search`, `municipalityId`, `schoolId`, `categoryId`, `statusId`, `department`, `purchaseDateFrom`, `purchaseDateTo`, `sort`, `order` (same conventions as `GET /assets`)

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetTag": "SAMS-BTW-2026-0039",
      "name": "Laptops — BTW-KMG-001",
      "category": { "id": "uuid", "name": "Laptops", "department": "Computer Lab Assets" },
      "status": { "id": "uuid", "name": "Active", "slug": "active", "colorCode": "#16A34A" },
      "schoolId": "uuid",
      "school": { "id": "uuid", "name": "Kalika Manavgyan Secondary School", "schoolCode": "BTW-KMG" },
      "municipalityId": "uuid",
      "municipality": { "id": "uuid", "name": "Butwal Sub-Metropolitan City", "code": "BTW" },
      "department": "Computer Lab",
      "location": "Lab Block A",
      "purchaseDate": "2024-06-15",
      "purchaseCost": 12500,
      "warrantyExpiry": "2026-06-15",
      "vendor": "Rupandehi IT Solutions",
      "qrCode": "https://sams.gov.np/verify/SAMS-BTW-2026-0039",
      "notes": null,
      "createdAt": "2026-08-18T10:00:00Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 500, "totalPages": 25 }
}
```

---

### GET `/reports/municipality`

Paginated municipality-level asset aggregates. Soft-deleted assets are excluded. School counts use active schools (same convention as dashboard KPIs).

**Query params:** `page`, `limit`, `search`, `municipalityId`

**Scope:** State Administrator: all municipalities. Municipal Officer: assigned municipality. School Administrator: municipality of assigned school. Extra `municipalityId` cannot widen access.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Butwal Sub-Metropolitan City",
      "code": "BTW",
      "provinceId": "uuid",
      "province": { "id": "uuid", "name": "Lumbini Province" },
      "totalSchools": 10,
      "totalAssets": 190,
      "activeAssets": 130,
      "damagedAssets": 20,
      "underMaintenanceAssets": 15,
      "disposedAssets": 10,
      "lostAssets": 15,
      "totalAssetValue": 4250000
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
}
```

---

### GET `/reports/school`

Paginated school-level asset aggregates. Soft-deleted assets are excluded. Schools with zero assets still appear. Inactive schools are included (same as `GET /schools` and the dashboard school chart; dashboard KPI `totalSchools` counts only active schools).

**Query params:** `page`, `limit`, `search`, `municipalityId`, `schoolId`

**Scope:** State Administrator: all schools. Municipal Officer: schools in assigned municipality. School Administrator: assigned school. Extra filters cannot widen access.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Kalika Manavgyan Secondary School",
      "schoolCode": "BTW-KMG",
      "schoolType": "Secondary",
      "municipalityId": "uuid",
      "municipality": { "id": "uuid", "name": "Butwal Sub-Metropolitan City", "code": "BTW" },
      "provinceId": "uuid",
      "province": { "id": "uuid", "name": "Lumbini Province" },
      "totalAssets": 18,
      "activeAssets": 12,
      "damagedAssets": 2,
      "underMaintenanceAssets": 1,
      "disposedAssets": 2,
      "lostAssets": 1,
      "totalAssetValue": 425000
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 27, "totalPages": 2 }
}
```

---

### GET `/reports/maintenance`

Paginated row-level maintenance request report. Same geographic scope as `GET /maintenance`. Soft-deleted assets are not extra-filtered (same as the maintenance list). `dateFrom` / `dateTo` apply to `requested_at` as inclusive calendar dates. Search matches description, asset tag, or asset name. Default sort is `requested_at DESC`.

`assignedTo` is a free-text string (not a user object), matching `GET /maintenance`. Requested/approved users expose `id` and `fullName` only (no email).

**Query params:** `page`, `limit`, `status`, `priority`, `schoolId`, `municipalityId`, `assetId`, `search`, `dateFrom`, `dateTo`, `sort`, `order`

**Valid status:** `pending`, `approved`, `in_progress`, `completed`, `rejected`, `cancelled`  
**Valid priority:** `low`, `medium`, `high`, `urgent`, `critical`  
**Valid sort:** `requested_at`, `approved_at`, `completed_at`, `priority`, `status`, `estimated_cost`, `actual_cost`

**Scope:** State Administrator: all requests. Municipal Officer: requests for schools in assigned municipality. School Administrator: requests for assigned school. Extra filters cannot widen access.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetId": "uuid",
      "asset": { "id": "uuid", "assetTag": "SAMS-BTW-2026-0001", "name": "Projector" },
      "school": { "id": "uuid", "name": "Amar Secondary School", "schoolCode": "BTW-AMR" },
      "municipality": { "id": "uuid", "name": "Butwal Sub-Metropolitan City", "code": "BTW" },
      "description": "Projector bulb needs replacement",
      "priority": "high",
      "status": "completed",
      "estimatedCost": 1000,
      "actualCost": 900,
      "requestedBy": { "id": "uuid", "fullName": "State Administrator" },
      "assignedTo": null,
      "approvedBy": { "id": "uuid", "fullName": "Municipal Officer" },
      "requestedAt": "2026-08-18T10:00:00.000Z",
      "approvedAt": "2026-08-18T11:00:00.000Z",
      "completedAt": "2026-08-18T12:00:00.000Z",
      "rejectionReason": null,
      "notes": null,
      "createdAt": "2026-08-18T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

---

### GET `/reports/transfers`

Paginated row-level asset transfer report. Same geographic scope as `GET /transfers` (`buildTransferScope`). `dateFrom` / `dateTo` apply to `requested_at` as inclusive calendar dates. Default sort is `requested_at DESC`.

Search matches reason, asset tag, asset name, from/to school name and code, and from/to municipality name and code.

Requested/approved users expose `id` and `fullName` only (no email).

**Query params:** `page`, `limit`, `status`, `schoolId`, `municipalityId`, `assetId`, `search`, `dateFrom`, `dateTo`, `sort`, `order`

**Valid status:** `draft`, `pending`, `approved`, `rejected`, `completed`, `cancelled`  
**Valid sort:** `requested_at`, `approved_at`, `completed_at`, `status`, `transfer_date`

**Scope:** State Administrator: all transfers. Municipal Officer: transfers involving schools in the assigned municipality. School Administrator: transfers involving the assigned school. Extra filters cannot widen access.

**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "assetId": "uuid",
      "asset": { "id": "uuid", "assetTag": "SAMS-BTW-2026-0001", "name": "Printers — BTW-AMR-001" },
      "fromSchool": {
        "id": "uuid",
        "name": "Amar Secondary School",
        "schoolCode": "BTW-AMR",
        "municipality": { "id": "uuid", "name": "Butwal Sub-Metropolitan City", "code": "BTW" }
      },
      "toSchool": {
        "id": "uuid",
        "name": "Kalika Manavgyan Secondary School",
        "schoolCode": "BTW-KMG",
        "municipality": { "id": "uuid", "name": "Butwal Sub-Metropolitan City", "code": "BTW" }
      },
      "status": "completed",
      "reason": "Computer lab expansion",
      "rejectionReason": null,
      "notes": null,
      "transferDate": "2026-08-18",
      "requestedBy": { "id": "uuid", "fullName": "Rajesh Sharma" },
      "approvedBy": { "id": "uuid", "fullName": "Rajesh Sharma" },
      "requestedAt": "2026-08-18T10:00:00.000Z",
      "approvedAt": "2026-08-18T11:00:00.000Z",
      "completedAt": "2026-08-18T12:00:00.000Z",
      "createdAt": "2026-08-18T10:00:00.000Z"
    }
  ],
  "meta": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

---

### GET `/reports/summary`

Non-paginated executive snapshot. Reuses dashboard aggregations (`getKpis`, `assetsByStatus`, `assetsByCategory`, `assetsByMunicipality`, `assetsBySchool`, `transfersByStatus`) plus in-scope `totalMunicipalities`. Same role scope as `GET /dashboard`.

**Query params:** `municipalityId`, `schoolId` (optional; cannot widen access)

**Response `200`**

```json
{
  "success": true,
  "data": {
    "kpis": {
      "totalAssets": 500,
      "activeAssets": 352,
      "damagedAssets": 58,
      "underMaintenance": 48,
      "disposedAssets": 25,
      "lostAssets": 17,
      "totalSchools": 27,
      "totalMunicipalities": 3,
      "totalAssetValue": 12500000,
      "pendingMaintenance": 0,
      "completedMaintenance": 1,
      "pendingTransfers": 0,
      "approvedTransfers": 0,
      "completedTransfers": 1
    },
    "assetsByStatus": [{ "id": "uuid", "name": "Active", "slug": "active", "colorCode": "#16A34A", "value": 352 }],
    "assetsByCategory": [{ "id": "uuid", "name": "Laptops", "department": "Computer Lab Assets", "value": 38 }],
    "assetsByMunicipality": [{ "id": "uuid", "name": "Butwal Sub-Metropolitan City", "code": "BTW", "value": 190 }],
    "assetsBySchool": [{ "id": "uuid", "name": "Kalika Manavgyan Secondary School", "code": "BTW-KMG", "value": 18 }],
    "transfersByStatus": [
      { "name": "Draft", "slug": "draft", "value": 0 },
      { "name": "Pending", "slug": "pending", "value": 0 },
      { "name": "Approved", "slug": "approved", "value": 0 },
      { "name": "Rejected", "slug": "rejected", "value": 0 },
      { "name": "Completed", "slug": "completed", "value": 1 },
      { "name": "Cancelled", "slug": "cancelled", "value": 0 }
    ]
  }
}
```

---

### GET `/reports/:reportType/export`

Unified Excel/PDF export for all six reports. Requires `reports:read`. Uses the **same scoped dataset and filters** as the matching JSON endpoint. `page` and `limit` are ignored.

**Path `reportType`:** `inventory` | `municipality` | `school` | `maintenance` | `transfers` | `summary`  
**Query `format` (required):** `xlsx` | `pdf`

Invalid `reportType` or `format` → `400 VALIDATION_ERROR`.

Row-based exports (inventory, municipality, school, maintenance, transfers) have a hard cap of **5,000 rows**. Over the cap → `400 VALIDATION_ERROR` with a message to apply tighter filters. Results are never silently truncated.

Summary workbooks use multiple sheets: KPIs, Assets by Status, Assets by Category, Assets by Municipality, Transfers by Status.

PDF page layout: A4 landscape for inventory, maintenance, transfers; A4 portrait for municipality, school, summary.

**Filenames (server-generated, never from user input):**

```
sams-inventory-YYYY-MM-DD.xlsx
sams-municipality-YYYY-MM-DD.xlsx
sams-school-YYYY-MM-DD.xlsx
sams-maintenance-YYYY-MM-DD.xlsx
sams-transfers-YYYY-MM-DD.xlsx
sams-summary-YYYY-MM-DD.xlsx
```

PDF uses the same names with `.pdf`.

**Response `200`**

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="sams-inventory-2026-08-18.xlsx"
```

or

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="sams-inventory-2026-08-18.pdf"
```

Binary is generated in memory. No disk writes.

---

## 14. Health Check

### GET `/health`

Public.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "version": "1.0.0",
    "database": "connected",
    "timestamp": "2026-08-18T12:00:00Z"
  }
}
```

---

## JWT Payload Structure

```json
{
  "sub": "user-uuid",
  "email": "state.admin@sams.gov.np",
  "role": "state_admin",
  "permissions": ["assets:read", "assets:write", ...],
  "provinceId": "uuid",
  "municipalityId": null,
  "schoolId": null,
  "iat": 1700000000,
  "exp": 1700086400
}
```

---

## Permission Matrix

| Permission | state_admin | municipal_officer | school_admin |
|------------|:-----------:|:-----------------:|:------------:|
| `dashboard:read` | ✓ | ✓ | ✓ |
| `municipalities:read` | ✓ | — | — |
| `municipalities:write` | ✓ | — | — |
| `schools:read` | ✓ | ✓ | ✓ |
| `schools:write` | ✓ | — | — |
| `assets:read` | ✓ | ✓ | ✓ |
| `assets:write` | ✓ | — | ✓ |
| `assets:delete` | ✓ | — | ✓ |
| `categories:read` | ✓ | ✓ | ✓ |
| `categories:write` | ✓ | — | — |
| `users:read` | ✓ | — | — |
| `users:write` | ✓ | — | — |
| `reports:read` | ✓ | ✓ | ✓ |
| `history:read` | ✓ | ✓ | ✓ |
| `transfers:read` | ✓ | ✓ | ✓ |
| `transfers:request` | ✓ | — | ✓ |
| `transfers:approve` | ✓ | ✓ | — |
| `maintenance:read` | ✓ | ✓ | ✓ |
| `maintenance:request` | ✓ | — | ✓ |
| `maintenance:approve` | ✓ | ✓ | — |

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-08-18 | Initial API contract with provinces, transfers, maintenance, QR verify |
| 1.1 | 2026-08-18 | Phase 6 transfer workflow: approve/reject/complete/cancel, dashboard transfer KPIs and chart |
| 1.2 | 2026-08-18 | Phase 7D: GET /reports/maintenance |
| 1.3 | 2026-08-18 | Phase 7E–7I: transfers/summary reports, Excel/PDF export |
| 1.4 | 2026-08-19 | Phase 8A: provinces, statuses, and category lookup/write APIs |
| 1.5 | 2026-08-19 | Phase 8B–8E: municipality/school writes, school assets alias, user management |
