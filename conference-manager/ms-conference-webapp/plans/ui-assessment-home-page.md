# UI Assessment — Home Page
**App:** ms-conference-webapp  
**Date:** 2026-06-09  
**Reviewer role:** Senior Frontend Designer  
**Scope:** Gear icon · Login button · Version section · Font type  

---

## Method

The running application was observed at `http://localhost:8080` (launched via `make launch-detached`) using Playwright 1.x (Chromium) at 1440 × 900 (desktop) and 390 × 844 (mobile). Source files were cross-referenced for each finding.

---

## 1. Gear Icon (SettingsButton)

### What is it?
`SettingsButton` is a small MUI `IconButton` that opens a `Popover` containing a light / dark mode toggle. It lives at the bottom of `LeftMenu`, which is only rendered inside `AdminShell`.

### Findings

| # | Finding | Severity |
|---|---------|----------|
| 1.1 | **Accessibility silo.** The control is absent from the public home page entirely. Unauthenticated visitors cannot access any theme preference, even though `ThemeContext` persists the preference to `localStorage` for all users. | High |
| 1.2 | **Wrong semantic icon.** A gear (⚙) conventionally signals a general "Settings" menu. This button controls *one* display preference (dark mode). A sun/moon icon — or a combined toggle — communicates the actual function at a glance, without requiring the user to open the popover to discover what the gear does. | Medium |
| 1.3 | **Poor discoverability.** The icon uses MUI `size="small"` + `color: "text.secondary"` (muted gray). It sits below a `border-t` separator at the very bottom of the sidebar, making it easy to overlook. No visible label accompanies it. | Medium |
| 1.4 | **Two-step interaction for a single preference.** The pattern is: click gear → open popover → toggle switch. A direct sun ↔ moon toggle in the header requires one click and is instantly recognisable — consistent with industry standard (GitHub, Vercel, Linear, Figma). | Low |
| 1.5 | **Location coupling.** Because `SettingsButton` is a child of `LeftMenu` → `AdminShell`, any change to the sidebar layout (e.g., collapsing the sidebar) risks losing the theme toggle entirely. | Low |

### Recommendation

```
Header (PublicShell + AdminShell)
  └─ Right section
       ├─ [v0.1.0]          ← version (see §3)
       ├─ [🌙 / ☀ toggle]   ← replaces gear icon
       └─ [Sign In]          ← login button
```

- Move the theme toggle directly into `Header` so it is always reachable.
- Replace the gear icon with a `DarkModeIcon` / `LightModeIcon` icon-button that toggles on click — no intermediate popover needed.
- Apply `aria-label="Toggle dark mode"` directly on the button.
- Remove `SettingsButton` from `LeftMenu`; delete the popover wrapper.

---

## 2. Login Button

### What is it?
A `<button>` in `Header`'s right section, rendered when `isAuthenticated === false`. Styled `bg-white text-mainBlue` with `FiLogIn` icon (14 px) and the text "Login".

### Findings

| # | Finding | Severity |
|---|---------|----------|
| 2.1 | **Touch target too small.** Playwright measures it at **80 × 32 px**. WCAG 2.5.5 (Level AA) requires a minimum of **44 × 44 px**. On mobile, a user with average thumb size will frequently miss or double-tap the button. | High |
| 2.2 | **Contrast risk from header background.** The button is styled `bg-white` against the `bg-mainBlue` header. Visual observation of the running app shows the header's background is not rendering the expected #5669FF blue — the header appears light/off-white, which collapses contrast to near-zero (white button on white header). This is likely a Tailwind v4 / custom-color resolution issue (see §5 — Additional Finding). | High |
| 2.3 | **Label is non-standard.** "Login" is a system term. The industry-standard human-readable label is **"Sign In"** (used by Google, Apple, GitHub, Microsoft, Stripe, Vercel). This matters for perceived quality. | Medium |
| 2.4 | **Icon adds visual noise.** `FiLogIn` at 14 px paired with the word "Login" is redundant. The icon is too small to convey meaning independently; the label carries all the semantic weight. | Low |
| 2.5 | **Missing `type="button"`.** Without an explicit type, a `<button>` inside a `<form>` ancestor defaults to `type="submit"`. Currently harmless, but fragile as the layout evolves. | Low |
| 2.6 | **No loading / disabled state.** When `onLogin` triggers navigation, the button offers no visual feedback to indicate the action was received. | Low |

### Recommendation

```tsx
// Header.tsx — updated Login / Sign-In button
<button
  type="button"
  onClick={onLogin}
  className="flex items-center gap-2 bg-white text-mainBlue text-sm font-semibold
             px-4 py-2.5 rounded-full hover:bg-lightBlue transition-colors
             min-w-[88px] min-h-[44px]"
  aria-label="Sign in to your account"
>
  Sign In
</button>
```

Key changes:
- `py-2.5` → height reaches 44 px.
- `rounded-full` → pill shape, modern and prominent.
- Remove `FiLogIn` icon.
- Rename label to "Sign In".
- Add `type="button"` and an explicit `aria-label`.

---

## 3. Version Section

### What is it?
A `Version` React component rendered in `layout.tsx` **outside** `ThemeRegistry` and `Providers`. It is position-fixed at the bottom-right of every page.

```tsx
// layout.tsx (current)
<body ...>
  <ThemeRegistry>
    <Providers>{children}</Providers>
  </ThemeRegistry>
  <Version />   {/* ← outside theme & providers */}
</body>
```

```tsx
// Version.tsx (current)
<div className="fixed right-10 bottom-0 p-2 bg-white">
  Version: {packageJson.version}
</div>
```

### Findings

| # | Finding | Severity |
|---|---------|----------|
| 3.1 | **Intrusive overlay.** `fixed bottom-0 right-10` places an opaque white box over page content at all scroll positions. Conference cards and footers are partially obscured on shorter viewports. | High |
| 3.2 | **Breaks dark mode.** The component sits outside `ThemeRegistry`, so `bg-white` is permanently hardcoded regardless of the user's selected theme. In dark mode, a white badge in the corner is jarring. | High |
| 3.3 | **Duplicate version display.** `Header` already accepts a `version` prop and renders `v{version}` with appropriate styling (`text-xs text-transparentWhite`). Neither `PublicShell` nor `AdminShell` passes the prop, leaving that slot empty and this component as the only version display. | Medium |
| 3.4 | **Verbose and unstyled label.** "Version: 0.1.0" — the "Version:" prefix is unnecessary. Industry convention is the compact `v0.1.0`. There is no border-radius, shadow, or opacity treatment to soften the badge. | Medium |
| 3.5 | **Wrong component tree position.** Being outside `ThemeRegistry` means it cannot access MUI's `ThemeProvider` or Tailwind's CSS variables derived from the active theme. This will silently break any future attempts to style it responsively. | Low |
| 3.6 | **Should be dev / staging only.** Shipping a raw version badge in a fixed corner is a debug/development convention, not a production UX pattern. If version visibility is a product requirement, it belongs in the header or an "About" page. | Low |

### Recommendation

**Step 1 — Delete the standalone `Version` component.**  
Remove `<Version />` from `layout.tsx` and delete `Version.tsx`.

**Step 2 — Wire the header's existing version slot.**  
In both `PublicShell` and `AdminShell`, import `package.json` and pass the version:

```tsx
// PublicShell.tsx
import pkg from '../../../../package.json';

<Header
  isAuthenticated={isLoggedIn ?? false}
  username={username}
  onLogin={() => router.push('/login')}
  onLogout={handleLogout}
  version={pkg.version}   // ← add this
/>
```

The `Header` already renders `v{version}` in `text-xs text-transparentWhite hidden sm:block` — well-designed and theme-compatible.

**Step 3 (optional hardening)** — Gate version display to non-production environments:

```tsx
version={process.env.NODE_ENV !== 'production' ? pkg.version : undefined}
```

---

## 4. Font Type

### What is it?
The application has **four competing font declarations** that produce an inconsistent, unintentional font stack.

### Current state (traced through source files)

| Layer | File | Declaration | Effective? |
|-------|------|-------------|-----------|
| Web font loading | `layout.tsx` | `Geist` + `Geist_Mono` via `next/font/google` → CSS vars `--font-geist-sans`, `--font-geist-mono` | Loads font files, but vars not applied globally |
| Tailwind v4 theme | `globals.css` | `@theme inline { --font-sans: var(--font-geist-sans) }` | Overridden by step below |
| Tailwind config | `tailwind.config.ts` | `theme.fontFamily.sans: ['-apple-system', 'BlinkMacSystemFont', ...]` — **replaces** (not extends) | **Wins** — becomes `font-sans` |
| Body fallback | `globals.css` | `body { font-family: Arial, Helvetica, sans-serif }` | Dead — Tailwind base styles have higher specificity |
| MUI theme | `muiTheme.ts` | `typography.fontFamily: '-apple-system, BlinkMacSystemFont, ...'` | Applies to MUI components only |

**Playwright-observed computed font on `<body>` and `<h1>`:**  
`-apple-system, "system-ui", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif`  
→ This is the Tailwind config system stack. Geist is downloaded but never rendered.

### Findings

| # | Finding | Severity |
|---|---------|----------|
| 4.1 | **Geist is loaded but never used.** Each page makes a network request for Geist font files; the font never renders because `tailwind.config.ts` overrides `--font-sans` before it can take effect. Wasted bandwidth and a longer LCP. | High |
| 4.2 | **No single source of truth.** Four files each declare a font strategy. Any developer touching one file cannot know which wins without tracing all four. Future changes will be unpredictable. | High |
| 4.3 | **MUI and Tailwind use different stacks.** Even if the page body used Geist, MUI components would render in the system font stack, producing visible typography inconsistency within the same page. | Medium |
| 4.4 | **`globals.css` body declaration is dead code.** The `font-family: Arial, Helvetica, sans-serif` rule on `body` is silently overridden by Tailwind's Preflight. It misleads developers reading the file. | Low |
| 4.5 | **System font stack in `tailwind.config.ts` overrides, not extends.** Writing `theme.fontFamily.sans` (not `theme.extend.fontFamily.sans`) completely replaces Tailwind's built-in `font-sans` default. This is intentional but subtle, and conflicts with the Tailwind v4 `@theme inline` approach in `globals.css`. | Low |
| 4.6 | **No brand font.** The system font stack is a valid performance-first choice, but it provides no visual identity. Geist was already chosen and loaded — the app should commit to it. | Low |

### Recommendation — Adopt Geist as the single brand font

**Step 1 — Fix `tailwind.config.ts`:** Change from `theme` override to `theme.extend` so it adds to the stack rather than replacing Tailwind's default, and lead with Geist:

```ts
// tailwind.config.ts
theme: {
  extend: {
    fontFamily: {
      sans: [
        'var(--font-geist-sans)',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ],
    },
  },
},
```

**Step 2 — Remove the conflicting `globals.css` body rule:**

```css
/* globals.css — remove this line */
font-family: Arial, Helvetica, sans-serif;   /* ← DELETE */
```

**Step 3 — Update MUI theme to match:**

```ts
// muiTheme.ts
typography: {
  fontFamily: [
    'var(--font-geist-sans)',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
},
```

**Step 4 — Verify `layout.tsx` passes the variable to `<body>`:**  
This is already correct — `className={\`${geistSans.variable} ${geistMono.variable} antialiased\`}` sets `--font-geist-sans` on `<body>`. No change needed here.

**Result:** All layers (Tailwind utilities, MUI components, base body styles) use Geist with the system stack as a fallback. The font loads once and renders everywhere.

---

## 5. Additional Finding — Header Background Color

**Observed:** The header's `bg-mainBlue` class is not rendering the expected `#5669FF` background. In both desktop and mobile screenshots, the header area appears as the page background colour (light gray `#f6f7f7`), not blue. This makes the white Login button invisible (white on white) and the logo low-contrast.

**Likely cause:** Tailwind v4 (`^4.1`) changed the configuration mechanism. In v4, custom colours must be declared via `@theme` blocks in CSS. The `tailwind.config.ts` `theme.extend.colors` approach is the v3 pattern and may not be fully honoured by the v4 PostCSS plugin without an explicit `@config` directive in `globals.css`.

**Verification:**

```css
/* globals.css — add at the top, after @import */
@config "../tailwind.config.ts";
```

Or migrate the custom colour tokens into a `@theme` block:

```css
/* globals.css */
@theme {
  --color-mainBlue:    #5669FF;
  --color-darkerBlue:  #3D37F1;
  --color-lightBlue:   #F2F2FA;
  /* … all tokens from tailwind.config.ts … */
}
```

This is a prerequisite for any visual work on the header — the Login button contrast and version display both depend on a correctly rendered blue header.

---

## Implementation Roadmap

| Priority | Item | Files affected | Effort |
|----------|------|----------------|--------|
| P0 | Fix Tailwind v4 custom colour resolution (§5) | `globals.css` | XS |
| P1 | Delete `Version.tsx`, wire `version` prop in shells (§3) | `layout.tsx`, `Version.tsx`, `PublicShell.tsx`, `AdminShell.tsx` | S |
| P1 | Fix font — single Geist stack across Tailwind + MUI (§4) | `tailwind.config.ts`, `globals.css`, `muiTheme.ts` | S |
| P2 | Improve Login → Sign In button (size, label, style) (§2) | `Header.tsx` | S |
| P2 | Move theme toggle to Header, replace gear with sun/moon icon (§1) | `Header.tsx`, `LeftMenu.tsx`, `SettingsButton.tsx` | M |
| P3 | Add unit tests for updated Header with version + theme toggle | `Header.spec.tsx` | M |

**Estimated total:** 1–2 engineer-days for all items.
