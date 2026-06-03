# Migration Plan — Legacy React to Next.js (App Router)

**App:** `ms-conference-webapp`
**Source:** `legacy/src/` (CRA + React Router v5 + Material UI v4)
**Target:** `src/` (Next.js 14 App Router + Tailwind CSS + TanStack Query)
**Last updated:** 2026-05-26

---

## 1. Current Architecture Overview

### 1.1 Legacy Stack

```
legacy/src/
├── App.js                          # BrowserRouter + global providers
├── components/AppRoutes/           # React Router v5 Switch/Route
│   └── ProtectedRoute/             # Admin guard (renders null if !isAdmin)
├── pages/                          # Route-level page components
├── components/                     # Shared UI components
├── hocs/                           # Layout HOCs (FullLayout, NavigationLayout, NoneLayout)
├── shared/
│   ├── api/                        # Axios + Firebase backends
│   ├── contexts/                   # Auth, User, Layout contexts
│   ├── entities/                   # TypeScript interfaces
│   ├── hooks/                      # useAuth
│   ├── styles/                     # MUI makeStyles
│   ├── themes/                     # MUI theme + colors
│   └── tools/                      # Sorting, utils
└── translations/                   # i18next (en + es)
```

### 1.2 Next.js Target Stack (current state)

```
src/app/
├── layout.tsx                      # Root layout (font, Providers, Version)
├── page.tsx                        # Home (placeholder)
├── providers.tsx                   # QueryClient + Auth + User + Layout providers
├── middleware.ts                   # Cookie-based route protection
├── api/
│   ├── login/route.ts              # POST /api/login → sets cm_user cookie
│   └── session/route.ts            # Session management
├── login/page.tsx                  # Login page (DONE)
├── conferences/
│   ├── page.tsx                    # Conferences list (STUB)
│   └── [id]/page.tsx               # Conference detail (STUB)
├── components/
│   ├── Login/Login.tsx             # Login form (DONE)
│   ├── layout/                     # Footer, Main, Version (DONE)
│   ├── features/                   # FigureAnimation (DONE)
│   └── design-system/
│       ├── atoms/                  # Card atoms (DONE)
│       └── molecules/              # BasicCard, FeatureCard, MediaCard, ProfileCard (DONE)
├── lib/
│   ├── api/queries/                # useConference, useConferences (DONE)
│   └── contexts/                   # Auth, User, Layout (DONE)
└── shared/                         # entities, constants, styles, utils (DONE)
```

---

## 2. Route Mapping — Legacy → Next.js

| Legacy Path | Page Component | Auth | Next.js Path | Status |
|---|---|---|---|---|
| `/` | `EventsPage` | Public | `/` | ✅ done |
| `/login` | `Login` | Public | `/login` | ✅ done |
| `/event-info/:id` | `EventInfoPage` | Public | `/conferences/[id]` | ✅ done |
| `/events/list` | `EventsAdminPage` | Admin | `/admin/conferences` | ✅ done |
| `/event/add` | `EventPage` | Admin | `/admin/conferences/new` | ✅ done |
| `/event/edit/:id` | `EventEditPage` | Admin | `/admin/conferences/[id]/edit` | ✅ done |
| `/play-event/:id` | `PlayEventPage` | Public | `/conferences/[id]/play` | ✅ done |
| `/users` | `UsersPage` | Admin | `/admin/users` | ❌ missing |
| `/user/add` | `UserPage` | Admin | `/admin/users/new` | ❌ missing |

> **Route naming decision:** The Next.js codebase uses `conferences` (domain name) instead of `events`. All new routes follow this convention. Admin-only routes are grouped under `/admin/` so middleware can protect the entire segment.

---

## 3. Component Inventory & Migration Status

### 3.1 Pages

| Legacy Page | Next.js Route | Migration Status | Notes |
|---|---|---|---|
| `pages/Events/Events.tsx` | `app/page.tsx` | ⚠️ convert to Server Component + TanStack | Fetches conferences + headquarters; auth-aware |
| `pages/Login/Login.tsx` | `app/login/page.tsx` | ✅ done | |
| `pages/EventInfo/EventInfo.tsx` | `app/conferences/[id]/page.tsx` | ⚠️ stub exists | Uses `useParams` + `useHistory` → `params` + `router` |
| `pages/EventsAdmin/EventsAdmin.tsx` | `app/admin/conferences/page.tsx` | ✅ done | Admin guard via route group `(admin)` |
| `pages/Event/Event.tsx` | `app/admin/conferences/new/page.tsx` | ✅ done | Create form with ConferenceForm |
| `pages/EventEdit/EventEdit.tsx` | `app/admin/conferences/[id]/edit/page.tsx` | ✅ done | Edit form with ConferenceEditForm |
| `pages/PlayEvent/PlayEvent.tsx` | `app/conferences/[id]/play/page.tsx` | ✅ done | Full-screen layout (no header/nav) |
| `pages/Users/Users.tsx` | `app/admin/users/page.tsx` | ❌ missing | Admin-only user list |
| `pages/User/User.tsx` | `app/admin/users/new/page.tsx` | ❌ missing | Create user form; fetches roles |
| `pages/Attendee/Attendee.tsx` | `app/admin/attendees/page.tsx` | ❌ stub (empty) | Deferred |
| `pages/dashboard/dashboard.tsx` | `app/admin/dashboard/page.tsx` | ❌ stub (empty) | Deferred |

### 3.2 Layout Components

| Legacy Component | Next.js Path | Status | Notes |
|---|---|---|---|
| `components/Main/Main.tsx` | `app/components/layout/Main.tsx` | ✅ done (partial) | Needs Header + NavigationBar wired |
| `components/Header/Header.tsx` | `app/components/layout/Header.tsx` | ❌ missing | Logout, login nav, username display |
| `components/Navigation/NavigationBar.tsx` | `app/components/layout/NavigationBar.tsx` | ❌ missing | Title + logo bar; replaces MUI AppBar |
| `components/Navigation/NavigationWrapper.tsx` | — | ❌ missing | Wraps `next/link` instead of `react-router-dom` |
| `components/LeftMenu/LeftMenu.tsx` | `app/components/layout/LeftMenu.tsx` | ❌ missing | Side menu |
| `components/DrawerMenu/DrawerMenu.tsx` | `app/components/layout/DrawerMenu.tsx` | ❌ missing | Mobile drawer |

### 3.3 Conference / Event Components

| Legacy Component | Next.js Path | Status | Notes |
|---|---|---|---|
| `components/EventsView/EventsView.tsx` | `app/components/conferences/ConferencesView.tsx` | ❌ missing | Main listing grid; needs filter props |
| `components/EventCard/EventCard.tsx` | `app/components/conferences/ConferenceCard.tsx` | ❌ missing | Single card; replaces MUI Card |
| `components/EventCard/ConferenceStatusSection.tsx` | `app/components/conferences/ConferenceStatusBadge.tsx` | ❌ missing | Status chip |
| `components/EventList/EventList.tsx` | `app/components/conferences/ConferenceList.tsx` | ❌ missing | List container |
| `components/EventDetails/EventDetails.tsx` | `app/components/conferences/ConferenceDetails.tsx` | ❌ missing | Detail view with subscribe button |
| `components/EventView/EventView.tsx` | `app/components/conferences/ConferenceForm.tsx` | ❌ missing | Create form (shared with edit) |
| `components/EventEditView/EventEditView.tsx` | `app/components/conferences/ConferenceEditForm.tsx` | ❌ missing | Edit form; wraps ConferenceForm |
| `components/EventsAdminView/EventAdminView.tsx` | `app/components/conferences/ConferenceAdminView.tsx` | ✅ done | Admin table/grid |
| `components/EventTypes/EventTypes.tsx` | `app/components/conferences/ConferenceTypes.tsx` | ✅ done | Inline in ConferenceForm |
| `components/PlayEventView/PlayEventView.tsx` | `app/components/conferences/ConferencePlayView.tsx` | ✅ done | Full-screen play mode |
| `components/PreviewEvent/PreviewEvent.jsx` | `app/components/conferences/ConferencePreview.tsx` | ✅ done | Preview modal |
| `components/PreviewEvent/PreviewActions.tsx` | `app/components/conferences/ConferencePreviewActions.tsx` | ✅ done | Preview action buttons |
| `components/SkeletonEvents/SkeletonEventDetails.tsx` | `app/components/conferences/ConferenceDetailSkeleton.tsx` | ✅ done | Loading skeleton |

### 3.4 Dashboard / Filter Components

| Legacy Component | Next.js Path | Status |
|---|---|---|
| `components/Dashboard/DashboardFilters.tsx` | `app/components/filters/DashboardFilters.tsx` | ❌ missing |
| `components/Dashboard/SortFilter.tsx` | `app/components/filters/SortFilter.tsx` | ❌ missing |
| `components/Dashboard/YearFilter.tsx` | `app/components/filters/YearFilter.tsx` | ❌ missing |
| `components/Dashboard/Headquarters.js` | `app/components/filters/HeadquartersFilter.tsx` | ❌ missing |

### 3.5 User Management Components

| Legacy Component | Next.js Path | Status |
|---|---|---|
| `components/UserList/UserList.tsx` | `app/components/users/UserList.tsx` | ❌ missing |
| `components/UserForm/UserForm.tsx` | `app/components/users/UserForm.tsx` | ❌ missing |
| `components/Profile/Profile.js` | `app/components/users/Profile.tsx` | ❌ missing |
| `components/Profile/ChangePassword.js` | `app/components/users/ChangePassword.tsx` | ❌ missing |

### 3.6 Common / Shared UI Components

| Legacy Component | Next.js Path | Status | Notes |
|---|---|---|---|
| `components/Loading/Loading.tsx` | `app/components/ui/Loading.tsx` | ❌ missing | Replaces MUI CircularProgress |
| `components/Loading/LoadingWrapper.tsx` | `app/components/ui/LoadingWrapper.tsx` | ❌ missing | |
| `components/Carousel/Carousel.tsx` | `app/components/ui/Carousel.tsx` | ❌ missing | |
| `components/Slider/Slider.tsx` | `app/components/ui/Slider.tsx` | ❌ missing | Timer-based slideshow |
| `components/Slider/SlideView.tsx` | `app/components/ui/SlideView.tsx` | ❌ missing | |
| `components/Slider/TimerButton.tsx` | `app/components/ui/TimerButton.tsx` | ❌ missing | |
| `components/CustomDropdown/CustomDropdown.tsx` | `app/components/ui/CustomDropdown.tsx` | ❌ missing | |
| `components/DropDown/SelectWithLoading.tsx` | `app/components/ui/SelectWithLoading.tsx` | ❌ missing | |
| `components/FormButtons/FormButtons.tsx` | `app/components/ui/FormButtons.tsx` | ❌ missing | |
| `components/TextField/TextFieldWithValidation.tsx` | `app/components/ui/TextFieldWithValidation.tsx` | ❌ missing | |
| `components/Headquarters/Headquarters.tsx` | `app/components/ui/Headquarters.tsx` | ❌ missing | |
| `components/ImagesPreview/ImagesPreview.tsx` | `app/components/ui/ImagesPreview.tsx` | ❌ missing | |
| `components/ImagesPreview/RenderImage.tsx` | `app/components/ui/RenderImage.tsx` | ❌ missing | |
| `components/AttendeeFormHeaderStep/AttendeeFormHeaderStep.js` | `app/components/ui/AttendeeFormHeaderStep.tsx` | ❌ missing | |

---

## 4. API Layer Migration

### 4.1 Endpoints

| Legacy Endpoint | Next.js Path | Status | Notes |
|---|---|---|---|
| `shared/api/endpoints/conferences.ts` | `app/shared/api/conferences.ts` | ⚠️ partial | `useConferences` query exists; CRUD missing |
| `shared/api/endpoints/events.ts` | `app/shared/api/events.ts` | ❌ missing | Full CRUD + auth-scoped fetch |
| `shared/api/endpoints/headquarters.ts` | `app/shared/api/headquarters.ts` | ❌ missing | `getAll` |
| `shared/api/endpoints/roles.ts` | `app/shared/api/roles.ts` | ❌ missing | `getAll` |
| `shared/api/endpoints/users.ts` | `app/shared/api/users.ts` | ❌ missing | `getAll`, `getById` |
| `shared/api/endpoints/authentication.ts` | `app/api/login/route.ts` | ✅ done | Firebase auth → server cookie |
| `shared/api/endpoints/attendees.js` | `app/shared/api/attendees.ts` | ❌ missing | Deferred (stub in legacy) |
| `shared/api/endpoints/images.js` | `app/shared/api/images.ts` | ❌ missing | Upload + delete |
| `shared/api/endpoints/security.ts` | `app/api/session/route.ts` | ⚠️ partial | Token revoke exists |
| `shared/api/backends/axios.ts` | `app/shared/api/index.ts` | ⚠️ partial | Base HTTP client |
| `shared/api/backends/firebase.ts` | — | ❌ missing | Firebase app init for client auth |

### 4.2 TanStack Query Hooks

Each API endpoint needs a corresponding TanStack Query hook in `app/lib/api/queries/`:

| Hook | Status |
|---|---|
| `useConferences.ts` | ✅ done |
| `useConference.ts` | ✅ done |
| `useHeadquarters.ts` | ✅ done |
| `useUsers.ts` | ❌ missing |
| `useUser.ts` | ❌ missing |
| `useRoles.ts` | ❌ missing |
| `useMutateConference.ts` (add/edit/delete) | ✅ done |

---

## 5. Shared Infrastructure Migration

### 5.1 Contexts & Providers

| Legacy | Next.js | Status |
|---|---|---|
| `shared/contexts/Auth/` | `app/lib/contexts/Auth/` | ✅ done |
| `shared/contexts/UserContext.tsx` | `app/lib/contexts/UserContext.tsx` | ✅ done |
| `shared/contexts/LayoutContext.tsx` | `app/lib/contexts/LayoutContext.tsx` | ✅ done |
| `shared/contexts/ActionsContext.js` | — | ❌ evaluate if needed |
| `hocs/FullLayout.js` | Next.js layout segment | ✅ replaced by `app/layout.tsx` |
| `hocs/NavigationLayout.js` | Next.js nested layout | ❌ needs `(nav)/layout.tsx` segment |
| `hocs/NoneLayout.tsx` | Next.js layout segment | ❌ needs `(bare)/layout.tsx` segment |

### 5.2 Utilities & Helpers

| Legacy | Next.js | Status |
|---|---|---|
| `shared/utils/dateHandler.ts` | `app/shared/utils/dateHandler.ts` | ✅ done |
| `shared/utils/imagesHandler.ts` | `app/shared/utils/imagesHandler.ts` | ✅ done |
| `shared/tools/sorting.ts` | `app/shared/utils/sorting.ts` | ❌ missing |
| `shared/constants/constants.ts` | `app/shared/constants/constants.ts` | ✅ done |
| `shared/environment/environment.ts` | `app/shared/environment/index.ts` | ✅ done |

### 5.3 Entities / Types

| Legacy | Next.js | Status |
|---|---|---|
| `shared/entities/conference.ts` | `app/shared/entities/conference.ts` | ✅ done |
| `shared/entities/auth.ts` | `app/shared/entities/auth.ts` | ✅ done |
| `shared/entities/credentials.ts` | `app/shared/entities/credentials.ts` | ✅ done |
| `shared/entities/headquarter.ts` | `app/shared/entities/headquarter.ts` | ✅ done |
| `shared/entities/media.ts` | `app/shared/entities/media.ts` | ✅ done |
| `shared/entities/position.ts` | `app/shared/entities/position.ts` | ✅ done |
| `shared/entities/tag.ts` | `app/shared/entities/tag.ts` | ✅ done |
| `shared/entities/user.ts` | `app/shared/entities/user.ts` | ✅ done |
| `shared/entities/props/eventEditViewProps.ts` | `app/shared/entities/props/conferenceEditFormProps.ts` | ❌ missing |

### 5.4 Theming

| Legacy | Next.js | Notes |
|---|---|---|
| MUI `makeStyles` / `createStyles` | Tailwind CSS | All MUI styles replaced with Tailwind |
| `shared/themes/colors.ts` | `tailwind.config.ts` → `theme.colors` | Extract palette into Tailwind config |
| `shared/themes/light_theme.ts` | Tailwind config | Migrate spacing/shadows |
| `shared/themes/buttons.ts` | Tailwind utility classes | |
| `shared/themes/modal.ts` | Tailwind utility classes | |
| `shared/styles/*.ts` (MUI sx objects) | Tailwind className strings | Convert file by file |

### 5.5 Translations (i18n)

| Legacy | Next.js | Status |
|---|---|---|
| `translations/i18n.ts` (react-i18next) | `next-intl` or `next-i18next` | ❌ not started |
| `translations/languages/en.json` | `messages/en.json` | ❌ not started |
| `translations/languages/es.json` | `messages/es.json` | ❌ not started |

---

## 6. Route Group Structure (Target)

```
src/app/
├── layout.tsx                          # Root: Providers, font, Version
├── page.tsx                            # / → public conferences list
├── globals.css
│
├── (public)/                           # No auth required
│   ├── login/page.tsx                  # /login ✅
│   └── conferences/
│       ├── page.tsx                    # /conferences → list
│       └── [id]/
│           ├── page.tsx                # /conferences/[id] → detail
│           └── play/
│               └── page.tsx           # /conferences/[id]/play → full-screen (bare layout)
│
├── (admin)/                            # Requires isAdmin — layout adds admin sidebar
│   ├── layout.tsx                      # Admin shell: Header + LeftMenu + admin guard
│   └── admin/
│       ├── conferences/
│       │   ├── page.tsx               # /admin/conferences → admin event list
│       │   ├── new/page.tsx           # /admin/conferences/new → create form
│       │   └── [id]/
│       │       └── edit/page.tsx      # /admin/conferences/[id]/edit → edit form
│       └── users/
│           ├── page.tsx               # /admin/users → user list
│           └── new/page.tsx           # /admin/users/new → create user
│
└── api/
    ├── login/route.ts                  # POST /api/login ✅
    └── session/route.ts               # GET/DELETE /api/session ✅
```

---

## 7. Migration Phases

### Phase 1 — Route Groups & Layout Shells _(prerequisite for all pages)_

| Task | File(s) | Effort |
|---|---|---|
| Create `(admin)` route group with admin layout | `app/(admin)/layout.tsx` | S |
| Wire Header component into admin layout | `app/components/layout/Header.tsx` | M |
| Wire LeftMenu / DrawerMenu into admin layout | `app/components/layout/LeftMenu.tsx`, `DrawerMenu.tsx` | M |
| Create `(bare)` route group (no header) for play page | `app/(bare)/layout.tsx` | S |
| Update middleware to protect `/admin/*` (isAdmin check) | `middleware.ts` | S |

### Phase 2 — Public Conferences Pages

| Task | File(s) | Effort |
|---|---|---|
| Migrate `EventsView` → `ConferencesView` | `app/components/conferences/ConferencesView.tsx` | M |
| Migrate `EventCard` → `ConferenceCard` | `app/components/conferences/ConferenceCard.tsx` | M |
| Migrate `ConferenceStatusSection` → `ConferenceStatusBadge` | `app/components/conferences/ConferenceStatusBadge.tsx` | S |
| Migrate `EventList` → `ConferenceList` | `app/components/conferences/ConferenceList.tsx` | S |
| Migrate `EventTypes` → `ConferenceTypes` | `app/components/conferences/ConferenceTypes.tsx` | S |
| Implement `/` — public conferences list page | `app/page.tsx` | M |
| Add `useHeadquarters` query hook | `app/lib/api/queries/useHeadquarters.ts` | S |
| Migrate `EventDetails` → `ConferenceDetails` | `app/components/conferences/ConferenceDetails.tsx` | M |
| Migrate `SkeletonEventDetails` → `ConferenceDetailSkeleton` | `app/components/conferences/ConferenceDetailSkeleton.tsx` | S |
| Implement `/conferences/[id]` — detail page | `app/conferences/[id]/page.tsx` | M |

### Phase 3 — Admin Conference Management Pages

| Task | File(s) | Effort |
|---|---|---|
| Migrate `EventAdminView` → `ConferenceAdminView` | `app/components/conferences/ConferenceAdminView.tsx` | M |
| Add `useMutateConference` (add/update/delete) mutations | `app/lib/api/queries/useMutateConference.ts` | M |
| Implement `/admin/conferences` — admin list | `app/admin/conferences/page.tsx` | M |
| Migrate `EventView` → `ConferenceForm` (shared create/edit) | `app/components/conferences/ConferenceForm.tsx` | L |
| Migrate `EventEditView` → `ConferenceEditForm` | `app/components/conferences/ConferenceEditForm.tsx` | M |
| Implement `/admin/conferences/new` | `app/admin/conferences/new/page.tsx` | S |
| Implement `/admin/conferences/[id]/edit` | `app/admin/conferences/[id]/edit/page.tsx` | S |
| Migrate `PreviewEvent` + `PreviewActions` | `app/components/conferences/ConferencePreview.tsx` | M |

### Phase 4 — Play / Full-Screen Mode

| Task | File(s) | Effort |
|---|---|---|
| Create bare (no-header) layout segment | `app/(bare)/layout.tsx` | S |
| Migrate `PlayEventView` → `ConferencePlayView` | `app/components/conferences/ConferencePlayView.tsx` | M |
| Implement `/conferences/[id]/play` | `app/(bare)/conferences/[id]/play/page.tsx` | S |

### Phase 5 — User Management Pages

| Task | File(s) | Effort |
|---|---|---|
| Add `useUsers` + `useRoles` query hooks | `app/lib/api/queries/useUsers.ts`, `useRoles.ts` | S |
| Migrate `UserList` | `app/components/users/UserList.tsx` | M |
| Migrate `UserForm` | `app/components/users/UserForm.tsx` | M |
| Implement `/admin/users` | `app/admin/users/page.tsx` | S |
| Implement `/admin/users/new` | `app/admin/users/new/page.tsx` | S |

### Phase 6 — Filter & Dashboard Components

| Task | File(s) | Effort |
|---|---|---|
| Migrate `DashboardFilters` | `app/components/filters/DashboardFilters.tsx` | M |
| Migrate `SortFilter` | `app/components/filters/SortFilter.tsx` | S |
| Migrate `YearFilter` | `app/components/filters/YearFilter.tsx` | S |
| Migrate `Headquarters` filter | `app/components/filters/HeadquartersFilter.tsx` | S |

### Phase 7 — Shared UI & Profile

| Task | File(s) | Effort |
|---|---|---|
| Migrate `Loading` + `LoadingWrapper` | `app/components/ui/Loading.tsx` | S |
| Migrate `FormButtons` | `app/components/ui/FormButtons.tsx` | S |
| Migrate `TextFieldWithValidation` | `app/components/ui/TextFieldWithValidation.tsx` | S |
| Migrate `SelectWithLoading` | `app/components/ui/SelectWithLoading.tsx` | S |
| Migrate `CustomDropdown` | `app/components/ui/CustomDropdown.tsx` | S |
| Migrate `Carousel` | `app/components/ui/Carousel.tsx` | M |
| Migrate `Slider` + `SlideView` + `TimerButton` | `app/components/ui/Slider.tsx` | M |
| Migrate `ImagesPreview` + `RenderImage` | `app/components/ui/ImagesPreview.tsx` | M |
| Migrate `Profile` + `ChangePassword` | `app/components/users/Profile.tsx` | M |
| Migrate `Headquarters` display component | `app/components/ui/Headquarters.tsx` | S |

### Phase 8 — i18n & Theme Cleanup

| Task | Notes | Effort |
|---|---|---|
| Install `next-intl` | Replace `react-i18next` | S |
| Migrate `en.json` + `es.json` | Move to `messages/` | S |
| Extract color palette into `tailwind.config.ts` | Replace MUI theme colors | S |
| Remove all legacy MUI style imports from migrated files | Replace with Tailwind classes | M |

### Phase 9 — Missing API Endpoints

| Task | File(s) | Effort |
|---|---|---|
| Migrate events CRUD (`add`, `update`, `delete`, `getAllEventsAuth`) | `app/shared/api/events.ts` | M |
| Migrate headquarters `getAll` | `app/shared/api/headquarters.ts` | S |
| Migrate roles `getAll` | `app/shared/api/roles.ts` | S |
| Migrate users `getAll` | `app/shared/api/users.ts` | S |
| Migrate images upload/delete | `app/shared/api/images.ts` | M |
| Add Firebase client init | `app/shared/api/firebase.ts` | S |
| Migrate `sorting.ts` utility | `app/shared/utils/sorting.ts` | S |

### Phase 10 — Cleanup & Tests

| Task | Notes | Effort |
|---|---|---|
| Remove `legacy/` directory | After all routes verified in Next.js | M |
| Migrate Cypress E2E tests | Update selectors + paths for Next.js | L |
| Write Vitest unit tests for migrated components | Maintain 80% coverage | L |
| Update Storybook stories | Align with new component paths | M |
| Smoke test all routes | Use local dev server | S |

---

## 8. Key Conversion Patterns

### 8.1 Routing

```tsx
// Legacy (react-router-dom v5)
import { useHistory, useParams } from 'react-router-dom'
const history = useHistory()
const { id } = useParams<{ id: string }>()
history.push('/events/list')

// Next.js (App Router)
import { useRouter, useParams } from 'next/navigation'
const router = useRouter()
const { id } = useParams<{ id: string }>()
router.push('/admin/conferences')
```

### 8.2 Protected Routes

```tsx
// Legacy (component-level guard)
const ProtectedRoutes = ({ user, component: Component }) =>
  !user ? null : <Component />

// Next.js — middleware handles route-level protection
// middleware.ts already guards cm_user cookie
// For isAdmin: extend middleware to decode cookie and check isAdmin flag
// Or: add a check inside (admin)/layout.tsx with a redirect
```

### 8.3 Layout HOCs → Route Group Layouts

```tsx
// Legacy HOC pattern
class NavigationLayout extends Component {
  componentDidMount() {
    this.context.changeLayout(LayoutTypes.NAVIGATION, title)
  }
}

// Next.js: (nav)/layout.tsx
export default function NavLayout({ children }) {
  return (
    <>
      <Header />
      <NavigationBar />
      <main>{children}</main>
    </>
  )
}
```

### 8.4 Data Fetching

```tsx
// Legacy (useEffect + useState)
const [events, setEvents] = useState<Conference[]>([])
useEffect(() => {
  apiConferences.getAll().then(setEvents)
}, [])

// Next.js with TanStack Query (client component)
const { data: conferences, isLoading } = useConferences()

// Or as a Server Component (preferred for public pages)
export default async function ConferencesPage() {
  const conferences = await fetchConferences()
  return <ConferencesView conferences={conferences} />
}
```

### 8.5 MUI → Tailwind

```tsx
// Legacy MUI
import { makeStyles, createStyles } from '@material-ui/core'
const useStyles = makeStyles(() => createStyles({
  container: { display: 'flex', flexDirection: 'column', padding: '16px' }
}))
const classes = useStyles()
<div className={classes.container}>

// Next.js Tailwind
<div className="flex flex-col p-4">
```

---

## 9. Middleware Update Required

The current middleware only checks for the `cm_user` cookie. It needs to be extended to enforce the admin route group:

```ts
// middleware.ts — extend to guard /admin/* routes
const isAdminPath = pathname.startsWith('/admin')
if (isAdminPath) {
  const userCookie = req.cookies.get('cm_user')
  if (!userCookie) return NextResponse.redirect(loginUrl)

  const user = JSON.parse(userCookie.value)
  if (!user?.isAdmin) return NextResponse.redirect(homeUrl)
}
```

---

## 10. Progress Tracker

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Route groups & layout shells | ✅ done |
| Phase 2 | Public conferences pages | ✅ done |
| Phase 3 | Admin conference management | ✅ done |
| Phase 4 | Play / full-screen mode | ✅ done |
| Phase 5 | User management pages | ❌ not started |
| Phase 6 | Filter & dashboard components | ❌ not started |
| Phase 7 | Shared UI & profile | ❌ not started |
| Phase 8 | i18n & theme cleanup | ❌ not started |
| Phase 9 | Missing API endpoints | ❌ not started |
| Phase 10 | Cleanup & tests | ❌ not started |

**Effort key:** S = small (< 2h) · M = medium (2–4h) · L = large (> 4h)
