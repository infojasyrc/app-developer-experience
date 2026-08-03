# MIGRATION_PLAN — whitewolf-rn (Expo / React Native)

## Goal

Upgrade the Ignite-based Expo app from **SDK 52 / RN 0.76 / React 18 / Node 20** to **Expo SDK 57 / React Native 0.86 / React 19 / Node 22**, aligning all Expo modules, test tooling, TypeScript, and ESLint. Remove deprecated or redundant packages.

## Current state (baseline)

| Area | Version |
|------|---------|
| Expo SDK | ~52.0.20 |
| React Native | 0.76.5 |
| React | 18.3.1 |
| Node (`.nvmrc`) | v22.23 (engines still allow 18/20) |
| TypeScript | ~5.7.2 |
| Jest | 29 + jest-expo ~52 |
| New Architecture | Enabled via `expo-build-properties` |

## Target state

| Area | Version |
|------|---------|
| Expo SDK | ~57.0.x |
| React Native | 0.86.x (Expo-pinned) |
| React | 19.2.x (Expo-pinned) |
| Node | `>=22.13.0` (Expo SDK 57 minimum) |
| TypeScript | ~5.9.x (Expo-compatible) |
| Jest | 29 + jest-expo ~57 |
| ESLint | 9.x via `eslint-config-expo` |

## Phases

### Phase 1 — Core SDK bump

1. Set `engines.node` to `>=22.13.0` and keep `.nvmrc` at `22`.
2. Run `npx expo install expo@^57.0.0 --fix` to align all `expo-*` packages and `react-native` / `react` / `react-dom` / `react-native-web`.
3. Bump `@expo/metro-runtime` and other manually pinned Expo-related deps to SDK 57 ranges.

### Phase 2 — Application libraries

1. Upgrade React Navigation to v7 (required for current RN / React).
2. Upgrade `@shopify/flash-list`, Reanimated, Gesture Handler, Screens, Safe Area, MMKV, Keyboard Controller to versions compatible with RN 0.86 (via `expo install` where applicable).
3. Upgrade MobX stack (`mobx`, `mobx-react-lite`, `mobx-state-tree`) to current stable minors.
4. Upgrade i18n (`i18next`, `react-i18next`) and remove `intl-pluralrules` if redundant with modern `Intl` (verify i18n tests first).

### Phase 3 — Dev / test / TypeScript

1. Remove `postinstall-prepare` (legacy Ignite hook; not needed for npm lifecycle).
2. Align `react-test-renderer` with React 19.
3. Upgrade `@testing-library/react-native`, `@types/jest`, `@types/react`, `typescript`, Babel packages.
4. Pin `jest-expo` to ~57 and refresh `jest.config.js` if preset options changed.
5. Drop `@react-native-community/cli` if unused (Expo manages native tooling); keep only if scripts require it.

### Phase 4 — ESLint cleanup

1. Remove deprecated `eslint-config-standard` / `eslint-plugin-n` / `eslint-plugin-promise` stack in favor of `eslint-config-expo` (+ Prettier).
2. Migrate to ESLint flat config (`eslint.config.js`) if required by `eslint-config-expo@57`.
3. Retain project-specific rules (Reactotron, Prettier, TypeScript overrides).

### Phase 5 — Native projects & config

1. Run `npx expo prebuild --clean` **only if** native drift blocks CI; prefer minimal Gradle/Podfile updates from Expo upgrade docs when committed ios/android folders exist.
2. Update `app.json` / `expo-build-properties` if SDK 57 defaults differ (New Arch already on).
3. Refresh `package-lock.json`.

### Phase 6 — Verification

1. `npm run compile` (TypeScript)
2. `npm run lint:check`
3. `npm run test`
4. Manual smoke: `npm start` (optional in CI-less template)

## Risks

| Risk | Mitigation |
|------|------------|
| React 19 typing / test renderer | Match versions; fix component tests |
| React Navigation v7 API | Update navigator types if compile fails |
| ESLint flat config migration | Follow expo eslint guide |
| MMKV / Reanimated native modules | Use expo-compatible versions from `expo install` |
| Committed ios/android vs prebuild | Document that developers may need `prebuild:clean` locally |

## Suggested commits (conventional)

1. `chore(whitewolf-rn): upgrade to Expo SDK 57 and Node 22`
2. `chore(whitewolf-rn): modernize eslint and test dependencies` (if split for review)

## Status

- [x] Plan approved (user requested plan + implement)
- [x] Implementation complete — Expo SDK 57, RN 0.86, Node 22

### Verification (local)

- `npm run compile` — pass
- `npm run lint:check` — pass (warnings only)
- `npm run test` — 22 tests pass

### Follow-up for native builds

Run `npm run prebuild:clean` before `expo run:ios` / `expo run:android` so committed `ios/` and `android/` match SDK 57.
