# Plan: Migración de Pipfile a uv en cm-admin y remediación de alertas Dependabot

> Destino final de este documento: `docs/plans/Claude_Code_20261012-cm-admin-pipfile-to-uv-migration.md`
> (Paso 0 de implementación; plan mode solo permite escribir aquí. Formato según `docs/plans/TEMPLATE.md`.)

## Goal
Migrar `conference-manager/ms-conference-admin` (alias `cm-admin`, Django + MongoDB) de Pipenv (`Pipfile`/`Pipfile.lock`) a `uv` (`pyproject.toml`/`uv.lock`), alineando `Dockerfile`, `Makefile`, compose y documentación con `backend/fastapi-rest-tpl` y con la migración ya hecha en `cli/` (#292), y cerrando las 8 alertas de seguridad abiertas de Dependabot sobre este paquete.

## Scope
- Affected component(s): `conference-manager/ms-conference-admin/` (cm-admin), `.github/` (dependabot + CI), `agents/shared/context/`, `.github/copilot-instructions.md`.
- Files to touch:
  - `docs/plans/Claude_Code_20261012-cm-admin-pipfile-to-uv-migration.md` [NEW – este plan]
  - `ms-conference-admin/pyproject.toml` [NEW]
  - `ms-conference-admin/uv.lock` [NEW – generado en contenedor vía `make install-dependencies`]
  - `ms-conference-admin/Pipfile`, `Pipfile.lock` [DELETE]
  - `ms-conference-admin/Dockerfile` [REWRITE, base `backend/fastapi-rest-tpl/Dockerfile`]
  - `ms-conference-admin/.dockerignore` [MODIFY: `!pyproject.toml`, `!uv.lock`]
  - `ms-conference-admin/Makefile` [MODIFY]
  - `ms-conference-admin/docker-compose/docker-compose.local.yml` y `.prod.yml` [MODIFY: quitar `pipenv run`]
  - `ms-conference-admin/README.md`, `docs/README.md` [MODIFY]
  - `.github/dependabot.yml` [MODIFY: entradas `uv` y `docker` para `/conference-manager/ms-conference-admin`]
  - `.github/workflows/pull_request_cm_components.yml` [MODIFY: nuevo job `conference-admin-verify` (como webapp y api) y añadirlo a `needs` de `pr-gate-cm-components`; hoy no existe job para admin]
  - `agents/shared/context/development-guidance.md` (l.199 "from Pipfile") y `.github/copilot-instructions.md` (l.35) [MODIFY]
- Out of scope:
  - Cambios funcionales de modelos/vistas Django; no se reescribe a FastAPI (`.cursor/rules/conference-manager.mdc`: desajuste de stack conocido y aceptado).
  - Upgrade de major de Django salvo que lo exija la remediación (ver Riesgos).
  - `shared-services` y `ms-conference-api`.

## Contract / interface
- Comandos Make públicos se conservan (`build-dev`, `build-prod`, `create-volumes`, `install-dependencies`, `launch-local`, `stop-local`, `launch-prod`, `stop-prod`, `interactive`, `logs`, `launch-db`, `stop-db`, `reset-db`, `docker-clean`) y se **añaden** `lint` y `unit-tests` (canónicos según ADR 0001 y `CLAUDE.md`).
- Puerto 3001→3000, variables `.env`/`.env.public` y volumen `$(COMPOSE_PROJECT_NAME)-admin-packages` sin cambios.
- Imagen: el target `dev` reemplaza a `build` como target de desarrollo (`build-dev` usa `--target dev`); nombres de imagen (`*-admin-dev`, `*-admin`) iguales, por lo que compose no cambia de imagen.

## Baseline (hallazgos)
- `Pipfile`: `django-mongodb-backend="*"`, `pyjwt==2.8.0`, `passlib[bcrypt]==1.7.4`, `tzdata==2023.3`; dev: black, flake8 4.0.1, isort, pre-commit 2.15.0, pytest 8.3.4, pytest-cov, pytest-mock, pytest-asyncio. Python 3.10. Lock: django 5.1.6, django-mongodb-backend 5.1.0b1, pymongo 4.11.1.
- `Dockerfile` actual: `python:3.10.13-alpine3.18`, instala pipenv 2023.10.24, `CMD pipenv run …`, y un `HEALTHCHECK` con `curl` que no existe en Alpine (bug latente → se corrige con healthcheck vía `python urllib`, como fastapi).
- Bug previo en `docker-compose.prod.yml`: `working_dir: /app/src` no existe en la imagen prod (el Dockerfile copia `src` a `/app`); se corrige al fijar `WORKDIR /app/src` en `prod`. `.github/instructions/branch_strategy.instructions.md` l.63 ya menciona un job `conference-admin-verify` inexistente: usar ese nombre en el paso 9.
- `Makefile` sin `lint` ni `unit-tests`; `install-dependencies` = `pipenv install --dev`; `interactive` usa `PIPENV_PIPFILE`.
- Tests: solo el stub `src/manager/tests.py` → el umbral de 80 % (CLAUDE.md) no se cumple hoy; ver Riesgos.
- `.github/dependabot.yml` no cubre cm-admin; las alertas vienen del escaneo de `Pipfile`/`Pipfile.lock`.

### Alertas Dependabot abiertas en cm-admin (API `dependabot/alerts`)
| # | Paquete | Severidad | Fix mínimo | Origen |
|---|---|---|---|---|
| 1484, 1483 | pymongo | high | 4.18.2 | Pipfile.lock (4.11.1) |
| 1482 | pymongo | medium | 4.18.2 | idem |
| 1480 | pymongo | medium | 4.18.1 | idem |
| 1479, 1481 | PyJWT | medium | 2.15.0 | Pipfile (`==2.8.0`) y lock |
| 1457 | virtualenv | high | 21.7.13 | transitiva de pre-commit |
| 1456 | virtualenv | high | 21.7.12 | idem |
- No hay PRs de Dependabot abiertos ni históricos para cm-admin (`gh pr list`), por lo que la remediación es manual; el PR debe referenciar las alertas (la plantilla permite updates manuales que corrigen CVE).
- Re-ejecutar `gh api repos/{owner}/{repo}/dependabot/alerts?state=open` al iniciar la implementación para capturar alertas nuevas.

## Implementation steps
Seguir `000-core.mdc`: un paso a la vez, mostrar diff, ejecutar lint/tests tras cada paso y pedir confirmación si un paso cambia el plan. Todo vía Make/contenedor; nunca `python`/`pip`/`pipenv`/`uv` en el host.

0. **Plan**: copiar este documento a `docs/plans/Claude_Code_20261012-cm-admin-pipfile-to-uv-migration.md` y esperar confirmación explícita.
1. **Rama** desde `main` (nunca push a main): `cm-admin/jose/refactor/migrate-pipfile-to-uv` (`docs/standards/branching.md`).
2. **`pyproject.toml`** (modelo: `backend/fastapi-rest-tpl/pyproject.toml`):
   - `[project]` name `ms-conference-admin`, `requires-python` `>=3.14,<3.15` (fallback `>=3.13,<3.14` si `django-mongodb-backend` no soporta 3.14; verificar al resolver).
   - `dependencies`: `django-mongodb-backend` (cota inferior a la versión estable vigente en vez de `*`), `pymongo>=4.18.2`, `pyjwt>=2.15.0`, `passlib[bcrypt]==1.7.4` + `bcrypt<5` si passlib lo requiere (verificar), `tzdata` actual. Antes de conservar `pyjwt`/`passlib`, `grep` en `src/` si se usan; si no, eliminarlos (cierra 1479/1481 por eliminación) y documentarlo.
   - `[dependency-groups] dev`: `black`, `flake8`, `isort`, `pre-commit>=4`, `pytest>=9.0.3`, `pytest-cov>=7`, `pytest-mock`, `pytest-django` (nuevo; necesario para testear Django) y `pytest-asyncio` solo si se usa.
   - `[tool.uv] package = false` y `constraint-dependencies` = `["pymongo>=4.18.2", "pyjwt>=2.15.0", "virtualenv>=21.7.13"]` (patrón de fastapi-rest-tpl).
   - `[tool.black]`/`[tool.isort]` (line-length 120), `[tool.pytest.ini_options]` (`DJANGO_SETTINGS_MODULE = "quickstart.settings"`, `pythonpath = ["src"]`, `addopts = "--cov=src --cov-fail-under=80 --cov-report=term-missing"`) y `[tool.flake8]` con `exclude = ".venv,migrations"`.
3. **`Dockerfile`** (basado en `backend/fastapi-rest-tpl/Dockerfile`, multi-stage `dev` → `build` → `prod`):
   - `dev`: `python:3.14-alpine` + `COPY --from=ghcr.io/astral-sh/uv:0.12.9 /uv /uvx /bin/` (misma versión que fastapi/cli), `apk add build-base` (+ `libffi-dev` si bcrypt lo exige), ENV `UV_COMPILE_BYTECODE=1`, `UV_LINK_MODE=copy`, `UV_PROJECT_ENVIRONMENT=/app/.venv`, `PYTHONPATH=/app/src`, `PYTHONDONTWRITEBYTECODE`, `PYTHONFAULTHANDLER`. Conservar `wait4x` solo si compose lo usa (hoy no).
   - `build`: copia `pyproject.toml` + `uv.lock`, `uv sync --frozen --no-dev --no-install-project`.
   - `prod`: `python:3.14-alpine` limpio, `COPY --from=build /app/.venv`, `COPY src /app/src`, `PATH=/app/.venv/bin:$PATH`, usuario no root, `HEALTHCHECK` con `python -c urllib.request.urlopen('http://127.0.0.1:3000/')`, `EXPOSE 3000`, `CMD ["python","manage.py","runserver","0.0.0.0:3000"]` (el WORKDIR/`manage.py` está en `src/`: ajustar `WORKDIR /app/src`). Evaluar `gunicorn` como siguiente paso, fuera de alcance.
   - `.dockerignore`: `!pyproject.toml`, `!uv.lock`, `!src/`.
4. **`Makefile`** (modelo: `backend/fastapi-rest-tpl/Makefile`):
   - `build-dev`: `docker build --target dev`; `build-prod`: `--target prod`.
   - `install-dependencies`: `uv lock && uv sync --group dev` en contenedor con `DEV_VOLUME`.
   - Nuevos `lint` (`uv run black --check src && uv run isort --check-only src && uv run flake8 src`) y `unit-tests` (`uv run pytest`), con `--rm` y `DEV_ENV` (`PYTHONPATH`, variables `DB_*` mínimas).
   - `interactive`: quitar `PIPENV_PIPFILE`; usar `source .venv/bin/activate && exec ash`.
   - Añadir `lint unit-tests` a `.PHONY`; mantener delegación a `../shared-services`, `help`, y la compatibilidad Windows.
   - Añadir `Bash(make ...)` solo si faltara algo en `.claude/settings.json` (ya permite `lint`, `unit-tests`, `build-*`, `install-dependencies`).
5. **docker-compose** local/prod: `command: /bin/ash -ci "python manage.py migrate"` y `python manage.py runserver 0.0.0.0:3000` (el `.venv` del volumen ya está en `PATH`; en local añadir `PATH` o usar `uv run`). Corregir `ENVIRONMENT` en `local.yml` si procede. Verificar que el `.venv` montado desde el volumen es el que usa el `dev`.
6. **Tests mínimos** para cumplir 80 %: `pytest-django` + tests de `quickstart/environment.py`, `settings` (carga de DB), `urls` y `manager` (admin registrado, `manage.py check`). Si el 80 % no es alcanzable sin cambios funcionales, proponer al usuario (AskUserQuestion) umbral transitorio documentado; no bajar el umbral en silencio.
7. **Generar lock y limpiar**: `make create-volumes && make build-dev && make install-dependencies` → genera `uv.lock`; eliminar `Pipfile` y `Pipfile.lock`; inspeccionar `uv.lock` para confirmar `pymongo>=4.18.2`, `pyjwt>=2.15.0`, `virtualenv>=21.7.13` (o ausencia).
8. **Documentación** (`cm-admin`):
   - `README.md`: reemplazar "no host Python or `pipenv`" por `uv`; tabla de Make targets (incluye `lint`, `unit-tests`, `docker-clean`); sección "Dependency management" (editar `pyproject.toml`, `make install-dependencies` regenera `uv.lock`, nunca `uv` en host); rellenar "Project structure" (vacía hoy) con árbol `src/{quickstart,manager,mongo_migrations}`.
   - `docs/README.md`: comandos `manage.py` vía `make interactive` / `uv run`; versión de Django actualizada (hoy dice 5.0).
   - `agents/shared/context/development-guidance.md` l.199 → "from `pyproject.toml` / `uv.lock`"; añadir `lint`/`unit-tests` en la tabla de cm-admin; `.github/copilot-instructions.md` l.35 si aplica.
9. **Dependabot y CI**:
   - `.github/dependabot.yml`: añadir `uv` y `docker` para `/conference-manager/ms-conference-admin` (weekly, límite 5, prefijo `chore(deps)`), igual que fastapi/cli.
   - `.github/workflows/pull_request_cm_components.yml` (requiere go-ahead humano explícito: `tool-policy.md` regla 3 para escrituras en workflows). Sin tocar los jobs existentes:
     1. Añadir job `conference-admin-verify` (nombre: "running lint and unit tests for conference manager admin"), calcado de `conference-webapp-verify` / `conference-api-verify`: `needs: get-changed-packages`, `runs-on: ubuntu-24.04`, `if: contains(needs.get-changed-packages.outputs.changed_packages, 'cm-admin')`, `defaults.run.working-directory: ./conference-manager/ms-conference-admin`, pasos: checkout (`fetch-depth: 2`), `make create-volumes` (el admin lo necesita para el volumen de paquetes y delega a `shared-services`), `make build-dev`, `make install-dependencies`, `make lint`, `make unit-tests`, `make build-prod`. `lint` sin `continue-on-error` (cm-admin parte limpio con uv); decidir con el usuario si se replica `continue-on-error: true` de webapp/api.
     2. **pr-gate**: en `pr-gate-cm-components` cambiar `needs: [get-changed-packages, conference-webapp-verify, conference-api-verify]` por `needs: [get-changed-packages, conference-webapp-verify, conference-api-verify, conference-admin-verify]`. El bucle `RESULTS: join(needs.*.result)` ya acepta `success|skipped`, por lo que no requiere más cambios; así un fallo en admin bloquea el check requerido `pr-gate-cm-components`.
     3. Verificar que `.github/actions/get-changed-packages/get-changed-packages.sh` (l.38) emite `cm-admin` cuando cambian archivos bajo `conference-manager/ms-conference-admin/` (ya mapeado) y que `.github/instructions/branch_strategy.instructions.md` l.63 queda coherente.
     4. Validar la sintaxis YAML (lectura/`actionlint` en contenedor si existe) y ejecutar localmente los mismos targets Make; no ejecutar el workflow desde aquí. Nota: el PR modifica `ms-conference-admin/**`, por lo que el nuevo job correrá en el propio PR como prueba.
10. **Validación final** (ver sección Verification).
11. **Commits** (Conventional Commits, ver `agents/shared/context/commit-conventions.md`): `refactor(cm-admin): migrate dependency management from pipfile to uv`, y commits separados `fix(cm-admin): bump pymongo and pyjwt to patched versions`, `ci(cm-admin): add dependabot and pr verification`, `docs(cm-admin): document uv workflow`. Terminar con `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
12. **Pull request** (ver sección siguiente).

## Pull request
- Branch: `cm-admin/jose/refactor/migrate-pipfile-to-uv`; base `main`; push solo de la rama, tras confirmación del usuario.
- Cuerpo: **construido a partir de `.github/pull_request_template.md`** (conservar todos los encabezados y comentarios; rellenar con `gh pr create --body-file`). Sin atribución de IA en el cuerpo (regla de `CLAUDE.md` prevalece sobre el recordatorio de footer para PRs).
- Mapeo a la plantilla:
  - **Project or Area**: `[x] ms-conference-admin (cm-admin)`; marcar también `[x] App Developer Experience (ade)` por `.github`/`agents`.
  - **Issue ticket number and link**: `docs/plans/Claude_Code_20261012-cm-admin-pipfile-to-uv-migration.md` + alertas Dependabot #1456, #1457, #1479–#1484.
  - **Checklist**: self-review y tests marcados; analytics/product update sin marcar.
  - **Pull request type**: `:recycle: Refactoring`, `:pencil: Documentation`, `:white_check_mark: Unit testing`, `:wrench: config files`, `:hammer: dev scripts`.
  - **What is the current module?**: cm-admin con Pipenv, Python 3.10, alpine 3.18, 8 alertas abiertas.
  - **What is the new behavior?**: uv + lock, Dockerfile multi-stage, Make `lint`/`unit-tests`, CI y Dependabot para cm-admin, docs; tabla de alertas cerradas.
  - **Breaking change**: `[x] No` para consumidores (Make targets conservados); nota: contribuidores deben reconstruir imagen y volumen de paquetes (`docker volume rm <proj>-admin-packages`).
  - **Screenshots**: salida de `make lint`/`unit-tests` o N/A.

## Risks
- **Compatibilidad Python 3.14**: `django-mongodb-backend` (beta en lock actual) puede no declarar soporte; fallback a 3.13 documentado en el paso 2.
- **Salto Django 5.1 → versión actual** al desbloquear `*`: puede requerir migraciones o ajustes en `settings.py`; mantener lo mínimo y verificar con `manage.py check` y `migrate` contra el Mongo compartido.
- **Cobertura 80 %** sin suite de tests previa (ver paso 6).
- **passlib 1.7.4 + bcrypt ≥ 4.1** produce warnings/errores; fijar o eliminar si no se usa.
- Volumen `*-admin-packages` con `.venv` de Pipenv obsoleto: recrearlo.
- Alertas de `virtualenv` desaparecen solo si `pre-commit` se actualiza o se constriñe; confirmar en `uv.lock`.
- Dependabot tarda en re-escanear tras mergear; las alertas se cierran solas al eliminar `Pipfile*`.

## Acceptance criteria
- [ ] `Pipfile`/`Pipfile.lock` eliminados; `pyproject.toml` + `uv.lock` presentes y `uv lock --check` limpio.
- [ ] `make build-dev`, `create-volumes`, `install-dependencies`, `lint`, `unit-tests` (≥ 80 %), `build-prod` pasan.
- [ ] `make launch-local` levanta admin en http://localhost:3001 con migraciones aplicadas; `launch-prod` y su healthcheck funcionan.
- [ ] `uv.lock` resuelve pymongo ≥ 4.18.2, pyjwt ≥ 2.15.0 (o eliminado) y virtualenv ≥ 21.7.13; sin `pipenv`/`Pipfile` residual (`grep -ri pipenv conference-manager/ms-conference-admin agents .github`).
- [ ] Dependabot cubre cm-admin (uv + docker); `conference-admin-verify` existe y corre en el PR; `pr-gate-cm-components` lo incluye en `needs` y falla si admin falla.
- [ ] README y docs actualizados; `development-guidance.md` coherente.
- [ ] PR creado desde la plantilla, sin atribución de IA, sin push a `main`.

## Impacted consumers
- Desarrolladores y agentes que usan `make` en cm-admin (reconstruir imagen/volumen).
- Raíz de `conference-manager/` (Makefile/compose que orquesta cm-admin) y `shared-services` (sin cambio, solo verificar `launch-db`).
- `.github/workflows/pull_request_cm_components.yml` y `.github/actions/get-changed-packages` (ya detecta `cm-admin`).
- `agents/shared/context/development-guidance.md`, `.github/copilot-instructions.md`.

## Verification (end-to-end)
1. `make create-volumes && make build-dev && make install-dependencies`
2. `make lint && make unit-tests`
3. `make build-prod && make launch-prod`, comprobar `docker inspect --format '{{.State.Health.Status}}'` = healthy y `curl -I http://localhost:3001/admin/`; `make stop-prod`.
4. `make launch-local`, `make logs` sin errores de migración; abrir `/admin/`; `make stop-local`.
5. `gh api repos/{owner}/{repo}/dependabot/alerts?state=open` tras el merge: sin alertas de cm-admin.
6. `docker images` para comparar tamaño de imagen prod antes/después (métrica "optimized image").

## Implementation notes (deviations from the plan)
- `uv` resolved Django 5.1.6 → **6.1.2** and `django-mongodb-backend` 5.1.0b1 → **6.1.0** on Python 3.14 (no 3.13 fallback needed). `migrate`, the admin login page and the prod healthcheck were verified against the shared MongoDB.
- `pyjwt` and `passlib[bcrypt]` were **removed**: nothing in `src/` imports them. This closes #1479 and #1481 by removal; `pymongo` resolved to 4.18.3 (#1480–#1484) and `virtualenv` to 21.14.7 (#1456, #1457). `tzdata` kept unpinned (>=2025.2).
- Extra files/targets: `.flake8` (flake8 does not read `pyproject.toml`), `make format` (black + isort), and a one-off `black`/`isort` reformat of existing sources so `make lint` passes.
- Added tests: `quickstart/test_environment.py`, `quickstart/test_settings.py`, `manager/tests.py` (98.6 % coverage, no database required).
- Prod image: 164 MB, non-root user, `WORKDIR /app/src`, healthcheck on `/admin/login/` (`/` is not routed). `lint` in the new CI job is blocking (no `continue-on-error`).
- Local compose runs `uv run --no-sync python manage.py ...` because the dev image does not put the packages-volume venv on `PATH`.
