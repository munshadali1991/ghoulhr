# Frontend Documentation

## Overview

The GhoulHR frontend is a React 19 + Vite 7 SPA for multi-tenant HR workflows.

It supports:

- Role-based login (`admin` and `employee` modes)
- Super admin organization management
- Org admin dashboard with employee management and settings
- Employee dashboard experience
- HR onboarding wizard (multi-step, draft-save, validation)

## Stack

- React 19
- Vite 7
- React Router DOM 7
- MUI 7 + Emotion
- React Hook Form 7
- TanStack React Query 5
- Zod 4

## Source layout

```text
src/
├── main.jsx                 # Entry: BrowserRouter + App
├── index.css
├── app/                     # Application shell
│   ├── App.jsx
│   ├── queryClient.js
│   ├── constants.js
│   ├── config/appConfig.js
│   ├── providers/           # AppProviders, AuthProvider
│   └── routes/              # AppRoutes, PublicRoutes, SuperAdminRoutes, OrgAdminRoutes
├── shared/                  # Cross-feature reusables
│   ├── api/httpClient.js
│   ├── components/ui|feedback|forms|layout|settings/
│   ├── hooks/               # useAppSnackbar, useMobileDrawer
│   ├── theme/
│   └── utils/               # session, tenant, timestamps, shiftTime, uuid
├── features/
│   ├── auth/
│   ├── super-admin/
│   ├── org-admin/           # config/orgAdminNav.jsx, layouts, pages
│   ├── employees/           # list + onboarding/
│   ├── employee-portal/
│   └── settings/            # HR settings umbrella
│       ├── shell/           # SettingsPage, nav, DraftStatusBar
│       ├── shared/          # CRUD primitives (RecordFormLayout, CrudDataTable, …)
│       ├── api/settingsApi.js
│       ├── organization/
│       ├── employees/
│       ├── org-structure/
│       ├── locations/
│       ├── leave/
│       └── attendance/
└── assets/
```

Path alias: `@/` → `src/` (see `vite.config.js`).

## Entry and providers

- `src/main.jsx` mounts `App` inside `BrowserRouter`.
- `src/app/App.jsx` wraps the app in `AppProviders` → `AuthProvider` → `AppRoutes`.

## Authentication

Auth is cookie-based (HttpOnly), not client token storage.

- `features/auth/api/authApi.js` — login, session, refresh, logout
- `shared/api/httpClient.js` — `credentials: 'include'`, one-time refresh on 401
- `shared/utils/session.js` — clears legacy localStorage session artifacts
- `features/auth/utils/userRoles.js` — role helpers used by `AuthProvider`

## Routing (`app/routes/AppRoutes.jsx`)

Rendered dashboard is role-derived from the server session user:

| Role / condition | UI |
|------------------|-----|
| `SUPER_ADMIN` | `SuperAdminRoutes` → `DashboardLayout` + overview / organizations |
| Employee tenant user | `EmployeeDashboard` |
| Other authenticated (org admin) | `OrgAdminRoutes` → `OrgAdminLayout` + nested routes |
| Unauthenticated | `PublicRoutes` → `/login` |

### Super admin routes

- `/dashboard` → `OverviewPage`
- `/organizations` → `OrganizationsPage`
- `/organizations/new`, `/organizations/:id/edit` → `OrganizationFormPage`

### Org admin routes (`OrgAdminRoutes.jsx`)

`OrgAdminLayout` renders an `<Outlet>` for child routes. Navigation is driven by `features/org-admin/config/orgAdminNav.jsx` (single source of truth for sidebar items).

| Path | Page |
|------|------|
| `/dashboard` | `OrgAdminHome` (overview) |
| `/employees` | `EmployeesPage` |
| `/settings/*` | `SettingsPage` (tab slug from URL) |
| `/attendance` | `ModulePlaceholderPage` |
| `/payroll` | `ModulePlaceholderPage` |
| `/tracking` | `ModulePlaceholderPage` |
| `*` | redirect → `/dashboard` |

**Adding a new org-admin module:** add an entry in `orgAdminNav.jsx`, add a `<Route>` in `OrgAdminRoutes.jsx`, and implement the feature under `features/<module>/`. No layout section state is required.

Settings submenu children come from `features/settings/shell/settingsNav.js`; the settings nav item uses `expandPathPrefix: '/settings'` so the submenu opens automatically on settings URLs.

## Settings domain

- Shell: `features/settings/shell/SettingsPage.jsx` + `settingsNav.js`
- Shared settings UI (cross-tab): `shared/components/settings/` (`SettingsField`, `SettingsSection`, layout tokens in `settingsLayout.js`)
- Settings CRUD primitives: `features/settings/shared/` (`RecordFormLayout`, `CrudDataTable`, `ConfirmDeleteDialog`, `EmptyState`)
- Orchestration-only shell UI: `DraftStatusBar.jsx`
- API: `features/settings/api/settingsApi.js` (sends `x-org-id` for tenant-scoped endpoints)
- Tabs under `features/settings/{organization,employees,org-structure,locations,leave,attendance}/`

Each settings tab exposes a small public API via `index.js`. Cross-tab hooks (e.g. `useLocationConfigurations`) must be imported from sibling tab barrels such as `@/features/settings/locations`, not deep hook paths.

Attendance time helpers live in `shared/utils/shiftTime.js` (used by shared form controls and attendance settings).

## Employees

- `features/employees/pages/EmployeesPage.jsx` — list, search, onboarding entry
- `features/employees/onboarding/EmployeeOnboardingWizard.jsx` — 7-step HR onboarding
- `features/employees/api/employeesApi.js`

## Multi-tenant behavior

- `app/config/appConfig.js` — API base URL from subdomain when possible
- `shared/utils/tenant.js` — tenant redirect after login
- Non–super-admin users may be redirected to the tenant subdomain when needed

## Environment variables

- `VITE_API_BASE_URL` — fallback when subdomain-based URL cannot be derived
- `VITE_BOOTSTRAP_ADMIN_KEY` — bootstrap login endpoint (if used)

## Scripts

From `frontend/ghoulhr/package.json`:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Feature module convention

Each feature under `features/` should expose a small public API via `index.js` and keep internals colocated:

```text
{feature}/
  index.js
  pages/ | layouts/
  components/
  hooks/
  api/
  utils/
  constants.js
```

## Import boundary rules (ESLint)

`eslint.config.js` enforces `import/no-restricted-paths` zones:

| Zone | Rule |
|------|------|
| `src/shared/**` | Must not import from `src/features/**` |
| `src/features/{auth,super-admin,org-admin,employees,employee-portal,settings}/**` | Must not import from other top-level features (except documented cross-feature paths for org-admin → employees/settings and employees → settings/employees) |
| `src/features/settings/<tab>/**` | May import `@/shared/**`, settings `shared/`, `shell/`, `api/`, own tab, and sibling tab folders listed per tab (barrel imports) |

Prefer `@/shared/*`, `@/app/*`, and feature or tab `index.js` barrels over deep relative paths.

## Verification

After structural changes:

```bash
npm run build
npm run lint
```

Manual smoke checks (org admin):

- Login as org admin → `/dashboard`, `/employees`, `/settings/organization`
- Placeholder routes: `/attendance`, `/payroll`, `/tracking`
- Settings submenu expands on `/settings/*` paths
