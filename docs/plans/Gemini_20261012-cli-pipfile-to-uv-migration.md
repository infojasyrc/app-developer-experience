# Plan: Migración de Pipfile a uv en cli/ y Resolución de Alertas de Seguridad Dependabot

## Goal
Migrar el gestor de dependencias de la herramienta interna `cli/` (`appdevexp`) de Pipenv (`Pipfile` / `Pipfile.lock`) a `uv` (`pyproject.toml` / `uv.lock`), modernizando el `Dockerfile` tomando como base la arquitectura multi-stage de `backend/fastapi-rest-tpl`, armonizando los targets del `Makefile` bajo el estándar de Unified CLI Facade, actualizando la documentación interna y reglas de agentes, remediando las vulnerabilidades de seguridad abiertas por Dependabot, e integrando la configuración para abrir el Pull Request correspondiente según el template monorepo.

---

## Scope
- **Affected component(s)**: `cli/` (herramienta de monorepo / platform component), `.github/` (workflows y Dependabot), `.cursor/rules/cli.mdc`, `docs/plans/`.
- **Files to touch (estimate)**:
  - `docs/plans/Gemini_20261012-cli-pipfile-to-uv-migration.md` [NEW - este plan]
  - `cli/pyproject.toml` [NEW - reemplaza a `Pipfile`]
  - `cli/uv.lock` [NEW - reemplaza a `Pipfile.lock`]
  - `cli/Pipfile` [DELETE]
  - `cli/Pipfile.lock` [DELETE]
  - `cli/Dockerfile` [MODIFY - alineado con `backend/fastapi-rest-tpl`]
  - `cli/Makefile` [MODIFY - Unified CLI Facade con `uv`, variables PLATFORM y COMPOSE_PROJECT_NAME]
  - `cli/.env.public` [MODIFY - estandarización de variables de entorno]
  - `cli/README.md` [MODIFY - documentación exhaustiva de arquitectura y Make targets]
  - `.cursor/rules/cli.mdc` [MODIFY - actualización de Pipenv a `uv`]
  - `.github/dependabot.yml` [MODIFY - añadir monitoreo de `uv` y `docker` para `/cli`]
  - `.github/workflows/pull_request_cli.yml` [MODIFY - actualización de comandos de instalación y test a `uv`]
- **Out of scope (explicit)**:
  - Reescritura funcional o adición de nuevos comandos en `cli/src/main.py` (el alcance es la modernización del tooling, packaging, dependencias y seguridad).
  - Modificación de otros servicios backend o templates que ya utilizan `uv` (`backend/fastapi-rest-tpl`, `tools/knowledge-mcp`).
  - Publicación del binario en registros de paquetes externos o releases automatizados de GitHub.

---

## Baseline Findings & Diagnóstico

### 1. Estado Actual de Dependencias y Seguridad en `cli/`
Actualmente `cli/` gestiona sus paquetes con Pipenv a través de `cli/Pipfile`:
```toml
[packages]
inquirer = "==3.4.0"
gitpython = "==3.1.44"
click = "==8.1.8"
pyinstaller = "==6.10.0"
macholib = { version="==1.16.3" , markers = "sys_platform == 'darwin'" }
wheel = "==0.45.1"

[dev-packages]
pytest = "==8.3.5"
pytest-mock = "==3.14.0"

[requires]
python_version = "3.11"
```

### 2. Alertas Críticas y de Alta Severidad de Dependabot Identificadas en `cli/`
La revisión de la API de Dependabot del repositorio reveló múltiples alertas de seguridad abiertas en `cli/Pipfile` y `cli/Pipfile.lock`:
1. **`GitPython` (Múltiples alertas críticas y altas: #1353, #1352, #1351, #1350, #1349, #1348, #1295, #1294, #1213, #1209, #1136, #1135, etc.)**:
   - *Vulnerabilidades*: Ejecución remota de código (RCE) mediante inyección de saltos de línea en `config_writer()`, inyección de comandos mediante opciones de git sin sanitizar en `Repo.archive()` / `Repo.clone()`, ReDoS en expresiones regulares de autor/committer, y path traversal en actualización de submódulos.
   - *Solución*: Actualizar a la versión más reciente y segura de `gitpython` (`>=3.1.44` o última release parchada) y restringir dependencias transitivas.
2. **`wheel` (Alertas #310, #282 - Alta Severidad)**:
   - *Vulnerabilidad*: `GHSA-c954-4h44-7894` — Modificación arbitraria de permisos de archivos mediante Path Traversal en `wheel unpack` en versiones `<= 0.45.1`.
   - *Solución*: En el nuevo ecosistema `uv`, `wheel` no es requerido como paquete directo del CLI, ya que `uv` gestiona ruedas y binarios nativamente; si se requiere para PyInstaller, fijar `wheel>=0.46.0` o superior vía `constraint-dependencies`.
3. **`setuptools` (Alertas #92, #979 - Alta y Media Severidad)**:
   - *Vulnerabilidad*: Path traversal en `PackageIndex.download` que permite escritura arbitraria de archivos.
   - *Solución*: Restringir versiones transitivas de setuptools mediante `constraint-dependencies` en `pyproject.toml` (`setuptools>=78.0.0`).
4. **`pytest` (Alertas #752, #627 - Media Severidad)**:
   - *Vulnerabilidad*: Manejo inseguro de directorios temporales `tmpdir`.
   - *Solución*: Actualizar a `pytest>=9.0.3` (versión alineada con `backend/fastapi-rest-tpl`).

### 3. Inconsistencias con las Reglas del Monorepo (`CLAUDE.md`, `.cursor`, `agents/shared/context/`)
1. **Unified CLI Facade (`docs/adr/0001-makefile-unified-cli-facade.md`)**:
   - `cli/Makefile` tiene hardcodeado `PLATFORM = linux/arm64/v8`. Esto viola `development-guidance.md` que establece que `PLATFORM` debe leerse de `.env.public` (con fallback a `.env`) y solo permite `linux/amd64 | linux/arm64 | linux/x86_64` (default `linux/amd64`).
   - Falta el target canónico `create-volumes` para inicializar el volumen nombrado de paquetes (`$(COMPOSE_PROJECT_NAME)-cli-packages`), provocando que comandos puedan fallar si el volumen no existe previamente.
   - Falta `docker-clean` para higiene de contenedores e imágenes huérfanas.
2. **Dockerfile sin optimización**:
   - Instala `pipenv` vía `pip` en tiempo de construcción, haciendo el proceso lento y pesado.
   - No utiliza las variables de entorno de alto rendimiento de `uv` (`UV_COMPILE_BYTECODE`, `UV_LINK_MODE=copy`, `UV_PROJECT_ENVIRONMENT`).
3. **Omisión en `.github/dependabot.yml`**:
   - El archivo `.github/dependabot.yml` monitorea `uv` en `backend/fastapi-rest-tpl`, pero no contiene entrada alguna para `cli/`. Al migrar a `uv`, debe registrarse para garantizar actualizaciones automáticas continuas.
4. **Desfase en `.github/workflows/pull_request_cli.yml`**:
   - El workflow de CI invoca comandos `docker run` y `docker build` ad-hoc de bajo nivel acoplados a Pipenv (`pipenv install --dev` y `pipenv run python -m pytest tests/`), violando el estándar del monorepo (Unified CLI Facade) donde CI debe orquestar los pasos ejecutando directamente los targets de Make (`make build-dev`, `make install-dependencies`, `make run-unit-tests`, `make build-prod`), como en `pull_request_backend.yml` y `pull_request_cm_components.yml`.

---

## Contract / Interface & Dockerfile Base

### 1. Especificación del `Dockerfile` (Basado en `backend/fastapi-rest-tpl`)
Tomando como base la estructura multi-stage y el uso de `uv` de `backend/fastapi-rest-tpl/Dockerfile`, adaptado a los requerimientos de `cli/` (que necesita `git` para `GitPython` y `binutils` para PyInstaller):

```dockerfile
# syntax=docker/dockerfile:1

FROM python:3.12-slim AS dev

# Copiar el binario oficial de uv de alta velocidad
COPY --from=ghcr.io/astral-sh/uv:0.12.9 /uv /uvx /bin/

# Instalar dependencias del sistema necesarias para git y pyinstaller
RUN apt-get update && apt-get install -y --no-install-recommends \
    binutils \
    git \
    && rm -rf /var/lib/apt/lists/*

ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONPATH=/app/src \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv

WORKDIR /app

FROM dev AS build

WORKDIR /app

COPY pyproject.toml /app/pyproject.toml
COPY uv.lock /app/uv.lock

# Sincronizar dependencias de producción
RUN uv sync --frozen --no-dev --no-install-project

FROM build AS prod

WORKDIR /app

COPY src /app/src

# Setear PATH para utilizar el entorno virtual
ENV PATH="/app/.venv/bin:$PATH"

# Construir ejecutable autocontenido con PyInstaller
RUN uv run pyinstaller --onefile --name=appdevexp src/main.py

VOLUME /app/dist

ENTRYPOINT ["/app/dist/appdevexp"]
```

### 2. Especificación de `cli/pyproject.toml`
Siguiendo el estándar PEP 621 y las convenciones vistas en `backend/fastapi-rest-tpl`:

```toml
[project]
name = "app-dev-exp-cli"
version = "0.2.0"
description = "Monorepo CLI for conventional commits and repository tools"
requires-python = ">=3.11"
authors = [
  { name = "Jose Sal y Rosas" }
]

dependencies = [
  "click>=8.1.8",
  "inquirer>=3.4.0",
  "gitpython>=3.1.44",
  "pyinstaller>=6.10.0",
  "macholib>=1.16.3; sys_platform == 'darwin'",
]

[dependency-groups]
dev = [
  "pytest>=9.0.3",
  "pytest-mock>=3.14.0",
]

[tool.uv]
package = false
constraint-dependencies = [
  "setuptools>=78.0.0",
  "wheel>=0.46.0",
]

[tool.pytest.ini_options]
testpaths = ["tests"]
pythonpath = ["src"]
```

### 3. Makefile Targets Actualizados (`cli/Makefile`)
Todos los comandos host `pipenv` se eliminan. El `Makefile` pasa a ser 100% fiel al Unified CLI Facade:

| Target | Acción ejecutada en contenedor |
|---|---|
| `make build-dev` | Construye la imagen de desarrollo (`$(COMPOSE_PROJECT_NAME)-cli-dev`) usando Docker buildx y `--platform $(PLATFORM)`. |
| `make build-prod` | Construye la imagen productiva con el binario PyInstaller compilado. |
| `make create-volumes` | Inicializa el volumen externo `$(COMPOSE_PROJECT_NAME)-cli-packages` si no existe. |
| `make install-dependencies` | Ejecuta `uv lock && uv sync --group dev` dentro del volumen del contenedor. |
| `make run-unit-tests` | Ejecuta `uv run pytest tests/` en el contenedor. |
| `make cli` | Ejecuta la CLI interactiva (`uv run python src/main.py`). |
| `make basic-commit m="..."` | Ejecuta `uv run python src/main.py commit -m $(m)`. Valida que `m` esté provisto. |
| `make interactive-commit` | Ejecuta `uv run python src/main.py commit` en modo interactivo. |
| `make build-local-package` | Compila el binario local `appdevexp` mediante `uv run pyinstaller --onefile --name=appdevexp src/main.py`. |
| `make docker-clean` | Detiene y remueve contenedores e imágenes huérfanas del CLI. |
| `make interactive` | Abre una terminal interactiva en el contenedor con el entorno virtual activado. |
| `make help` | Lista descriptiva auto-documentada de targets. |

---

## Implementation Steps

### Fase 1: Preparación y Creación de `pyproject.toml`
1. **Crear `cli/pyproject.toml`**:
   - Definir metadata del proyecto, dependencias actualizadas (`click`, `inquirer`, `gitpython`, `pyinstaller`, `macholib`), grupo `dev` (`pytest>=9.0.3`, `pytest-mock>=3.14.0`), y `constraint-dependencies` (`setuptools`, `wheel`).
2. **Actualizar `cli/.env.public`**:
   - Añadir `COMPOSE_PROJECT_NAME=app-dev-xp` y `PLATFORM=linux/amd64`.

### Fase 2: Actualización de `cli/Dockerfile` y `cli/Makefile`
1. **Actualizar `cli/Dockerfile`**:
   - Incorporar multi-stage `dev`, `build`, `prod`.
   - Incorporar `uv` desde `ghcr.io/astral-sh/uv:0.12.9`.
   - Configurar variables de entorno `UV_*` y `PYTHONPATH`.
2. **Actualizar `cli/Makefile`**:
   - Leer `PLATFORM` y `COMPOSE_PROJECT_NAME` desde `.env.public` con valores válidos.
   - Implementar `create-volumes`, `docker-clean`.
   - Reemplazar todas las llamadas `pipenv` por llamadas `uv` (`uv lock`, `uv sync`, `uv run`).
3. **Generar `cli/uv.lock`**:
   - Ejecutar `make create-volumes`.
   - Ejecutar `make build-dev`.
   - Ejecutar `make install-dependencies` para generar de manera determinista `cli/uv.lock` dentro del contenedor.
4. **Remover archivos obsoletos de Pipenv**:
   - Eliminar `cli/Pipfile` y `cli/Pipfile.lock`.

### Fase 3: Validación, Pruebas y Limpieza
1. **Ejecutar pruebas unitarias**:
   - `make run-unit-tests` para verificar que `pytest` y `pytest-mock` ejecutan limpiamente las pruebas bajo `uv`.
2. **Verificar compilación del binario**:
   - `make build-local-package` para comprobar que PyInstaller compila correctamente con `uv`.
3. **Verificar ejecución de comandos**:
   - `make cli` y dry-run de commits.
   - Revisar y corregir el código residual de prueba en el top-level de `cli/src/main.py` (líneas 8-12 que invocan `inquirer.prompt` al importar el script).

### Fase 4: Monitoreo de Dependabot y CI/CD
1. **Actualizar `.github/dependabot.yml`**:
   - Registrar la entrada para `/cli` con ecosistema `uv` y `docker`:
     ```yaml
     - package-ecosystem: "uv"
       directory: "/cli"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 5
       commit-message:
         prefix: "chore(deps)"
     - package-ecosystem: "docker"
       directory: "/cli"
       schedule:
         interval: "weekly"
       open-pull-requests-limit: 5
       commit-message:
         prefix: "chore(deps)"
     ```
2. **Actualizar `.github/workflows/pull_request_cli.yml` bajo el estándar de Make (Unified CLI Facade)**:
   - Siguiendo el estándar establecido en `pull_request_backend.yml` y `pull_request_cm_components.yml`:
     - Configurar `defaults.run.working-directory: ./cli`.
     - Eliminar comandos manuales `docker build` y `docker run` ad-hoc con volúmenes en línea e invocaciones directas de `pipenv`.
     - Ejecutar secuencialmente los targets estándar del `Makefile` de `cli/`:
       1. `make create-volumes`: asegura la inicialización del volumen de paquetes (`$(COMPOSE_PROJECT_NAME)-cli-packages`).
       2. `make build-dev`: construye la imagen de desarrollo con `uv`.
       3. `make install-dependencies`: sincroniza dependencias mediante `uv sync` en el volumen del contenedor.
       4. `make run-unit-tests`: ejecuta la suite de pruebas unitarias con `pytest` vía `uv run pytest`.
       5. `make build-prod`: construye y valida el empaquetado del binario de producción.
   - Definición propuesta del workflow `.github/workflows/pull_request_cli.yml`:
     ```yaml
     name: Run unit tests for cli

     permissions:
       contents: read

     on:
       pull_request:
         branches:
           - main
         paths:
           - cli/**

     env:
       PLATFORM: linux/amd64

     jobs:
       test:
         name: run unit tests for cli
         runs-on: ubuntu-24.04
         defaults:
           run:
             working-directory: ./cli

         steps:
           - uses: actions/checkout@v4
             with:
               fetch-depth: 2

           - name: Set up Docker Buildx
             uses: docker/setup-buildx-action@v2

           - name: Create volumes
             run: make create-volumes

           - name: Build container for development
             run: make build-dev

           - name: Install dependencies
             run: make install-dependencies

           - name: Run Unit Tests
             run: make run-unit-tests

           - name: Build container for production
             run: make build-prod
     ```

### Fase 5: Actualización de Documentación y Reglas
1. **Actualizar `cli/README.md`**:
   - Detallar el stack basado en `uv`, arquitectura de contenedores, guía de instalación y todos los Make targets disponibles.
2. **Actualizar `.cursor/rules/cli.mdc`**:
   - Reemplazar la mención a Pipenv por `uv` (`pyproject.toml` y `uv.lock`).

### Fase 6: Apertura del Pull Request
1. Crear la rama `cli/jose/refactor/migrate-pipfile-to-uv` (cumpliendo `docs/standards/branching.md`).
2. Abrir el Pull Request utilizando el template `.github/pull_request_template.md` (sin atribución de IA).

---

## Dependabot Remediation & Security Advisory Analysis

| Dependencia | Alerta Dependabot / CVE | Estado Anterior (`Pipfile`) | Estado Propuesto (`pyproject.toml` / `uv`) | Resultado de Seguridad |
|---|---|---|---|---|
| `GitPython` | #1353, #1352, #1351, #1350, #1349, #1348, #1295, #1294, #1213, #1209, #1136, #1135 | `==3.1.44` | `>=3.1.44` (con lockfile resuelto a la última versión segura) | Resuelve alertas de RCE, inyección de argumentos y ReDoS. |
| `wheel` | #310, #282 (`GHSA-c954-4h44-7894`) | `==0.45.1` (vulnerable a Path Traversal en `unpack`) | `wheel>=0.46.0` vía `constraint-dependencies` (o removido de paquetes de app) | Cierra vulnerabilidad de escritura de permisos arbitrarios. |
| `setuptools` | #92, #979 | Dependencia transitiva no restringida en `Pipfile.lock` | `setuptools>=78.0.0` restringido en `[tool.uv]` | Cierra vulnerabilidad de path traversal en descargas. |
| `pytest` | #752, #627 | `==8.3.5` (vulnerable en manejo de `tmpdir`) | `>=9.0.3` en `[dependency-groups.dev]` | Mitiga vulnerabilidad de directorios temporales, alineado con `fastapi-rest-tpl`. |

Al fusionar la eliminación de `Pipfile`/`Pipfile.lock` y la introducción de `uv.lock` con las versiones parchadas, GitHub cerrará automáticamente las alertas #310, #282, #92 y las relacionadas con `GitPython` en `cli/`.

---

## Pull Request Details

### Rama y Convención de Commits
- **Branch**: `cli/jose/refactor/migrate-pipfile-to-uv` (formato `component/user/type/task-name` según `docs/standards/branching.md`).
- **Commit Type**: `refactor(cli): migrate dependency management from pipfile to uv` (según `agents/shared/context/commit-conventions.md`).

### Cuerpo del Pull Request (Basado estrictamente en `.github/pull_request_template.md`)

```markdown
# App Developer Experience

## Project or Area

- MonoRepo
  - [x] App Developer Experience (ade)
  - [ ] Knowledge MCP (knowledge-mcp)
- Mobile App
  - [ ] React Native (whitewalker)
  - [ ] Expo (caraxes)
- Cloud
  - [ ] aws
  - [ ] azure
- Services Templates
  - [ ] FastApi template (fastapi-rest-tpl)
  - [ ] Nestjs REST template (nestjs-rest-tpl)
  - [ ] Nestjs BFF GQL (nestjs-gql-tpl)
- Conference Manager
  - [ ] conference-manager-tools (cm-tools)
  - [ ] ms-conference-webapp (cm-webapp)
  - [ ] ms-conference-admin (cm-admin)
  - [ ] ms-conference-api (cm-api)
  - [ ] status-aggregator (status-aggregator)

## Issue ticket number and link

docs/plans/Gemini_20261012-cli-pipfile-to-uv-migration.md
Supersedes Dependabot alerts #310, #282, #92, #1353, #1352, #1351, #1350, #1349, #1348 for cli dependencies (wheel, setuptools, GitPython, pytest).

## Checklist before requesting a review

- [x] I have performed a self-review of my code
- [x] If it is a core feature, I have added thorough tests.
- [ ] Do we need to implement analytics?
- [ ] Will this be part of a product update? If yes, please write one phrase about this update.

## Pull request type

Please check the type of change your PR introduces:

- [ ] :sparkles: Feature
- [ ] :bug: Bugfix
- [ ] :pencil2: Fixing typos
- [ ] :lipstick: :art: Code style update (formatting, renaming)
- [x] :recycle: Refactoring (no functional changes, no api changes)
- [ ] :zap: Performance
- [x] :pencil: Documentation content changes
- [x] :white_check_mark: Unit testing
- [ ] :ok_hand: Updating due to code review suggest
- [ ] :rocket: Release: v
- [x] :wrench: Add or update configuration files
- [x] :hammer: Add or update development scripts
- [ ] :bricks: Infrastructure related changes

## What is the current module?

• cli (appdevexp monorepo CLI)

## What is the new behavior?

• Migrated dependency management from Pipenv (Pipfile, Pipfile.lock) to uv (pyproject.toml, uv.lock).
• Updated Dockerfile based on backend/fastapi-rest-tpl multi-stage architecture with high-speed uv binary.
• Aligned Makefile targets with the Unified CLI Facade: added create-volumes, docker-clean, and replaced pipenv with uv run/sync.
• Resolved PLATFORM and COMPOSE_PROJECT_NAME variables via .env.public conforming to monorepo platform guidelines.
• Remediated open Dependabot alerts for wheel (GHSA-c954-4h44-7894), setuptools, GitPython, and updated pytest to >= 9.0.3.
• Configured .github/dependabot.yml to monitor uv and docker ecosystems for /cli.
• Updated CI pipeline in .github/workflows/pull_request_cli.yml to execute Make targets (create-volumes, build-dev, install-dependencies, run-unit-tests, build-prod) following the Unified CLI Facade standard.
• Updated cli/README.md and .cursor/rules/cli.mdc documentation.

## Does this introduce a breaking change?

- [ ] Yes
- [x] No

## Screenshots

N/A - CLI and configuration refactor.
```

---

## Risks & Mitigations

| Riesgo | Impacto | Mitigación |
|---|---|---|
| Incompatibilidad de `pyinstaller` con `uv` | Medio: el empaquetado del binario único podría requerir opciones o paquetes específicos en el entorno virtual. | `uv` genera un entorno virtual estándar en `/app/.venv`; PyInstaller funciona transparentemente ejecutando `uv run pyinstaller`. Se valida explícitamente en la Fase 3 con `make build-local-package`. |
| Arquitectura multiplataforma (ARM64 vs AMD64) | Medio: binarios compilados en Apple Silicon podrían diferir de CI/Linux. | Se estandariza `PLATFORM=linux/amd64` por defecto en `.env.public` para paridad con CI, permitiendo `linux/arm64` localmente mediante Makefile/Docker buildx. |
| Dependencias transitivas no parchadas de `GitPython` | Bajo: que alguna vulnerabilidad persista en submódulos de GitPython. | Se fija `constraint-dependencies` en `pyproject.toml` y se utiliza la versión más reciente del paquete. |

---

## Acceptance Criteria
- [ ] `cli/Pipfile` y `cli/Pipfile.lock` eliminados; `cli/pyproject.toml` y `cli/uv.lock` creados y válidos.
- [ ] `cli/Dockerfile` modernizado siguiendo la arquitectura multi-stage de `backend/fastapi-rest-tpl`.
- [ ] `make build-dev` compila limpiamente la imagen sin advertencias de Pipenv ni fallas de dependencias.
- [ ] `make create-volumes` y `make install-dependencies` instalan los paquetes en el volumen contenedor vía `uv sync`.
- [ ] `make run-unit-tests` ejecuta todas las pruebas unitarias satisfactoriamente (`pytest>=9.0.3`).
- [ ] `make build-local-package` genera el binario distribuible con éxito.
- [ ] `.cursor/rules/cli.mdc` y `cli/README.md` reflejan el nuevo tooling (`uv`) y los comandos actualizados.
- [ ] `.github/dependabot.yml` contiene la configuración de monitoreo para `/cli`.
- [ ] `.github/workflows/pull_request_cli.yml` estandarizado para ejecutar targets de Make (`make create-volumes`, `make build-dev`, `make install-dependencies`, `make run-unit-tests`, `make build-prod`) alineado con `pull_request_backend.yml` y `pull_request_cm_components.yml`.
- [ ] Pull request preparado con la plantilla oficial y sin atribuciones de IA.

---

## Impacted Consumers
- Desarrolladores del monorepo que utilizan `make basic-commit` o `make interactive-commit` desde `cli/`.
- CI/CD (`.github/workflows/pull_request_cli.yml`): se beneficia de tiempos de compilación e instalación significativamente más rápidos gracias a `uv`.
- Seguridad y gobernanza del repositorio: resolución de más de 10 alertas de vulnerabilidades registradas en Dependabot.
