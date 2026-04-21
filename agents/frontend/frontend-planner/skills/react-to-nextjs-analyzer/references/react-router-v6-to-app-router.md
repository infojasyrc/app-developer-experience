# React Router v6 → Next.js App Router Mapping

## Core API replacements

| React Router v6 | Next.js App Router | Notes |
|---|---|---|
| `<BrowserRouter>` | Built-in | Remove entirely |
| `<Routes> / <Route>` | File system routing | Replace with folder structure |
| `<Link to="/path">` | `<Link href="/path">` from `next/link` | Same API, different import |
| `<NavLink>` | `<Link>` + `usePathname()` | Add active class manually |
| `<Outlet />` | `{children}` in layout | In `layout.tsx` |
| `<Navigate to="..." />` | `redirect("/...")` from `next/navigation` | In RSC; `useRouter().push()` in RCC |
| `useNavigate()` | `useRouter()` from `next/navigation` | RCC only ('use client') |
| `useParams()` | `params` prop (RSC page) / `useParams()` (RCC) | Different in RSC vs RCC |
| `useSearchParams()` | `searchParams` prop (RSC) / `useSearchParams()` (RCC) | RCC needs Suspense wrapper |
| `useLocation()` | `usePathname()` + `useSearchParams()` | Split into two hooks |
| `useMatch()` | `usePathname()` | Manual matching |
| `createBrowserRouter` | File system | No equivalent needed |
| `RouterProvider` | Remove | Built into Next.js |

## Route config → folder structure example

```
// React Router v6
createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "conferences", element: <ConferenceList /> },
      { path: "conferences/:id", element: <ConferenceDetail /> },
      { path: "conferences/:id/edit", element: <ConferenceEdit /> },
      { path: "*", element: <NotFound /> },
    ]
  }
])

// Next.js App Router equivalent
app/
├── layout.tsx              ← RootLayout (wraps all)
├── page.tsx                ← Home (index: true)
├── not-found.tsx           ← NotFound (* route)
└── conferences/
    ├── page.tsx            ← ConferenceList
    └── [id]/
        ├── page.tsx        ← ConferenceDetail
        └── edit/
            └── page.tsx    ← ConferenceEdit
```

## Protected routes pattern

```typescript
// React Router: Wrapper component
function ProtectedRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" />
  return children
}

// Next.js: middleware.ts (preferred)
import { NextResponse } from 'next/server'
export function middleware(request) {
  const token = request.cookies.get('token')
  if (!token) return NextResponse.redirect(new URL('/login', request.url))
}
export const config = { matcher: ['/conferences/:path*'] }
```

## Loader pattern (RRv6 loaders → RSC)

```typescript
// React Router v6 loader
export async function loader({ params }) {
  return fetch(`/api/conferences/${params.id}`)
}

// Next.js RSC equivalent
export default async function ConferencePage({ params }) {
  const data = await fetch(`/api/conferences/${params.id}`)
  const conference = await data.json()
  return <ConferenceDetail conference={conference} />
}
```

## Lazy routes → Next.js automatic code splitting

```typescript
// React Router lazy
const ConferenceDetail = lazy(() => import('./ConferenceDetail'))

// Next.js — automatic per page.tsx
// OR explicit:
const ConferenceDetail = dynamic(() => import('./ConferenceDetail'))
```

## useSearchParams in RCC — requires Suspense

```typescript
// RCC using useSearchParams MUST be wrapped in Suspense
'use client'
function SearchComponent() {
  const searchParams = useSearchParams() // needs Suspense
  return <div>{searchParams.get('q')}</div>
}

// In parent (RSC or RCC):
<Suspense fallback={<div>Loading...</div>}>
  <SearchComponent />
</Suspense>
```

## Packages to remove after migration

```json
"react-router-dom": "REMOVE",
"react-router": "REMOVE",
"history": "REMOVE (if used directly)"
```
