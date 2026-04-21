---
name: react-to-nextjs-data-fetching
description: >
  Implements Phase C of the React-to-Next.js migration plan: refactors data
  fetching from useEffect+fetch patterns to RSC async components, migrates
  React Query usage, converts API utilities, and renames environment variables
  from REACT_APP_* to NEXT_PUBLIC_*. Use this skill whenever the user asks to
  migrate data fetching, convert useEffect fetch to RSC, update env vars, or
  execute Phase C of a MIGRATION_PLAN.md. Requires Phase B (components) to be
  complete first.
---

# react-to-nextjs-data-fetching

Implements **Phase C** of the migration plan: data fetching refactor and env
var migration. Writes files directly into `ms-conference-webapp/`.

---

## Preconditions

```bash
# Phase B must be complete
grep "Phase B" conference-manager/ms-conference-webapp/MIGRATION_PLAN.md | grep "✅"

npx tsc --noEmit
```

---

## Phase C execution steps

### C1 — Read the plan

Extract from `MIGRATION_PLAN.md` Phase C section:
- Files with data fetching to refactor + their current pattern
- Environment variables to rename

### C2 — Convert useEffect+fetch in RSC candidates

For each component the plan classified as RSC but still has `useEffect+fetch`:

**Before (React pattern):**
```typescript
// components/ConferenceList.tsx — was RCC due to useEffect
'use client'
import { useState, useEffect } from 'react'

export function ConferenceList() {
  const [conferences, setConferences] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/conferences')
      .then(res => res.json())
      .then(data => {
        setConferences(data)
        setLoading(false)
      })
  }, [])

  if (loading) return <div>Loading...</div>
  return <ul>{conferences.map(c => <li key={c.id}>{c.title}</li>)}</ul>
}
```

**After (RSC async pattern):**
```typescript
// app/conferences/page.tsx or components/ConferenceList.tsx — RSC
// Remove 'use client', useState, useEffect

export async function ConferenceList() {
  const res = await fetch(`${process.env.API_BASE_URL}/conferences`, {
    cache: 'no-store', // or next: { revalidate: 60 } for ISR
  })
  
  if (!res.ok) throw new Error('Failed to fetch conferences')
  
  const conferences = await res.json()
  
  return <ul>{conferences.map((c: Conference) => <li key={c.id}>{c.title}</li>)}</ul>
}
```

Add `loading.tsx` alongside the page for the Suspense fallback:
```typescript
// app/conferences/loading.tsx
export default function Loading() {
  return <div>Loading conferences...</div>
}
```

### C3 — Handle React Query (keep for mutations, convert initial fetches)

```typescript
// Keep React Query for: mutations, optimistic updates, polling, client-side refetch
// Convert to RSC for: initial page data load

// Pattern: RSC fetches initial data, passes to RCC for interactivity
// app/conferences/[id]/page.tsx — RSC
export default async function ConferencePage({ params }: { params: { id: string } }) {
  const conference = await fetchConference(params.id) // server fetch
  return <ConferenceDetail initialData={conference} />
}

// components/ConferenceDetail.tsx — RCC (handles mutations)
'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function ConferenceDetail({ initialData }: { initialData: Conference }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: updateConference,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['conference', initialData.id] }),
  })
  // render with initialData, mutation for updates
}
```

### C4 — Create server-side fetch utilities

Centralize server fetches to avoid repeating headers/error handling:

```typescript
// lib/api/server.ts — server-only fetch utility
import { cookies } from 'next/headers'

const API_BASE = process.env.API_BASE_URL // no NEXT_PUBLIC_ — server only

export async function serverFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options?.headers,
    },
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status} ${res.statusText} — ${path}`)
  }

  return res.json()
}
```

### C5 — Rename environment variables

For each env var in the plan's mapping table:

```bash
# Find all occurrences
grep -rn "REACT_APP_" \
  conference-manager/ms-conference-webapp/src/ \
  conference-manager/ms-conference-webapp/app/ \
  --include="*.tsx" --include="*.ts" --include="*.env*"
```

Apply renaming rules:

| Rule | When |
|---|---|
| `REACT_APP_*` → `NEXT_PUBLIC_*` | Variable is used in client components (RCC) |
| `REACT_APP_*` → no prefix | Variable is only used in RSC or server utilities |

Update `.env.local` and `.env.example`:
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://api.example.com  # was REACT_APP_API_BASE_URL
API_SECRET_KEY=...                                  # server-only, no prefix
```

### C6 — Verify

```bash
cd conference-manager/ms-conference-webapp

# TypeScript check
npx tsc --noEmit

# No remaining REACT_APP_ references in source
grep -rn "REACT_APP_" src/ app/ --include="*.tsx" --include="*.ts"
# Must return empty

# No useEffect+fetch remaining in RSC files (files without 'use client')
grep -rL "use client" app/ --include="*.tsx" | \
  xargs grep -l "useEffect" 2>/dev/null
# Must return empty
```

---

## Completion report

```
✅ Phase C Complete — Data Fetching Migration

Converted to RSC async: {count} components
React Query kept (mutations): {count} components
Server fetch utility created: lib/api/server.ts
Env vars renamed: {count}

TypeScript: ✅ 0 errors

Migration complete. Proceed to Phase D: remove react-router-dom from package.json
```

Update `MIGRATION_PLAN.md` marking Phase C items with ✅.

---

## Reference files

- `references/nextjs-caching-strategies.md` — cache options, revalidation
  patterns, ISR vs dynamic vs static for different data types