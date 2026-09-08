# Plan: Standardize NestJS template lint (single quotes)

## Goal

Make `MS_NESTJS_REST` (`backend/nestjs-rest-tpl`) and `MS_NESTJS_GQL` (`backend/nestjs-gql-tpl`) share one NestJS-aligned ESLint + Prettier setup, then apply it with `make lint` so imports and strings use the same quote style.

The ESLint files are already copies of each other. Quote style is controlled by Prettier (via `eslint-plugin-prettier`), not by an ESLint `quotes` rule. GQL has `.prettierrc` with `"singleQuote": true` (`from '@nestjs/common'`). REST has **no** `.prettierrc`, so Prettier defaults to `singleQuote: false` (`from "@nestjs/common"`). `npm run lint` is `eslint "{src,apps,libs,test}/**/*.ts" --fix`, so `make lint` will rewrite REST sources once `.prettierrc` exists.

## Scope

- Affected component(s): `backend/` NestJS templates only (`MS_NESTJS_REST`, `MS_NESTJS_GQL`)
- Files to touch (estimate):
  - `backend/nestjs-rest-tpl/.prettierrc` (add; identical to GQL)
  - `backend/nestjs-rest-tpl/eslint.config.mjs`
  - `backend/nestjs-gql-tpl/eslint.config.mjs`
  - Auto-fixed TypeScript under `src/` and `test/` in both templates via `make lint` (REST will be a large quote-only rewrite)
- Out of scope (explicit):
  - Nest 12 `typescript-starter` (oxlint / Vitest) — these templates are Nest 11
  - `typescript-eslint` `recommendedTypeChecked`
  - Copying REST husky/lint-staged into GQL
  - Conference Manager (Django, not these templates)
  - Adding `arrowParens: "avoid"` (Nest framework `.prettierrc` extra; would reformat GQL unnecessarily)

## Contract / interface

No API or CLI contract change. Public HTTP/GraphQL surfaces, exported types, and Make targets stay the same.

Future services bootstrapped from these templates via `make create-nodejs-rest` / `make create-nodejs-gql` inherit the shared lint style (`singleQuote: true`, `trailingComma: "all"`).

No new npm packages: `eslint-plugin-prettier` and `eslint-config-prettier` are already in both `package.json` files.

### NestJS standard (Nest 11)

Do **not** follow the current Nest 12 `typescript-starter`. Authoritative Nest 11 sources:

- **Nest CLI / typescript-starter (Nest 11)** `.prettierrc`: `{ "singleQuote": true, "trailingComma": "all" }` — same as GQL today.
- **`nestjs/nest` framework** `.prettierrc`: adds `"arrowParens": "avoid"` on top of that — **do not** add this.
- **Community**: `nest new` ships `singleQuote: true`; double quotes are a deviation.
- **ESLint wiring**: `eslint-plugin-prettier/recommended` last, plus Nest’s four TypeScript offs (`interface-name-prefix`, `explicit-function-return-type`, `explicit-module-boundary-types`, `no-explicit-any`).

**Chosen standard:** Nest CLI Prettier (`singleQuote` + `trailingComma: "all"`).

### Unified ESLint config (both templates)

Replace both `eslint.config.mjs` files with the **same** file:

- Single quotes in the config file (Nest style). `make lint` does not format `.mjs`.
- Fix typo `tsConfigRootDir` → `tsconfigRootDir`.
- `ignores`: `eslint.config.mjs`, `dist/**`, `coverage/**`, `node_modules/**` (replace empty `ignores: []`).
- Keep `@typescript-eslint/parser` + plugin and the four Nest rule offs (already present).
- Wire Prettier as Nest does: `import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'` and put that config **last**. Drop the manual `prettierPlugin.configs.recommended.rules` spread.

Shared file:

```javascript
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default [
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
        sourceType: 'module',
      },
      globals: {
        jest: 'readonly',
      },
      ecmaVersion: 2021,
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
  eslintPluginPrettierRecommended,
];
```

REST `.prettierrc` (copy of GQL):

```json
{
  "singleQuote": true,
  "trailingComma": "all"
}
```

## Implementation steps

Wait for explicit confirmation before writing code. Then implement one step at a time; after each step show the diff and run relevant lint/tests. Use Make only inside each template directory (no host `npm` / `node` / `nvm`).

1. Add `backend/nestjs-rest-tpl/.prettierrc` identical to `backend/nestjs-gql-tpl/.prettierrc` (`singleQuote: true`, `trailingComma: "all"`).
2. Write the shared `eslint.config.mjs` (see Contract above) into both `backend/nestjs-rest-tpl/eslint.config.mjs` and `backend/nestjs-gql-tpl/eslint.config.mjs`.
3. **Apply the standard** — from each template directory:

   ```bash
   make help
   # if needed: make build-dev && make create-volumes && make install-dependencies
   make lint
   ```

   REST should convert double-quoted imports/strings to single quotes. GQL should stay essentially unchanged aside from any leftover Prettier fixes. Tightening ignores or Prettier wiring could surface a few existing violations; `--fix` should handle formatting; remaining ESLint errors get fixed in the same step.

4. Re-run `make lint` (clean) and `make unit-tests` in both templates. Do not move on if coverage drops below 80% or tests fail because of quote-only diffs in snapshots (unlikely; check anyway).

Suggested commit (after implementation): `style: align NestJS templates on Nest CLI prettier`

## Risks

- REST will have a large quote-only diff; that is expected.
- `make lint` needs a prior `make build-dev` / `make install-dependencies` (named Docker volume). CI already does this in `.github/workflows/pull_request_backend.yml` (`nestjs-rest-tpl-unit-tests` and `nestjs-gql-tpl-unit-tests`).
- Tightening ignores or Prettier wiring could surface a few existing violations; `--fix` should handle formatting; remaining ESLint errors get fixed in the same step.

## Acceptance criteria

- [ ] Both templates have the same `.prettierrc` (`singleQuote: true`, `trailingComma: "all"`).
- [ ] Both `eslint.config.mjs` files are identical (Nest CLI rules + prettier recommended last + real ignores + `tsconfigRootDir`).
- [ ] TypeScript in both templates uses single quotes in imports/strings.
- [ ] `make lint` and `make unit-tests` succeed in both templates.
- [ ] Coverage stays at or above 80% per template.

## Impacted consumers

- **Direct:** none at runtime. These packages are bootstrap templates, not imported libraries.
- **Future services** generated with `make create-nodejs-rest` / `make create-nodejs-gql` inherit the shared lint style.
- **CI:** `.github/workflows/pull_request_backend.yml` already runs `make lint` and `make unit-tests` for both templates; no workflow change required.
- **Conference Manager:** not a consumer of these NestJS templates today (Django admin + REST API). New microservices added there later should be bootstrapped from the matching template and would then pick up this lint standard.
