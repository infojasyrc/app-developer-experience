# Next.js 16 App Router — Key Patterns Reference

## File conventions (App Router)

```
app/
├── layout.tsx          # Root layout (required) — replaces _app.tsx
├── page.tsx            # Route segment (index)
├── loading.tsx         # Suspense boundary UI
├── error.tsx           # Error boundary ('use client' required)
├── not-found.tsx       # 404 UI
├── global-error.tsx    # Root error boundary
├── template.tsx        # Like layout but re-renders on nav
├── middleware.ts        # Runs before request (auth guards)
└── [segment]/
    ├── page.tsx
    └── layout.tsx
```

## Special segment types

| Folder name | Meaning |
|---|---|
| `[id]` | Dynamic segment |
| `[...slug]` | Catch-all |
| `[[...slug]]` | Optional catch-all |
| `(group)` | Route group — no URL segment |
| `_private` | Not a route |
| `@slot` | Parallel route slot |

## RSC vs RCC decision tree

```
Can it be async and fetch data server-side? 
  YES → RSC (default, no directive)
  
Does it use hooks or browser APIs?
  YES → 'use client' (RCC)
  
Does it just render props/children?
  YES → RSC preferred
  
Is it a Context Provider?
  YES → 'use client' wrapper, consumed in RSC layout
```

## Data fetching in RSC

```typescript
// app/conferences/page.tsx — RSC
export default async function ConferencesPage() {
  const data = await fetch('https://api.example.com/conferences', {
    cache: 'no-store'         // dynamic (no cache)
    // next: { revalidate: 60 } // ISR
    // cache: 'force-cache'    // static
  })
  const conferences = await data.json()
  return <ConferenceList items={conferences} />
}
```

## Environment variables

| Prefix | Available in |
|---|---|
| `NEXT_PUBLIC_` | Client + Server |
| (no prefix) | Server only |
| `REACT_APP_` | ❌ Not recognized in Next.js |

## Metadata API (replaces react-helmet)

```typescript
// Static
export const metadata: Metadata = {
  title: 'My Page',
  description: '...',
}

// Dynamic
export async function generateMetadata({ params }): Promise<Metadata> {
  return { title: `Conference ${params.id}` }
}
```

## Server Actions (replaces form POST patterns)

```typescript
// app/actions.ts
'use server'
export async function createConference(formData: FormData) {
  // runs on server, can access DB directly
}
```

## Providers pattern (Context in App Router)

```typescript
// app/providers/query-provider.tsx
'use client'
export function QueryProvider({ children }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}

// app/layout.tsx (RSC)
import { QueryProvider } from './providers/query-provider'
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  )
}
```
