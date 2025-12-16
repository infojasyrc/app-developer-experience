# AGENTS.md

## Project Context
This is a **monorepo** designed to consolidate best practices for Software Development Life Cycle.
This project called "App Developer Experience" contains:
1.  **Templates:** Reusable code starters for Microservices (FastAPI, NestJS Rest and GraphQL) and Mobile Apps (React Native and Expo).
2.  **Use Case (Conference Manager):** A platform to handle conferences/events information.
3.  **Infrastructure:** Terraform code for managing cloud resources (AWS).
4.  **CLI:** A Python-based CLI tool for project management.

## Monorepo Structure
- `backend/` - Microservice templates (NestJS Rest & NestJS GraphQL & FastAPI).
- `mobile-app/` - Mobile application templates (React Native/Expo).
- `conference-manager/` - The main reference project (Microservices + Webapp + Admin).
- `cloud/` - Infrastructure as Code (Terraform).
- `cli/` - Python CLI tool.
- `devops/` - CI/CD pipelines.
- `docs/` - Documentation.

---

## Tech Stack & Conventions

### Templates

#### 1. Nodejs Rest API (`backend/ms-nestjs-rest-tpl/`)
- **Framework:**
    - **NestJS:** TypeScript, REST.
- **Conventions (NestJS):**
    - Follow strict Modular architecture (Controllers, Services, Modules).
    - Use DTOs with strict typing for all requests/responses.
    - Use standard NestJS decorators (`@Controller`, `@Get`, `@Post`).

#### 2. Nodejs GraphQL API (`backend/ms-nestjs-gql-tpl/`)
- **Framework:**
    - **NestJS:** TypeScript, GraphQL.
- **Conventions (NestJS):**
    - Follow strict Modular architecture (Controllers, Services, Modules).
    - Use DTOs with strict typing for all requests/responses.
    - Use standard NestJS decorators (`@Controller`).

#### 3. Python Rest API (`backend/ms-fastapi-rest-tpl/`)
- **Framework:**
    - **FastAPI:** Python.
- **Conventions (FastAPI):**
    - Use Pydantic models for data validation.
    - Use Type hints strictly.
    - Follow PEP 8 style guidelines.

#### 4. Mobile App with React Native (`mobile-app/whitewalker`)
- **Framework:** React Native.
- **Language:** TypeScript.
- **Navigation:** React Navigation.
- **Conventions:**
    - Use functional components.
    - Keep screens in `app/screens` and reusable components in `app/components`.
    - Use strict typing for navigation params.

#### 5. Mobile App with Expo (`mobile-app/whitewolf-rn`)
- **Framework:** React Native with Expo.
- **Language:** TypeScript.
- **Navigation:** React Navigation.
- **Conventions:**
    - Use functional components.
    - Keep screens in `app/screens` and reusable components in `app/components`.
    - Use strict typing for navigation params.

### Use Case: Conference Manager

#### 1. Web Frontend (`conference-manager/ms-conference-webapp`)
- **Framework:** Next.js (App Router `src/app`).
- **Language:** TypeScript.
- **Styling:** Tailwind CSS (preferred), CSS Modules.
- **State Management:** React Context / Hooks.
- **Testing:** Vitest / Jest.
- **Conventions:**
    - Use Functional Components.
    - Use Atomic Design principles.
    - Place reusable UI components in `src/components`.
    - Use `src/app` for routing (Next.js 14+ standards).

#### 2. Backend API (`backend/`, `conference-manager/ms-conference-api`)
- **Frameworks:**
    - **NestJS:** TypeScript, REST.
- **Conventions (NestJS):**
    - Follow strict Modular architecture (Controllers, Services, Modules).
    - Use DTOs with strict typing for all requests/responses.
    - Use standard NestJS decorators (`@Controller`, `@Get`, `@Post`).

#### 3. Admin Panel (`conference-manager/ms-conference-admin`)
- **Framework:** Django (Python).
- **Conventions:**
    - Standard Django MVT pattern.
    - Use `manage.py` for administrative tasks.

#### 4. Infrastructure (`cloud/`)
- **Tool:** Terraform.
- **Cloud Provider:** AWS.
- **Conventions:**
    - Keep state management configuration isolated.
    - Use modules for reusable infrastructure components (Network, Compute, DB).

---

## Code Quality & Rules
- **Commits:** Follow **Conventional Commits** (e.g., `feat: add new login screen`, `fix: update user schema`).
- **Linting:**
    - **JS/TS:** ESLint + Prettier.
    - **Python:** Black + Isort + Flake8.
- **Secrets:** NEVER commit `.env` files. Use `.env.public` for defaults/examples.
- **Documentation:** Update `README.md` in the specific sub-folder when adding new features or changing architecture.

## Common Commands

### Root
- **Install All Dependencies:** (Check `Makefile` or root `package.json` if available, otherwise install per folder).

### Web App (`conference-manager/ms-conference-webapp`)
- `npm run dev`: Start development server.
- `npm run build`: Build for production.
- `npm run test`: Run tests.

### Backend (NestJS)
- `npm run start:dev`: Start in watch mode.
- `npm run test`: Run unit tests.

### Backend (FastAPI / Python)
- `pipenv install`: Install dependencies.
- `uvicorn src.main:app --reload`: Run dev server (verify entry point).

### Mobile
- `npm start`: Start Expo bundler.
- `npm run android` / `npm run ios`: Launch on simulator.
