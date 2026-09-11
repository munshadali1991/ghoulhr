# Frontend Documentation

Handbook for the peopleAIQ (GhoulHR) React SPA. It describes **wired** behavior: what `AppRoutes` mounts, which nav is live, which APIs are called, and which files are leftover.

## Overview

The frontend is a React 19 + Vite 7 single-page app for multi-tenant HRMS.

Product UI name: **peopleAIQ** (`APP_NAME` / `APP_BRAND_INITIALS` in `src/app/config/appConfig.js`).

Three live surfaces:


| Surface      | Who                            | Shell                                                                                                              |
| ------------ | ------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| Public login | Unauthenticated                | `PublicRoutes` — tenant login at `/`, super-admin login at `/admin-cp`                                             |
| Super admin  | `SUPER_ADMIN` session          | `SuperAdminRoutes` + `DashboardLayout`                                                                             |
| Tenant       | Every other authenticated user | `TenantRoutes` + `TenantLayout` — ESS and HR in **one** sidebar, filtered by entitled modules and permission codes |


There is **no** live role split between org-admin and employee dashboards. A tenant user with both ESS and HR permissions sees both dashboards as children of a Dashboard nav group. Forced password change (`user.mustChangePassword`) blocks the tenant shell until `/change-password` succeeds.

## Stack


| Layer                   | Package                                         |
| ----------------------- | ----------------------------------------------- |
| UI runtime              | React 19, React DOM 19                          |
| Bundler                 | Vite 7 (`@vitejs/plugin-react`)                 |
| Routing                 | React Router DOM 7                              |
| Components              | MUI 7, Emotion, MUI Icons, MUI X Date Pickers 9 |
| Forms / validation      | React Hook Form 7, `@hookform/resolvers`, Zod 4 |
| Server state            | TanStack React Query 5                          |
| Dates / charts / export | Dayjs, Recharts, xlsx                           |


Tests: Vitest 3 + Testing Library + jsdom (`src/**/*.test.js(x)`, setup `src/test/setup.js`).

Path alias: `@/` → `src/` (`vite.config.js`). Dev server port **5173**, `host: true`, tenant hosts such as `*.localhost` allowed. Vite `base` is `/staging/` in staging mode, `/` otherwise.

## Source layout

```text
src/
├── main.jsx                 # BrowserRouter + App
├── index.css
├── test/                    # Vitest setup
├── app/
│   ├── App.jsx              # AppProviders → AuthProvider → AppRoutes
│   ├── queryClient.js
│   ├── constants.js         # ADMIN_CP_PATH, TENANT_EMPLOYEE_ROLES, empty SA stats
│   ├── config/appConfig.js  # API base URL, brand, bootstrap key
│   ├── providers/           # AppProviders, AuthProvider, useAuth, authContext
│   └── routes/
│       ├── AppRoutes.jsx          # LIVE router switch
│       ├── PublicRoutes.jsx       # LIVE
│       ├── SuperAdminRoutes.jsx   # LIVE
│       ├── TenantRoutes.jsx       # LIVE unified tenant shell
│       └── OrgAdminRoutes.jsx     # ORPHANED (not imported by AppRoutes)
├── shared/
│   ├── api/                 # httpClient.js, storageApi.js
│   ├── components/          # data | feedback | forms | layout | settings | ui
│   ├── constants/           # platformModules.js
│   ├── hooks/               # useAppSnackbar, useMobileDrawer, useIsMobileLayout
│   ├── theme/
│   └── utils/               # session, tenant, timestamps, shiftTime, uuid
├── features/
│   ├── auth/
│   ├── super-admin/
│   ├── tenant/              # LIVE layout + nav + dashboard adapters
│   ├── org-admin/           # HR home widgets + Coming Soon page; layout unused
│   ├── employees/           # directory, onboarding, reporting managers
│   ├── employee-portal/     # ESS pages (home, leave, attendance + regularization, timesheet, skills)
│   ├── approvals/           # leave + attendance regularization + timesheet approvals (no index.js)
│   ├── settings/            # HR configuration umbrella
│   │   ├── api/settingsApi.js
│   │   ├── shell/           # SettingsShell, nav, route config, guards, mapper
│   │   ├── shared/          # RecordFormLayout, CrudDataTable, …
│   │   ├── organization/    # profile + calendar
│   │   ├── employees/
│   │   ├── org-structure/   # departments + designations
│   │   ├── locations/
│   │   ├── leave/
│   │   ├── attendance/      # shifts | schedule | check-in
│   │   ├── timesheet/       # general + category
│   │   ├── performance/     # performance master / builder
│   │   └── skills/          # categories | subcategories | skills
│   ├── rbac/                # settings/rbac UI (no index.js)
│   ├── skill-search/
│   ├── performance/         # ESS/HR assessment runtime (not settings)
│   └── document-centre/
└── assets/
```

There are **no** top-level `features/attendance`, `features/payroll`, or `features/tracking` modules. Payroll is a placeholder route. Tracking is a platform entitlement / ESS widget key only.

## Entry, providers, HTTP, tenancy



### Boot

1. `src/main.jsx` mounts `App` inside `BrowserRouter`.
2. `src/app/App.jsx` wraps `AppProviders` → `AuthProvider` → `AppRoutes`.
3. `AppProviders` supplies MUI theme, React Query, snackbar, date pickers.
4. `AuthProvider` loads `/auth/session` (refresh on 401), optional handoff consume, session expiry, logout.

Session payload used by the UI: `user`, `entitledModules`, `permissions`, `roles`, `sessionExpiresAt`. Auth is **cookie-based** (HttpOnly). Do not store access tokens in `localStorage`. `shared/utils/session.js` clears leftover client session artifacts.

### HTTP

`shared/api/httpClient.js` (`apiFetch`):

- Prefixes `getApiBaseUrl()`.
- `credentials: 'include'`.
- JSON `Content-Type` unless body is `FormData`.
- On **401**, one shared `/auth/refresh` then retry (skipped for public auth paths).
- Failed refresh dispatches session-expired so `AuthProvider` logs out.

`shared/api/storageApi.js` is for file/blob storage helpers used by uploads/previews.

### API base URL (`app/config/appConfig.js`)

Resolved per request:


| Host                                   | Base URL                                       |
| -------------------------------------- | ---------------------------------------------- |
| `*.localhost` (not bare localhost)     | `http://{subdomain}.localhost:8080`            |
| `localhost` / `127.0.0.1`              | `VITE_API_BASE_URL` or `http://localhost:8080` |
| Deployed host with `VITE_API_BASE_URL` | that value (trailing slash stripped)           |
| Else                                   | `{origin}` + API path                          |


API path (`resolveApiPath`): staging runtime defaults to `/staging/api/v1`; production defaults to `/ghoulhrms/api/v1`. Staging/production Vite modes may override with `VITE_API_PATH`. Staging detection: `import.meta.env.MODE === 'staging'`, Vite `BASE_URL` containing `staging`, or a `/staging` path segment (`shared/utils/tenant.js`).

After login, non–super-admin users may be redirected onto the tenant subdomain (`shared/utils/tenant.js`, `VITE_APP_BASE_PATH` for app base). Handoff codes complete sign-in on the org host (`/auth/handoff/consume`).

## Routing (`app/routes/AppRoutes.jsx`)

While `isInitializing`, a full-viewport spinner is shown.

```text
SUPER_ADMIN  → SuperAdminRoutes
authenticated + mustChangePassword → only /change-password
authenticated → TenantRoutes (inside RequirePasswordChanged)
else → PublicRoutes
```

Unknown tenant paths redirect to `getDefaultDashboardPath(session)` (`/home` if ESS is allowed, else `/dashboard` if HR is allowed, else `/home`).

### Public routes (`PublicRoutes.jsx`)


| Path                          | Page                                        |
| ----------------------------- | ------------------------------------------- |
| `/`                           | Tenant login (`useLoginForm('tenant')`)     |
| `/login`                      | Redirect → `/`                              |
| `/admin-cp` (`ADMIN_CP_PATH`) | Super-admin login (`useLoginForm('admin')`) |
| `*`                           | Redirect → `/`                              |




### Super admin routes (`SuperAdminRoutes.jsx`)

Nav source of truth: `features/super-admin/config/superAdminNav.jsx`.


| Path                      | Page                    | Purpose                                                    |
| ------------------------- | ----------------------- | ---------------------------------------------------------- |
| `/dashboard`              | `OverviewPage`          | Org counts, growth stats from `useSuperAdminOrganizations` |
| `/organizations`          | `OrganizationsPage`     | List, search, soft-delete, restore                         |
| `/organizations/new`      | `OrganizationFormPage`  | Create org + subscription/modules                          |
| `/organizations/:id/edit` | `OrganizationFormPage`  | Edit org + subscription                                    |
| `/leads`                  | `LeadsPage`             | Platform leads inbox                                       |
| `*`                       | Redirect → `/dashboard` |                                                            |


APIs: `/organizations*`, `/organizations/stats`, `/organizations/id/:id/subscription*`, `/leads`.

### Tenant routes (`TenantRoutes.jsx`)

Layout: `TenantLayout` (sidebar from `buildTenantNavItems`). Settings routes are injected by `settingsFlatRoutes(organizationId)`.

Guards:

- `DashboardRouteGuard` — dashboard key `ess` or `hr`.
- `RequireAccess` — `entitledModules` + permission (or `permissions` with `any`/`all`).
- `SettingsRouteGuard` — settings slug from URL vs `accessRegistry`.



#### Dashboards


| Path         | Guard                | Page                                         | Purpose                                                                    |
| ------------ | -------------------- | -------------------------------------------- | -------------------------------------------------------------------------- |
| `/home`      | `dashboardKey="ess"` | `EmployeeHomePage`                           | ESS home: punch, leave, timesheet, who-is-in, team-on-leave, notifications |
| `/dashboard` | `dashboardKey="hr"`  | `TenantAdminDashboardPage` → `OrgAdminHome`  | HR tiles from `GET /dashboard/hr`                                          |
| `/`          | —                    | Navigate to `getDefaultLandingPath(session)` | Same as default dashboard                                                  |




#### Leave (ESS + approvals)


| Path                                    | Module            | Permission                                                                      | Page                         | Status                                                                       |
| --------------------------------------- | ----------------- | ------------------------------------------------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------- |
| `/leave/apply`                          | leave             | `ess.leave:apply`                                                               | `LeaveApplyPage`             | Live `/ess/leave/*`                                                          |
| `/leave/balances`                       | leave             | `ess.leave:read`                                                                | `LeaveBalancesPage`          | Live                                                                         |
| `/leave/balances/:leaveConfigurationId` | leave             | `ess.leave:read`                                                                | `LeaveBalanceDetailPage`     | Live                                                                         |
| `/leave/calendar`                       | leave             | `ess.leave:read`                                                                | `LeaveCalendarPage`          | Live                                                                         |
| `/leave/holidays`                       | leave             | `ess.leave:read`                                                                | `HolidayCalendarPage`        | Live `/ess/holidays`                                                         |
| `/leave/team-on-leave`                  | leave             | `dashboard.ess.team-on-leave:read`                                              | `TeamOnLeavePage`            | Live                                                                         |
| `/leave/requests`                       | leave / approvals | `approvals.leave:read` **or** `approvals.attendance:read` (`RequireAccess` any) | `LeaveRequestsPage`          | Live `/ess/approvals/leave`* and `/ess/approvals/attendance-regularization*` |
| `/approvals/leave`                      | —                 | —                                                                               | Redirect → `/leave/requests` |                                                                              |


`LeaveRequestsPage` uses `SegmentedTabs`: **Leave Requests** (`approvals.leave:read`) and **Regularization Requests** (`?tab=regularization`, `approvals.attendance:read`). Each tab is shown only if the user `can` the matching read permission. Regularization pane: list + detail (employee, work date, requested in/out, reason, current punches if any) + approve/reject (`approvals.attendance:act`). Sidebar child **Leave Requests** is visible if either permission is present (`tenantNav.jsx`).

#### Attendance


| Path                    | Module     | Permission                     | Page                   | Status                                                                            |
| ----------------------- | ---------- | ------------------------------ | ---------------------- | --------------------------------------------------------------------------------- |
| `/attendance`           | attendance | (module only)                  | `TenantAttendancePage` | If `ess.attendance:read` → `AttendanceInfoPage`; else **Coming Soon** placeholder |
| `/attendance/who-is-in` | attendance | `dashboard.ess.who-is-in:read` | `WhoIsInPage`          | Live `/ess/attendance/who-is-in`                                                  |
| `/attendance/swipes`    | attendance | `ess.attendance.swipes:read`   | `EmployeeSwipesPage`   | Live `/ess/attendance/swipes`                                                     |


There is **no** HR attendance admin UI beyond settings. Users with attendance entitlement but without ESS read see the placeholder.

`AttendanceInfoPage` (`?tab=calendar` default): monthly metrics, calendar, day detail, sign-in/out when `ess.attendance:punch`. With `ess.attendance.regularization:apply`, a second **Regularization** tab (`?tab=regularization`) shows the apply form (date, in/out times, reason) and the employee’s own request list (pending withdraw, rejection reason). Optional `?date=YYYY-MM-DD` prefills the form. Calendar click on absent (`A`) still navigates to leave apply; regularization is explicit via the tab.

APIs: `GET/POST /ess/attendance/regularization`, `POST /ess/attendance/regularization/:id/withdraw`. Submit is disabled without an assigned reporting manager (same copy as leave apply).

#### Timesheet


| Path                                                      | Module    | Permission                 | Page                                          | Status                           |
| --------------------------------------------------------- | --------- | -------------------------- | --------------------------------------------- | -------------------------------- |
| `/timesheet`                                              | timesheet | `ess.timesheet:read`       | `TimesheetDayPage`                            | Live `/ess/timesheet/*`          |
| `/timesheet/team`                                         | timesheet | `approvals.timesheet:read` | `TeamTimesheetsPage`                          | Live `/ess/approvals/timesheet*` |
| `/timesheet/add`, `/timesheet/edit`, `/timesheet/reports` | —         | —                          | Redirect → `/timesheet`                       | Legacy                           |
| `/timesheet/requests`                                     | —         | —                          | Redirect → `/timesheet/team?status=SUBMITTED` |                                  |
| `/approvals/timesheet`                                    | —         | —                          | Redirect → `/timesheet/team?status=SUBMITTED` |                                  |




#### Performance (runtime)


| Path                         | Module      | Permission                    | Page                        |
| ---------------------------- | ----------- | ----------------------------- | --------------------------- |
| `/performance`               | performance | `ess.performance:read`        | `MyAssessmentsPage`         |
| `/performance/team`          | performance | `performance.review:read`     | `TeamPerformancePage`       |
| `/performance/manage`        | performance | `performance.hr:read`         | `HrPerformancePage`         |
| `/performance/:assessmentId` | performance | any of ESS / review / HR read | `PerformanceAssessmentPage` |


APIs under `/ess/performance/*`. Master data for cycles/templates lives in **settings**, not this feature.

#### Skills


| Path             | Module    | Permission              | Page              | API            |
| ---------------- | --------- | ----------------------- | ----------------- | -------------- |
| `/skills`        | employees | `ess.skills:read`       | `MySkillsPage`    | `/ess/skills*` |
| `/skills/search` | employees | `employees.skills:read` | `SkillSearchPage` | `/hr/skills/*` |




#### Employees, documents, payroll


| Path               | Module    | Permission                                   | Page                    | Status                                         |
| ------------------ | --------- | -------------------------------------------- | ----------------------- | ---------------------------------------------- |
| `/employees`       | employees | `employees:read`                             | `EmployeesPage`         | Live directory, onboarding, reporting managers |
| `/document-centre` | documents | `ess.documents:read` **or** `documents:read` | `DocumentCentrePage`    | Live `/document-centre/`*                      |
| `/payroll`         | payroll   | `payroll:read`                               | `ModulePlaceholderPage` | **Coming Soon**                                |




#### Settings (flat routes)

`/settings` → `/settings/organization`. Unknown `/settings/*` → `/settings/organization`. Each page is wrapped in `SettingsRouteGuard` + `SettingsShell`.


| Path                              | Page                                              |
| --------------------------------- | ------------------------------------------------- |
| `/settings/organization`          | Organization profile                              |
| `/settings/organization/calendar` | Organization calendar / holidays                  |
| `/settings/employees`             | Employee numbering / codes / policies             |
| `/settings/departments`           | Departments & designations                        |
| `/settings/locations`             | Location configurations                           |
| `/settings/leave`                 | Leave types / config                              |
| `/settings/attendance`            | Shifts, schedule & rules, check-in                |
| `/settings/timesheet/*`           | Timesheet general + categories                    |
| `/settings/performance`           | Performance master / builder                      |
| `/settings/skills`                | Skill catalog (categories, subcategories, skills) |
| `/settings/rbac/*`                | Roles, employee access, audit                     |




## Authorization

Frontend source of truth: `features/auth/config/accessRegistry.js` plus `features/auth/config/dashboardRegistry.js`.

Helpers (`features/auth/utils/authorization.js`): `can`, `canAny`, `hasModule`. Hook: `useAuthorization`. UI: `RequireAccess`, `RequirePermission`, `DashboardRouteGuard`, `Can`, `SettingsRouteGuard`.

Nav is **not** hardcoded by role. `filterTenantNavConfig(session)` drops modules the org is not entitled to and children the user cannot read. Settings children come from `settingsNavChildren(session)` using `SETTINGS_SLUG_ORDER` and `canAccessSettingsSection`.

### Dashboards (`dashboardRegistry.js`)


| Key   | Label              | Path         | Primary read         | Fallback if dashboard.* not synced                                   |
| ----- | ------------------ | ------------ | -------------------- | -------------------------------------------------------------------- |
| `ess` | Employee Dashboard | `/home`      | `dashboard.ess:read` | any of `ess.leave:read`, `ess.attendance:read`, `ess.timesheet:read` |
| `hr`  | Admin Dashboard    | `/dashboard` | `dashboard.hr:read`  | any of `employees:read`, `settings.organization:read`                |


ESS widgets (gated individually): timesheet, attendance-punch, leave-pending, holidays, payslip (`payroll:read`), quick-access, team-on-leave, track (`dashboard.ess.track:read`), who-is-in.

HR tiles: employees, attendance, payroll, settings (org or employee settings read).

### Settings access (`SETTINGS_ACCESS`)

Nav order: organization → employees → departments → locations → leave → attendance → timesheet → performance → skills → rbac.

Most sections require module `settings`. Exceptions: **timesheet** settings require entitled module `timesheet`; **rbac** requires module `rbac`.


| Slug         | Label                      | Read                           | Write                                                  |
| ------------ | -------------------------- | ------------------------------ | ------------------------------------------------------ |
| organization | Organization               | `settings.organization:read`   | `settings.organization:write`                          |
| employees    | Employees                  | `settings.employees:read`      | `settings.employees:write`                             |
| departments  | Departments & Designations | any of depts/designations read | `settings.employees:write` (tabs have own write codes) |
| locations    | Locations                  | `settings.locations:read`      | `settings.locations:write`                             |
| leave        | Leave config               | `settings.leave:read`          | `settings.leave:write`                                 |
| attendance   | Attendance                 | `settings.attendance:read`     | `settings.attendance:write`                            |
| timesheet    | Timesheet                  | `settings.timesheet:read`      | `settings.timesheet:write`                             |
| performance  | Performance                | `settings.performance:read`    | `settings.performance:write`                           |
| skills       | Skills                     | `settings.skills:read`         | `settings.skills:write`                                |
| rbac         | Roles & Permissions        | `rbac:read`                    | `rbac:manage`                                          |


Wide content column (`SETTINGS_WIDE_LAYOUT_SLUGS`): leave, attendance, performance, rbac, skills. Organization calendar also uses the wide layout.

### Platform modules (`shared/constants/platformModules.js`)

Codes aligned with backend: `employees`, `settings`, `leave`, `attendance`, `timesheet`, `payroll`, `tracking`, `approvals`, `rbac`.

**Tracking:** entitlement / ESS widget only. No tenant route and no feature folder.

## Tenant navigation

Live sidebar: `features/tenant/config/tenantNav.jsx`.

1. **Dashboard** group — allowed dashboards from `dashboardRegistry` (`/home`, `/dashboard`).
2. **Leave** — apply, requests (leave + regularization tabs), balances, calendar, holidays, team on leave.
3. **Attendance** — info (exact `/attendance`, Calendar + Regularization tabs), who is in, employee swipes.
4. **Timesheet** — my timesheet, team timesheets.
5. **Performance** — my assessments, team reviews, manage & assign.
6. **Skills** — my skills, skill search.
7. **Employees** — `/employees`.
8. **Document Centre** — `/document-centre`.
9. **Payroll** — `/payroll` (placeholder page).
10. **Settings** — filtered `settingsNavChildren`.

Do **not** use `orgAdminNav.jsx` or `employeeNav.jsx` as the live map. Those belong to orphaned layouts.

## Feature modules



### `features/auth`

Cookie session, login modes, password gate, and all access registries.


| Area   | Files                                                                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API    | `api/authApi.js` — `/auth/session`, `/auth/refresh`, `/auth/login`, `/auth/logout`, `/auth/change-password`, `/auth/handoff/consume`, `/auth/superadmin/bootstrap` |
| Pages  | `LoginPage.jsx`, `ChangePasswordPage.jsx`                                                                                                                          |
| Hooks  | `useLoginForm`, `useAuthorization`, `useSessionExpiry`                                                                                                             |
| Guards | `RequireAccess`, `RequirePermission`, `RequirePasswordChanged`, `DashboardRouteGuard`, `Can`                                                                       |
| Config | `accessRegistry.js`, `dashboardRegistry.js`                                                                                                                        |
| Utils  | `authorization.js`, `userRoles.js`                                                                                                                                 |


Public barrel (`index.js`): `LoginPage`, `useLoginForm` only. Guards and registries are imported from deep paths.

**Status:** production. Bootstrap login requires `VITE_BOOTSTRAP_ADMIN_KEY`. `employeeLoginRequest` is deprecated and still posts to `/auth/login`.

### `features/super-admin`

Platform operator UI.

- Overview stats and org CRUD (`organizationsApi.js`, `useSuperAdminOrganizations`).
- Subscriptions and entitled modules (`subscriptionsApi.js`).
- Leads inbox (`leadsApi.js`, `useLeads`, `LeadsPage`).

Layout: `layouts/DashboardLayout.jsx`. Public barrel exports overview/orgs/form/leads pages, layout, and the two hooks.

**Status:** production.

### `features/tenant`

Unified tenant chrome. **No** `index.js`**.**

- `layouts/TenantLayout.jsx` / `TenantLayoutShell.jsx` — app bar, branded sidebar, notifications entry.
- `config/tenantNav.jsx` — nav, titles, default landing.
- `pages/TenantDashboardPage.jsx` — wraps `OrgAdminHome`.
- `pages/TenantAttendancePage.jsx` — ESS attendance info vs Coming Soon.

**Status:** production (shell). Attendance root is dual-mode as above.

### `features/org-admin`

Still used for **HR dashboard content** and the generic Coming Soon page. Org-admin **layout and nav are unused** by `AppRoutes`.


| Live                                                                     | Unused                          |
| ------------------------------------------------------------------------ | ------------------------------- |
| `pages/OrgAdminHome.jsx` + `api/hrDashboardApi.js` (`GET /dashboard/hr`) | `layouts/OrgAdminLayout.jsx`    |
| `pages/ModulePlaceholderPage.jsx` (payroll, HR attendance)               | `config/orgAdminNav.jsx`        |
|                                                                          | `app/routes/OrgAdminRoutes.jsx` |


Barrel: `OrgAdminLayout`, `OrgAdminHome`, `ModulePlaceholderPage`.

### `features/employee-portal`

Employee self-service pages mounted from **TenantRoutes**, not from `EmployeeRoutes`.


| Area       | Pages                                                                             | API                                                                                       |
| ---------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Home       | `pages/home/EmployeeHomePage.jsx` + home cards                                    | `GET /ess/home`, notifications                                                            |
| Leave      | apply, balances, detail, calendar, holidays, team-on-leave                        | `/ess/leave/*`, `/ess/holidays`                                                           |
| Attendance | `AttendanceInfoPage` (Calendar + Regularization), who-is-in, swipes, punch dialog | `/ess/attendance/*` sign-in/out; regularization `GET/POST /ess/attendance/regularization` |
| Timesheet  | `pages/timesheet/TimesheetDayPage.jsx`                                            | `/ess/timesheet/*`                                                                        |
| Skills     | `pages/skills/MySkillsPage.jsx`                                                   | `/ess/skills*`                                                                            |


Regularization UI lives under `components/attendance/` (`RegularizationTabPanel`, apply form, request cards). Bell menu (`EmployeeNotificationsMenu.jsx`): leave pending → `/leave/requests`; regularization pending → `/leave/requests?tab=regularization`; regularization approved/rejected → `/attendance?tab=regularization`.

Optional QA mocks (`mocks/essQaMocks.js`): calendar, transactions, team-on-leave, who-is-in, swipes when `VITE_ESS_QA_MOCKS=true`. Scenario via `VITE_ESS_QA_MOCK_SCENARIO` (`stress`  `empty`  `leap`). Leave apply still uses static `MOCK_SESSIONS` for half-day session options (enum-like, not fake leave data).

Barrel exports **orphaned** `EmployeeRoutes` and `EmployeeLayout`. `config/employeeNav.jsx` is only used by that unused layout (missing skills/performance/document-centre relative to live `tenantNav`).

**Status:** production against `/ess/`*. Ignore `EmployeeRoutes` when adding tenant pages.

### `features/approvals`

Manager leave approvals, **attendance regularization** approvals, and team timesheet approvals. **No** `index.js`**.** TenantRoutes import pages directly.

- `pages/leave/LeaveRequestsPage.jsx` — leave inbox + Regularization Requests tab
- `pages/timesheet/TeamTimesheetsPage.jsx`
- `api/approvalsApi.js` — `/ess/approvals/leave*`, `/ess/approvals/attendance-regularization*`, `/ess/approvals/timesheet*` (including bulk approve)
- Regularization UI: `RegularizationRequestListItem.jsx`, `RegularizationApprovalDetailPanel.jsx`

Permissions: `approvals.leave:read` / `:act`, `approvals.attendance:read` / `:act`, `approvals.timesheet:read` / `:act`. Custom roles need the attendance codes granted in Settings → RBAC; system roles pick them up from catalog seed.

**Status:** production.

### `features/employees`

HR people operations.

- Directory: list, search, pagination, reset password, open onboarding (`employeesApi.js` — `/employees`, `/employees/hr-onboarding`, `/employees/check-duplicate`, reset-password).
- Tabs from `EMPLOYEES_MODULE_ACCESS`: directory (`employees:read` + create/update/onboard/reset-password actions) and reporting managers (`employees:reporting-manager:read` / `:assign`).
- Reporting managers: `reporting/ReportingManagersTab.jsx`, `api/reportingManagersApi.js`.
- Onboarding wizard: 7 steps — BasicInfo, Employment, Experience, PayrollBank, Compliance, Documents, Access. Draft save (`useOnboardingDraft`), Zod `onboardingSchema`, locations/shifts from settings APIs.

`DEPARTMENT_SUGGESTIONS` / `DESIGNATION_SUGGESTIONS` in `onboarding/constants.js` are **static placeholders** (comment: until admin APIs exist). Departments/designations settings APIs already exist; the wizard suggestions are not wired to them.

Barrel: `EmployeesPage`, `EmployeeOnboardingWizard`.

**Status:** mostly production.

### `features/settings`

Org HR configuration umbrella. Top barrel exports `SettingsPage` (alias of `SettingsShell`).

- Shell: `shell/SettingsPage.jsx` (max-width wrapper), `settingsNav.js`, `settingsRouteConfig.jsx`, `SettingsRouteGuard.jsx`, `settingsMapper.js`.
- Cross-tab CRUD: `shared/` — `RecordFormLayout`, `CrudDataTable`, `ConfirmDeleteDialog`, `EmptyState`.
- Shared look: `shared/components/settings/` (`SettingsField`, `SettingsSection`, `settingsLayout.js`).
- Tenant-scoped HTTP: `api/settingsApi.js` sends `x-org-id`.

Each tab exposes a small public API via `index.js`. Import cross-tab hooks from sibling barrels (e.g. `@/features/settings/locations`), not deep hook paths. Attendance time helpers: `shared/utils/shiftTime.js`.

#### Organization

Profile (`GET/POST /settings/profile`, branding) and calendar (`/settings/organization/calendar*`: holidays CRUD, bulk upsert, publish). Routes: `/settings/organization`, `/settings/organization/calendar`.

#### Employees settings

Numbering, codes, and employee-policy fields (`GET/POST /settings/employee`). Not the people directory.

#### Org structure

Departments and designations (`GET/POST /settings/departments`, `/settings/designations`). URL slug is `departments`.

#### Locations

Location configurations used by onboarding and attendance (`GET/POST /settings/locations`). Barrel exports `useLocationConfigurations`.

#### Leave config

Leave types and rules (`GET/POST /settings/leave-config`).

#### Attendance settings

Tabs: shifts, schedule & rules, check-in (`GET/POST /settings/attendance`). Check-in covers geo/tracking-style options; it is **not** a Tracking product module.

#### Timesheet settings

General (`GET/POST /settings/timesheet`) and category CRUD (`/settings/timesheet/categories` via `timesheet/api/timesheetCategoryApi.js`). Entitlement module: `timesheet`.

#### Performance settings (master)

Cycle / template master (`GET/PUT /settings/performance/master`). Distinct from `features/performance` runtime.

#### Skills settings (master)

Categories → subcategories → skills (`skills/api/skillsMasterApi.js`, `/settings/skills/*`). Tabs in `skillsTabs.js`.

### `features/rbac`

Roles & permissions admin under settings. **No** `index.js`**.** Mounted as `RbacSettingsPage` from `settingsRouteConfig`.

Tabs (`rbacTabs.js`): `/settings/rbac/roles` (catalog + permission matrix), `/settings/rbac/employees` (assign roles), `/settings/rbac/audit`.

API (`rbacApi.js`): `/rbac/roles`, `/rbac/permissions`, role clone/deactivate, employee roles, `/rbac/audit-logs`, org modules. Permission **preview** dialog uses illustrative sample cards (`permissionPreviewRegistry.js`), not live screens. Registry includes `ess.attendance.regularization:apply` and `approvals.attendance:read`.

**Status:** production APIs; preview UI is mock.

### `features/performance`

Assessment runtime for employees, reviewers, and HR.

Pages: `MyAssessmentsPage`, `TeamPerformancePage`, `HrPerformancePage`, `PerformanceAssessmentPage`. API: `/ess/performance/assessments*` (draft, submit, review actions).

Barrel exports the four pages.

**Status:** production.

### `features/skill-search`

HR search of employees by catalog/skill filters and a profile panel.

- `pages/SkillSearchPage.jsx`
- `api/hrSkillsApi.js` — `/hr/skills/catalog`, `/hr/skills/employees`, `/hr/skills/employees/:id`
- Filters, result list, `ProficiencyBadge`, `EmployeeSkillProfilePanel`

Barrel: `SkillSearchPage`. Reuses employee-portal `PageToolbar`. Permission: `employees.skills:read`.

**Status:** production.

### `features/document-centre`

Form-16, policies, and public documents: list, upload, preview, download.

- `pages/DocumentCentrePage.jsx`
- `api/documentCentreApi.js` — `/document-centre/documents`, policies/forms POST, form16 upload

Permissions: `ess.documents:read` and/or `documents:read` / `:write`.

**Status:** production.

## Shared layer


| Folder                       | Role                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------- |
| `shared/api`                 | Cookie HTTP + storage                                                                           |
| `shared/components/layout`   | Sidebar, page/settings toolbars, sidebar layout tokens                                          |
| `shared/components/ui`       | PageHeader, PageCard, CrudButton, HeroBanner, DashboardWidgetCard, StickySaveBar, BrandedButton |
| `shared/components/data`     | ResponsiveDataTable, MobileDataCard, TableRowActions, ActiveSwitchCell                          |
| `shared/components/forms`    | RHF desktop time picker                                                                         |
| `shared/components/feedback` | AppSnackbar, FormStatusAlerts                                                                   |
| `shared/components/settings` | Settings field/section primitives                                                               |
| `shared/theme`               | `createAppTheme`, tokens, surfaces                                                              |
| `shared/utils`               | tenant, session, timestamps, shiftTime, uuid                                                    |


`shared/**` must not import `features/**` (ESLint). Auth expiry event is an exception already wired from `httpClient` into auth hooks.

## Feature module convention

Preferred shape:

```text
{feature}/
  index.js          # small public API (missing on tenant, approvals, rbac)
  pages/ | layouts/ | routes/
  components/
  hooks/
  api/
  utils/
  config/ | constants.js | schemas/
```

Adding a **tenant** module: entry in `tenantNav.jsx`, `<Route>` in `TenantRoutes.jsx` with `RequireAccess`, implementation under `features/<module>/`, permission codes in `accessRegistry.js` if new. Do not add `OrgAdminRoutes` or `EmployeeRoutes` entries.

Adding a **settings** tab: `SETTINGS_ACCESS` + `SETTINGS_SLUG_ORDER`, page + barrel, route in `settingsRouteConfig.jsx`, `x-org-id` API. Settings nav children are derived; do not duplicate them in `tenantNav` except the Settings parent.

## Import boundary rules (ESLint)

`eslint.config.js` `import/no-restricted-paths` **as currently configured**:


| Zone                                                                              | Rule                                                                                                                                    |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `src/shared/**`                                                                   | Must not import `src/features/**`                                                                                                       |
| `src/features/{auth,super-admin,org-admin,employees,employee-portal,settings}/**` | Must not import other top-level features except documented exceptions: org-admin → employees/settings; employees → `settings/employees` |
| `src/features/settings/<tab>/**`                                                  | May import `@/shared/**`, settings `shared/`, `api/`, own tab; sibling tabs listed per tab (barrel folders)                             |


Configured settings-tab sibling exceptions: org-structure → employees; leave → locations; attendance → locations; shell → organization, employees, org-structure, locations, leave, attendance.

Zones are **not** declared for `tenant`, `approvals`, `rbac`, `performance`, `skill-search`, or `document-centre`. Prefer `@/shared/`*, `@/app/*`, and feature/tab `index.js` barrels over deep relative paths where barrels exist.

## Environment variables


| Variable                    | Purpose                                                         |
| --------------------------- | --------------------------------------------------------------- |
| `VITE_API_BASE_URL`         | Explicit API origin (localhost fallback and deployed override)  |
| `VITE_API_PATH`             | API path suffix in staging/production Vite modes                |
| `VITE_APP_BASE_PATH`        | App base path helper for tenant redirects                       |
| `VITE_BOOTSTRAP_ADMIN_KEY`  | Header `x-bootstrap-admin-key` for `/auth/superadmin/bootstrap` |
| `VITE_ESS_QA_MOCKS`         | `true` enables ESS QA mocks for selected leave/attendance reads |
| `VITE_ESS_QA_MOCK_SCENARIO` | `stress` (default), `empty`, or `leap`                          |


Do not commit secrets. `.env` is local-only.

## Scripts

From `ghoulhr/package.json`:


| Script                     | Command                      |
| -------------------------- | ---------------------------- |
| `npm run dev`              | Vite dev                     |
| `npm run build`            | Production build (2 GB heap) |
| `npm run build:staging`    | Staging mode build           |
| `npm run build:production` | Production mode build        |
| `npm run preview`          | Preview built app            |
| `npm run lint`             | ESLint                       |
| `npm run test`             | Vitest once                  |
| `npm run test:watch`       | Vitest watch                 |




## Verification

After structural or routing changes:

```bash
npm run lint
npm run test
npm run build
```

Manual smoke (permissions and entitled modules must match what you log in as):

**Public / auth**

- `/` tenant login; `/admin-cp` super-admin login; `/login` redirects to `/`.
- User with `mustChangePassword` cannot open tenant routes until `/change-password` succeeds.

**Super admin**

- `/dashboard`, `/organizations`, create/edit org, `/leads`.

**Tenant dashboards and ESS**

- `/home` ESS widgets; `/dashboard` HR tiles.
- Leave: apply, balances, calendar, holidays, team-on-leave, requests (leave + regularization tabs for approvers).
- Attendance: info Calendar tab (or Coming Soon without ESS read); Regularization tab when `ess.attendance.regularization:apply`; who-is-in, swipes, punch.
- Timesheet day entry; team timesheets for approvers; legacy `/timesheet/add` redirects.
- Performance: my assessments, team, manage, assessment detail.
- Skills: my skills; skill search for HR.
- Employees: directory, onboarding, reporting managers.
- Document Centre list/upload/preview.
- `/payroll` Coming Soon (if `payroll:read`).
- Settings submenu expands on `/settings/*`; RBAC roles / employees / audit; skills master tabs.
- Sidebar hides modules the session cannot access.

**Do not treat as live**

- `OrgAdminRoutes`, `EmployeeRoutes`, `orgAdminNav`, `employeeNav`.
- `/tracking` (no route).
- Payroll beyond the placeholder.
- RBAC permission preview cards (illustrative).
- Onboarding department/designation suggestion lists (static).

