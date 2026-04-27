---
name: react-to-nextjs-analyzer
description: >
  Analyzes a React (CRA/Vite, client-side) codebase and produces a structured
  migration plan to Next.js 13+ App Router. Use this skill whenever the user
  mentions migrating React to Next.js, analyzing components for SSR readiness,
  auditing React Router routes for App Router conversion, or planning a
  React-to-Next.js migration in a monorepo. Trigger even if the user just asks
  "what do I need to migrate" or "analyze my webapp for Next.js". Always
  produces a migration plan artifact — never generates implementation code
  directly. A separate skill handles implementation.
metadata:
  author: app-dev-exp
  version: "1.0"
---

# React → Next.js Migration Analyzer

Produces a structured, actionable migration plan from a React 19 (client-side,
React Router) app to Next.js 16 App Router. Designed for the ADE monorepo
pattern where the webapp lives at `WEBAPP_ROOT` (see monorepo-paths.md).

---

## Your role

You are a **migration analyst**, not an implementer. Your output is always a
`MIGRATION_PLAN.md` file. You never write implementation code — you produce
the plan that a separate implementation agent (or developer) will execute.

---

## Phase 1 — Discovery

Before producing any plan, read and map the codebase. Run these scans:

```bash
# Always read paths first
cat agents/shared/context/monorepo-paths.md
WEBAPP_LEGACY="conference-manager/ms-conference-webapp/legacy"
WEBAPP_APP="conference-manager/ms-conference-webapp/src/app"
FRONTEND_PLANS="conference-manager/ms-conference-webapp/plans"
```

### 1.1 Route inventory
```bash
grep -rn "Route\|createBrowserRouter\|useNavigate\|useParams\|Link\|NavLink" \
  $WEBAPP_LEGACY --include="*.tsx" --include="*.jsx" --include="*.ts" -l

find $WEBAPP_LEGACY -name "*router*" -o -name "*routes*" -o -name "*Router*"
```

### 1.2 Component classification (RSC vs RCC candidates)
```bash
# Components using browser-only APIs → must be 'use client'
grep -rn "useState\|useEffect\|useRef\|useContext\|useCallback\|useMemo\|window\.\|document\.\|localStorage\|sessionStorage\|onClick\|onChange\|onSubmit" \
  $WEBAPP_LEGACY --include="*.tsx" --include="*.jsx" -l

# Components that are purely presentational (RSC candidates)
grep -rL "useState\|useEffect\|useRef\|onClick\|onChange\|window\.\|document\." \
  $WEBAPP_LEGACY --include="*.tsx" --include="*.jsx" 2>/dev/null | head -30
```

### 1.3 Data fetching patterns
```bash
grep -rn "useQuery\|useSWR\|useEffect.*fetch\|axios\.\|\.get(\|\.post(" \
  $WEBAPP_LEGACY --include="*.tsx" --include="*.jsx" --include="*.ts" -l

grep -rn "REACT_APP_\|process\.env\|import\.meta\.env" \
  $WEBAPP_LEGACY --include="*.tsx" --include="*.jsx" --include="*.ts"
```

### 1.4 Global state & context
```bash
grep -rn "createContext\|Provider\|useContext\|Redux\|Zustand\|Jotai" \
  $WEBAPP_LEGACY --include="*.tsx" --include="*.jsx" --include="*.ts" -l
```

### 1.5 Dependencies audit
```bash
cat conference-manager/ms-conference-webapp/package.json | grep -A 100 '"dependencies"'
```

---

## Phase 2 — Analysis

After discovery, classify every finding into migration categories.

### Route mapping (React Router → App Router)

For each route found, determine the App Router equivalent:

| React Router pattern | Next.js App Router equivalent |
|---|---|
| `<Route path="/users/:id">` | `app/users/[id]/page.tsx` |
| `<Route path="/users/:id/*">` | `app/users/[id]/[...slug]/page.tsx` |
| `<Route index>` | `app/page.tsx` (or nested `page.tsx`) |
| Shared layout around routes | `app/layout.tsx` |
| `<Outlet />` | `{children}` in layout |
| `<Navigate to="...">` | `redirect()` from `next/navigation` |
| Protected route wrapper | Middleware (`middleware.ts`) |
| `useNavigate()` | `useRouter()` from `next/navigation` (RCC only) |
| `useParams()` | `params` prop on page (RSC) or `useParams()` (RCC) |
| `useSearchParams()` | `searchParams` prop (RSC) or `useSearchParams()` (RCC) |

### Component classification rules

Apply these rules to every component:

```
IF uses: useState | useEffect | useRef | useCallback | useMemo
      | window | document | localStorage | sessionStorage
      | onClick | onChange | onSubmit | any event handler
      | useContext (for mutable state)
→ CLASSIFY AS: 'use client' (RCC)

IF uses: async data fetching at component level (fetch, db calls)
      | no browser APIs
      | no interactivity
→ CLASSIFY AS: Server Component (RSC) — no directive needed

IF wraps children with context that requires client state
→ CLASSIFY AS: Client Provider wrapper pattern
   → Extract to providers/[name]-provider.tsx with 'use client'
   → Keep layout.tsx as RSC, import provider there
```

### Data fetching migration

| Current pattern | Next.js equivalent |
|---|---|
| `useEffect + fetch` in component | Move to RSC as `async` component with `await fetch()` |
| `useEffect + fetch` with interactivity | Keep as RCC + React Query/SWR or Server Actions |
| React Query `useQuery` | Keep for client mutations; RSC for initial data |
| Axios instance | Wrap in server-side fetch utility OR keep in API routes |
| `REACT_APP_*` env vars | Rename to `NEXT_PUBLIC_*` (client) or no prefix (server) |

---

## Phase 3 — Plan generation

Generate `MIGRATION_PLAN.md` with this exact structure:

```markdown
# Migration Plan: ms-conference-webapp → Next.js 16 App Router
Generated: {date}
Source: React 19 + React Router / Client-side only
Target: Next.js 16 / App Router / RSC-first

---

## Executive Summary
{2–3 sentences: total components, routes, estimated complexity}

## Risk Assessment
| Risk | Severity | Mitigation |
|------|----------|------------|
| {risk} | HIGH/MED/LOW | {mitigation} |

---

## Phase A: App Router Structure (DO FIRST)
{Generated directory tree for app/ folder}

### Route Mapping
| Current Route | New Path | File | Notes |
|---|---|---|---|

### Layouts Required
{List layouts with their shared components}

---

## Phase B: Component Migration
### Server Components (RSC) — migrate first
{List with current path → new path}

### Client Components (RCC) — add 'use client'
{List with current path, reason for RCC classification}

### Provider Wrappers needed
{List context providers that need extraction}

---

## Phase C: Data Fetching Refactor
{For each file with data fetching: current pattern → recommended pattern}

### Environment Variables to rename
| Current | New | Scope |
|---|---|---|

---

## Phase D: Dependencies
### Remove
{List packages no longer needed: react-router-dom, etc.}

### Add
{List packages to add if any}

### Keep (verify compatibility)
{List packages that need version verification for Next.js 16}

---

## Migration Order (recommended execution sequence)
1. {step}
2. {step}
...

## Known Incompatibilities
{Any patterns found that have no direct equivalent — need custom solution}

## Out of Scope
{What this plan does NOT cover — auth, i18n, etc.}
```

---

## Phase 4 — Output

- Save the plan as `MIGRATION_PLAN.md` at `$FRONTEND_PLANS` (see monorepo-paths.md)
- Summarize findings inline: total routes, total components classified, top 3 risks
- Do NOT generate any implementation code
- If a pattern is ambiguous, mark it `⚠️ NEEDS HUMAN REVIEW` in the plan

---

## Reference files

- `references/nextjs16-app-router-patterns.md` — App Router conventions, file conventions, metadata API
- `references/react-router-v6-to-app-router.md` — Detailed mapping of RRv6 APIs to Next.js equivalents

Read these when you need to validate a specific pattern mapping or when the
codebase uses advanced React Router v6 features (loaders, actions, lazy routes).