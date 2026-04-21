---
name: react-to-nextjs-router
description: >
  Implements Phase A of the React-to-Next.js migration plan: creates the App
  Router folder structure, migrates React Router routes to Next.js file-system
  routing, generates layout.tsx files, and replaces all React Router APIs with
  Next.js equivalents. Use this skill whenever the user asks to implement
  routing migration, create the app/ directory structure, convert routes to
  Next.js pages, or execute Phase A of a MIGRATION_PLAN.md. Always reads
  MIGRATION_PLAN.md first — never implements without a plan.
---

# react-to-nextjs-router

Implements **Phase A** of the migration plan: App Router structure + route
migration. Writes files directly into `ms-conference-webapp/`.

---

## Preconditions

```bash
# Verify plan exists
cat conference-manager/ms-conference-webapp/MIGRATION_PLAN.md

# Verify Next.js project is initialized
ls conference-manager/ms-conference-webapp/app/
ls conference-manager/ms-conference-webapp/next.config.*
```

If either is missing → stop and report.

---

## Phase A execution steps

### A1 — Read the plan

Extract from `MIGRATION_PLAN.md`:
- Route Mapping table (Phase A section)
- Layouts Required list
- Known Incompatibilities relevant to routing

### A2 — Create the app/ directory structure

For each route in the mapping table, create the corresponding folder and
`page.tsx` file. Use this template for each page:

```typescript
// app/{route}/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '{Page Title}',
}

// If the original component had no async data fetching → keep as RSC
export default function {PageName}Page() {
  return <{OriginalComponent} />
}

// If the original component had useEffect+fetch → mark for Phase C
// TODO(Phase C): convert data fetching to RSC async pattern
export default function {PageName}Page() {
  return <{OriginalComponent} /> {/* data fetching handled in Phase C */}
}
```

### A3 — Generate layout files

For each layout identified in the plan:

```typescript
// app/layout.tsx (root)
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { template: '%s | {AppName}', default: '{AppName}' },
  description: '{description}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
```

For nested layouts (shared UI around a group of routes):
```typescript
// app/{group}/layout.tsx
export default function {Group}Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <{SharedNavComponent} />
      {children}
    </div>
  )
}
```

### A4 — Replace React Router APIs

Scan all files in `src/` and `app/` for React Router imports and replace:

```bash
# Find all files with React Router imports
grep -rn "from 'react-router-dom'\|from 'react-router'" \
  conference-manager/ms-conference-webapp/src/ --include="*.tsx" --include="*.ts"
```

Apply these replacements in each file found:

| Remove | Replace with | Notes |
|---|---|---|
| `import { Link } from 'react-router-dom'` | `import Link from 'next/link'` | Same `href` API |
| `import { useNavigate } from 'react-router-dom'` | `import { useRouter } from 'next/navigation'` | Add `'use client'` to file |
| `import { useParams } from 'react-router-dom'` | Props `params` on page (RSC) or `import { useParams } from 'next/navigation'` (RCC) | |
| `import { useLocation } from 'react-router-dom'` | `import { usePathname, useSearchParams } from 'next/navigation'` | Split into two hooks |
| `import { useSearchParams } from 'react-router-dom'` | `import { useSearchParams } from 'next/navigation'` | Wrap component in `<Suspense>` |
| `import { Navigate } from 'react-router-dom'` | `import { redirect } from 'next/navigation'` (RSC) or `router.push()` (RCC) | |
| `navigate('/path')` | `router.push('/path')` | Requires `useRouter()` |
| `<Outlet />` | `{children}` | In layout.tsx |

### A5 — Handle protected routes

If the plan identifies protected routes, generate `middleware.ts`:

```typescript
// middleware.ts (at app root, not inside app/)
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token') // adjust to your auth mechanism
  
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Add protected routes from the plan
    '/dashboard/:path*',
    '/conferences/:path*',
  ],
}
```

### A6 — Move legacy router config to _legacy/

```bash
mkdir -p conference-manager/ms-conference-webapp/src/_legacy
# Move (don't delete) the original router config
mv conference-manager/ms-conference-webapp/src/router.tsx \
   conference-manager/ms-conference-webapp/src/_legacy/router.tsx.bak
```

### A7 — Verify

```bash
cd conference-manager/ms-conference-webapp

# TypeScript check
npx tsc --noEmit

# Check for remaining React Router imports
grep -rn "from 'react-router-dom'\|from 'react-router'" \
  src/ app/ --include="*.tsx" --include="*.ts" \
  | grep -v "_legacy"
```

If TypeScript errors → fix before marking phase complete.
If React Router imports remain → resolve before moving to Phase B.

---

## Completion report

After Phase A, report:

```
✅ Phase A Complete — Routing Migration

Files created:
- app/layout.tsx
- app/page.tsx
- app/{route}/page.tsx  (list all)

Files modified:
- {list}

Files moved to _legacy/:
- {list}

TypeScript: ✅ 0 errors

Ready for Phase B: react-to-nextjs-components
```

Then update `MIGRATION_PLAN.md` marking Phase A items with ✅.

---

## Reference files

- `references/app-router-file-conventions.md` — complete file conventions,
  special files, and segment options for Next.js 16 App Router