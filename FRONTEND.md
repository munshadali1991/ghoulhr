# Frontend Documentation

## Overview

The GhoulHR frontend is a React 19 + Vite 7 SPA for multi-tenant HR workflows.

It currently supports:
- role-based login (`admin` and `employee` modes)
- super admin organization management
- org admin dashboard with employee management + settings
- employee dashboard experience
- HR onboarding wizard (multi-step, draft-save, validation)

## Stack

- React 19
- Vite 7
- React Router DOM 7
- MUI 7 + Emotion
- React Hook Form 7
- TanStack React Query 5
- Zod 4

## Current Architecture

### Entry and Providers

- `src/main.jsx` mounts `App` inside `BrowserRouter`.
- `src/App.jsx` wraps the app in:
  - `QueryClientProvider`
  - `ThemeProvider`
  - `CssBaseline`

### Authentication Model (Current)

Auth is now cookie-based (HttpOnly), not client token storage.

- `src/services/authApi.js`
  - `loginRequest()`
  - `employeeLoginRequest()`
  - `bootstrapSuperAdminRequest()`
  - `fetchSessionUser()` via `/auth/session`
  - refresh fallback via `/auth/refresh`
  - `logoutRequest()`
- `src/services/httpClient.js`
  - all API calls use `credentials: 'include'`
  - automatic one-time refresh/retry on 401 (except public auth paths)
- `src/utils/session.js`
  - legacy local storage session removed
  - `readSession()` clears old URL/localStorage session artifacts

### Role Routing in `App.jsx`

Rendered dashboard is role-derived from server session user:

- `SUPER_ADMIN` -> `DashboardLayout` with routed pages:
  - `/dashboard` -> `OverviewPage`
  - `/organizations` -> `OrganizationsPage`
  - `/organizations/new` -> `OrganizationFormPage`
  - `/organizations/:id/edit` -> `OrganizationFormPage`
- employee-style users (`EMPLOYEE`, `MANAGER`, or `ORG_ADMIN` with `employeeCode`) -> `EmployeeDashboard`
- other authenticated users (typically org admin system users) -> `OrgDashboardPage` -> `OrgAdminDashboard`
- unauthenticated -> login route only (`/login`)

## Key Modules

### Super Admin

- `src/pages/OverviewPage.jsx`: aggregate stats + growth view.
- `src/pages/OrganizationsPage.jsx`: active + deleted organizations, search, delete/restore.
- `src/pages/OrganizationFormPage.jsx`: create/edit organization.
- Data is loaded in `App.jsx` using `Promise.all` and stored in component state.

### Org Admin

- `src/pages/OrgAdminDashboard.jsx`
  - overview cards and quick actions
  - internal section switch for:
    - overview
    - employees -> `EmployeesPage`
    - settings -> `SettingsPage`
    - attendance/payroll/organization placeholders
  - only `overview` and `settings` are URL-backed (`/dashboard`, `/settings`); others are in-component section state.

### Employee Management + Onboarding

- `src/pages/EmployeesPage.jsx`
  - employee list + search
  - "Add Employee" launches `EmployeeOnboardingWizard`
  - success dialog surfaces generated credentials
- `src/features/employee-onboarding/EmployeeOnboardingWizard.jsx`
  - 7-step workflow
  - step validation + full-form validation using Zod
  - duplicate checks via `/employees/check-duplicate`
  - local draft save/restore hooks
  - final submit to `/employees/hr-onboarding`

### Settings

- `src/pages/SettingsPage.jsx`
  - tabs: Organization, Employees, Attendance
  - draft/publish/discard UX for org settings
- hooks:
  - `src/hooks/useSettings.js`
  - `src/hooks/useEmployeeSettings.js`
  - `src/hooks/useAttendanceSettings.js`
- services:
  - `src/services/settingsApi.js`
  - sends `x-org-id` header for tenant-scoped settings endpoints

## Services Layer

### Shared HTTP Client

- `src/services/httpClient.js` is the common request layer for most authenticated APIs.
- Handles:
  - JSON parsing
  - normalized error message extraction
  - 401 refresh + retry once

### Main API Files

- `src/services/authApi.js`: auth/session lifecycle
- `src/services/organizationsApi.js`: super admin org CRUD + stats
- `src/services/employeesApi.js`: employee list/create/reset + HR onboarding + duplicate checks
- `src/services/settingsApi.js`: profile/employee/attendance settings
- `src/services/orgAdminApi.js`: present but not the primary path used by current dashboard UI

## Multi-Tenant Behavior

- `src/config/appConfig.js`
  - computes API base URL from current subdomain where possible
  - local subdomains route to `http://{subdomain}.localhost:8080`
- `src/utils/tenant.js`
  - computes redirect URL for tenant subdomain after login
- `App.jsx`
  - non-super-admin users are redirected to tenant subdomain when needed

## Important Current-State Notes

- No longer using bearer token from local storage for API calls.
- Session bootstrap still depends on `VITE_BOOTSTRAP_ADMIN_KEY` in frontend env for fallback flow.
- `src/router/AppRouter.tsx` exists but `App.jsx` is the active routing implementation.
- `src/pages/DashboardPage.jsx` appears legacy and is not used in current main routing path.

## Environment Variables

- `VITE_API_BASE_URL` (fallback when subdomain-based URL cannot be derived)
- `VITE_BOOTSTRAP_ADMIN_KEY` (used by bootstrap login endpoint)

## Scripts

From `frontend/ghoulhr/package.json`:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`

## Suggested Follow-ups

- move org admin section navigation fully to route-based navigation (employees/settings/attendance/payroll)
- consider migrating super admin org data loading to React Query for consistency
- remove bootstrap key dependency from client if backend flow can fully own bootstrap security
