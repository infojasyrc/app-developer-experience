---
name: react-to-nextjs-components
description: >
  Implements Phase B of the React-to-Next.js migration plan: classifies and
  migrates React components to Server Components (RSC) or Client Components
  (RCC), extracts Context providers into client wrappers, and adds 'use client'
  directives where required. Use this skill whenever the user asks to migrate
  components, convert JSX to RSC, add use client directives, or execute Phase B
  of a MIGRATION_PLAN.md. Requires Phase A (routing) to be complete first.
---

# react-to-nextjs-components

Implements **Phase B** of the migration plan: component classification and
migration to RSC/RCC. Writes files directly into `ms-conference-webapp/`.

---

## Preconditions

```bash
# Phase A must be complete
grep "Phase A" conference-manager/ms-conference-webapp/MIGRATION_PLAN.md | grep "✅"

# No TypeScript errors from Phase A
cd conference-manager/ms-conference-webapp && npx tsc --noEmit
```

If Phase A is not marked ✅ → stop and report.

---

## Phase B execution steps

### B1 — Read the plan

Extract from `MIGRATION_PLAN.md` Phase B section:
- Server Components list (RSC)
- Client Components list (RCC) with reasons
- Provider Wrappers needed

### B2 — Migrate Server Components (RSC)

For each component in the RSC list — no directive needed, just ensure no
client-only APIs are present:

```typescript
// components/ConferenceCard.tsx — RSC (no directive)
import { Conference } from '@/types/conference'

interface Props {
  conference: Conference
}

export function ConferenceCard({ conference }: Props) {
  return (
    <div>
      <h2>{conference.title}</h2>
      <p>{conference.description}</p>
    </div>
  )
}
```

**Validation per RSC file:**
```bash
# Confirm no client-only APIs leaked in
grep -n "useState\|useEffect\|useRef\|onClick\|onChange\|window\.\|document\." \
  path/to/component.tsx
# Must return 0 matches
```

### B3 — Migrate Client Components (RCC)

For each component in the RCC list — add `'use client'` as the very first line:

```typescript
'use client'
// components/ConferenceForm.tsx — RCC (has interactivity)

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function ConferenceForm() {
  const [title, setTitle] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // submit logic
    router.push('/conferences')
  }

  return (
    <form onSubmit={handleSubmit}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />
      <button type="submit">Create</button>
    </form>
  )
}
```

**Rules for RCC:**
- `'use client'` must be the first line — before imports
- All hooks remain unchanged (`useState`, `useEffect`, etc.)
- Event handlers remain unchanged
- `useRouter`, `usePathname`, `useSearchParams` come from `next/navigation`

### B4 — Extract Context Providers

For each provider in the Provider Wrappers list:

```typescript
// app/providers/{name}-provider.tsx — always 'use client'
'use client'

import { createContext, useContext, useState } from 'react'

// 1. Move context definition here from original file
const ConferenceContext = createContext<ConferenceContextType | null>(null)

// 2. Export the provider as a wrapper component
export function ConferenceProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState(initialState)
  
  return (
    <ConferenceContext.Provider value={{ state, setState }}>
      {children}
    </ConferenceContext.Provider>
  )
}

// 3. Export the hook for consumption in RCC
export function useConference() {
  const ctx = useContext(ConferenceContext)
  if (!ctx) throw new Error('useConference must be used within ConferenceProvider')
  return ctx
}
```

Then import the provider in `app/layout.tsx` (which stays as RSC):

```typescript
// app/layout.tsx — RSC, imports client provider
import { ConferenceProvider } from './providers/conference-provider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ConferenceProvider>
          {children}
        </ConferenceProvider>
      </body>
    </html>
  )
}
```

### B5 — Verify

```bash
cd conference-manager/ms-conference-webapp

# TypeScript check
npx tsc --noEmit

# Verify no RSC has client-only APIs without 'use client'
grep -rL "use client" app/components/ --include="*.tsx" | \
  xargs grep -l "useState\|useEffect\|onClick\|onChange" 2>/dev/null
# Must return empty — any match is a missing 'use client'

# Verify 'use client' is first line where present
grep -rn "use client" app/ --include="*.tsx" | \
  grep -v "^.*:1:'use client'" | grep -v "^.*:1:\"use client\""
# Must return empty — 'use client' not on line 1 is an error
```

---

## Completion report

```
✅ Phase B Complete — Component Migration

Server Components (RSC): {count} files
Client Components (RCC): {count} files  
Provider wrappers created: {count} files

Files created/modified:
- {list}

TypeScript: ✅ 0 errors

Ready for Phase C: react-to-nextjs-data-fetching
```

Update `MIGRATION_PLAN.md` marking Phase B items with ✅.