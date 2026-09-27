# BSofts-School — API Contracts & Standards Specification

> Standardized REST contracts, headers, pagination format, response envelopes, and error formatting across the NestJS API.  
> **Last Updated**: 2026-09-22

---

## 1. Global Request Headers

Every request to `https://bsofts-school.onrender.com/api` (or local `http://localhost:3025/api`) must provide:

| Header | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `Authorization` | Yes* | Bearer JWT obtained from `/api/auth/login` | `Bearer eyJhbGciOi...` |
| `x-tenant-id` | Yes | Active tenant organization identifier | `9d894ea6-46c6-49a8-9a6c-f2817c7d079d` |
| `x-establishment-id` | Yes | Active school campus identifier (or `ALL`) | `ab1d3125-7c44-4f71-b634-bd3cda10c3c0` |
| `x-academic-year-id` | Conditional | Active academic year for temporal queries | `635e7a37-2cf4-486e-9dcc-41f188acf992` |
| `Content-Type` | Yes | Body format | `application/json` |

*\*Public endpoints (`/auth/login`, `/auth/register`, `/landing/plans`) do not require the Authorization header.*

---

## 2. Standard Response Envelopes

### Success Envelope (Single Entity / Action)
```json
{
  "success": true,
  "data": {
    "id": "uuid-v4",
    "name": "...",
    "createdAt": "2026-09-22T10:00:00.000Z"
  },
  "message": "Operation completed successfully"
}
```

### Paginated List Envelope (`PaginatedDto<T>`)
```json
{
  "data": [ ... ],
  "meta": {
    "total": 142,
    "page": 1,
    "limit": 50,
    "totalPages": 3,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

### Standard Query Parameters for Lists (`PaginationQueryDto`)
* `page`: Integer, defaults to `1`.
* `limit`: Integer, defaults to `50` (maximum `100`).
* `search`: String, case-insensitive partial match across primary search fields.
* `sortBy`: String, field name to order by (e.g. `createdAt`, `name`, `amount`).
* `sortOrder`: String, `'asc'` or `'desc'`.
* `includeDeleted`: Boolean, when `true`, includes soft-deleted items (`isDeleted = true`).

---

## 3. Standard Error Envelope

When any error occurs, the API returns a structured error object:
```json
{
  "success": false,
  "error": {
    "code": "Bad Request",
    "message": "Validation failed",
    "timestamp": "2026-09-22T10:05:11.496Z",
    "path": "/api/employees"
  }
}
```

### Zero-Error Sanitization Policy
* With `forbidNonWhitelisted: false` in `AppValidationPipe`, non-whitelisted auxiliary properties sent by client forms are **silently stripped**, preventing 400 Bad Request interruptions.
* Any missing mandatory fields or invalid formats return clean, actionable error messages in `message`.
