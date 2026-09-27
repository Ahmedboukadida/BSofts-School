---
name: dynamic-enums-catalog
description: 'Dynamic enum management system enabling metadata-driven select options across backend NestJS and frontend Next.js without requiring database schema redeployments.'
---

# DynamicEnums Catalog Architecture

## 1. Concept & Rationale
Static database enums require database schema migrations (`prisma db push` / `prisma migrate`) to alter. For rapidly evolving educational settings (custom diploma types, room categories, disciplinary types, contract types), `DynamicEnum` provides a flexible, categorized key-value store.

## 2. Database Model
```prisma
model DynamicEnum {
  id          String   @id @default(uuid())
  category    String   // e.g. "ESTABLISHMENT_CATEGORY", "CONTRACT_TYPE", "ROOM_TYPE"
  code        String   // Unique identifier within category (e.g. "HIGH_SCHOOL")
  label       String   // Human-readable label (e.g. "Lycée d'Enseignement Secondaire")
  description String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  tenantId    String?  // Nullable: null for global platform enums, set for tenant-specific enums
  isDeleted   Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@unique([category, code, tenantId])
  @@index([category, isActive, isDeleted])
}
```

## 3. Backend Endpoints
- `GET /dynamic-enums`: List all dynamic enums with optional pagination and category filtering.
- `GET /dynamic-enums/category/:category`: Fast lookup for dropdown menus, ordered by `sortOrder ASC`.
- `POST /dynamic-enums`: Create a new entry (Root or Tenant Admin).
- `PUT /dynamic-enums/:id`: Update label, sortOrder, or active state.
- `DELETE /dynamic-enums/:id`: Soft-delete an entry.

## 4. Frontend Hook Pattern
```typescript
import { useState, useEffect } from 'react';
import api from '@/lib/api';

export function useDynamicEnum(category: string, defaultOptions: { code: string; label: string }[]) {
  const [options, setOptions] = useState<{ code: string; label: string }[]>(defaultOptions);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    api.get(`/dynamic-enums/category/${category}`)
      .then((res) => {
        if (mounted && Array.isArray(res.data?.data)) {
          setOptions(res.data.data.map((item: any) => ({
            code: item.code,
            label: item.label || item.code,
          })));
        }
      })
      .catch(() => {
        // Fall back gracefully to defaultOptions
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => { mounted = false; };
  }, [category]);

  return { options, isLoading };
}
```
