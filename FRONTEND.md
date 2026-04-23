# Frontend Documentation

## 1. Overview

The GhoulHRMS frontend is a **React-based single-page application (SPA)** that provides role-based dashboards for managing multi-tenant HR organizations. It handles authentication, tenant-based routing, role-based dashboard routing, and organization CRUD operations through a modern Material UI interface.

**Tech Stack:**
- **Framework:** React 19
- **Build Tool:** Vite 7
- **UI Library:** Material UI (MUI) 7
- **Styling:** Emotion (MUI's default)
- **HTTP Client:** Native Fetch API
- **State Management:** React hooks (useState, useMemo, useEffect) + React Query (@tanstack/react-query)
- **Routing:** React Router DOM 7
- **Form Management:** React Hook Form
- **Language:** JavaScript (JSX)

**Role in System:** Serves as the administrative interface for Super Admins and Organization Admins to manage organizations, employees, payroll, and view dashboard statistics. Communicates with the backend API ([See Backend API](./BACKEND.md#api-endpoints)).

---

## 2. Project Structure

```
frontend/ghoulhr/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   │   └── react.svg
│   ├── components/
│   │   └── layout/
│   │       └── SidebarContent.jsx         # Reusable sidebar component
│   ├── config/
│   │   └── appConfig.js                   # Environment variables & constants
│   ├── examples/
│   │   └── settingsUsageExamples.js       # Settings API usage examples
│   ├── hooks/
│   │   ├── useSettings.js                 # Custom hook for settings management
│   │   ├── useEmployeeSettings.js         # Custom hook for employee settings
│   │   └── useAttendanceSettings.js       # Custom hook for attendance settings
│   ├── layouts/
│   │   └── DashboardLayout.jsx            # Main dashboard layout wrapper
│   ├── pages/
│   │   ├── DashboardPage.jsx              # Legacy: Old Super Admin dashboard (replaced)
│   │   ├── LoginPage.jsx                  # Authentication page
│   │   ├── OrgAdminDashboard.jsx          # Organization Admin dashboard (400 lines)
│   │   ├── OrgDashboardPage.jsx           # Wrapper for OrgAdminDashboard
│   │   ├── OrganizationFormPage.jsx       # Create/Edit organization form (608 lines)
│   │   ├── OrganizationsPage.jsx          # Organizations list & recycle bin (201 lines)
│   │   ├── OverviewPage.jsx               # Super Admin overview/dashboard stats (107 lines)
│   │   ├── SettingsPage.jsx               # Organization settings page with tabs (600+ lines)
│   │   ├── EmployeeSettingsForm.jsx       # Employee settings form component
│   │   └── AttendanceSettingsForm.jsx     # Attendance & shift settings form component (911 lines)
│   ├── services/
│   │   ├── authApi.js                     # Authentication API calls
│   │   ├── organizationsApi.js            # Organization API calls
│   │   ├── orgAdminApi.js                 # Organization Admin API calls
│   │   ├── settingsApi.js                 # Settings API calls (profile, employee, attendance)
│   │   └── settingsApi.examples.js        # Settings API usage examples
│   ├── theme/
│   │   └── appTheme.js                    # MUI theme configuration
│   ├── types/
│   │   └── settings.types.js              # JSDoc type definitions for settings
│   ├── utils/
│   │   ├── session.js                     # LocalStorage session management
│   │   ├── settingsMapper.js              # Settings array-to-object mapper
│   │   └── tenant.js                      # Subdomain-based redirect logic
│   ├── App.jsx                            # Root component with auth routing
│   ├── main.jsx                           # Entry point
│   ├── index.css                          # Global styles
│   └── App.css
├── .env                                   # Environment variables
├── package.json
├── vite.config.js
└── index.html
```

---

## 3. Architecture

### Component Hierarchy

```
<QueryClientProvider> (React Query setup)
└── <App> (Auth state manager & role-based routing)
    ├── <LoginPage> (if not authenticated)
    │   ├── Tabs (Super Admin / Employee modes)
    │   ├── Email/Password form
    │   └── Submit → calls authApi.js
    │
    └── Role-Based Dashboard Routing (if authenticated)
        ├── SUPER_ADMIN → <DashboardLayout> + React Router
        │   ├── AppBar (top navigation)
        │   ├── SidebarContent (reusable drawer)
        │   └── Routes
        │       ├── /dashboard → <OverviewPage>
        │       │   ├── Stats Cards (orgs, users, revenue)
        │       │   ├── Growth Chart (last 6 months)
        │       │   └── Org Status Snapshot
        │       ├── /organizations → <OrganizationsPage>
        │       │   ├── Organizations Table
        │       │   ├── Search & Filter
        │       │   └── Recycle Bin Table
        │       ├── /organizations/new → <OrganizationFormPage>
        │       └── /organizations/:id/edit → <OrganizationFormPage>
        │
        └── ORG_ADMIN → <OrgDashboardPage> → <OrgAdminDashboard>
            ├── AppBar (organization admin panel)
            ├── SidebarContent (reusable drawer)
            └── Main Content
                ├── Welcome Banner (org info)
                ├── Stats Cards (employees, attendance, payroll)
                ├── Quick Actions
                └── Recent Activity Feed
```

### Design Patterns

1. **Conditional Rendering:** Auth state determines login vs dashboard
2. **Layout Pattern:** `DashboardLayout` wraps authenticated routes with shared UI
3. **Service Layer Pattern:** API calls isolated in `services/*.js` files
4. **Custom Hooks:** `useSettings` for settings management with React Query
5. **Component Composition:** Pages composed of smaller, focused components
6. **Route-Based Code Splitting:** Each section is a separate route/component

---

## 4. Routing

**React Router DOM 7 is now used for client-side routing.** Routing is handled through:

1. **Auth-based conditional rendering:**
   - No session → `<LoginPage>` at `/login`
   - Valid session → Role-based dashboard routing

2. **Role-based dashboard routing:**
   - `user.role === 'SUPER_ADMIN'` → `<DashboardLayout>` with routes
   - `user.role === 'ORG_ADMIN'` → `<OrgDashboardPage>` (wraps `<OrgAdminDashboard>`)
   - Other roles → `<DashboardLayout>` with routes (default)

3. **SUPER_ADMIN Routes:**
   - `/dashboard` → `<OverviewPage>` (stats, growth chart)
   - `/organizations` → `<OrganizationsPage>` (list, search, recycle bin)
   - `/organizations/new` → `<OrganizationFormPage>` (create mode)
   - `/organizations/:id/edit` → `<OrganizationFormPage>` (edit mode)
   - `*` → Redirect to `/dashboard`

4. **Tenant subdomain redirects with session transfer:**
   - After login, redirects to `{subdomain}.ghoulhr.com` via `window.location.assign()`
   - Session data encoded in URL parameters for cross-subdomain transfer
   - Logic in [tenant.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/utils/tenant.js) and [session.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/utils/session.js)

**Architecture Improvement:** Replaced internal state-based section navigation with proper URL-based routing, enabling bookmarking, browser history, and deep linking.

---

## 5. Components

### Page Components

| Component | File | Purpose | Lines |
|-----------|------|---------|-------|
| LoginPage | [pages/LoginPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/LoginPage.jsx) | Email/password authentication form | 221 |
| OverviewPage | [pages/OverviewPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/OverviewPage.jsx) | Super Admin dashboard overview with stats | 107 |
| OrganizationsPage | [pages/OrganizationsPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/OrganizationsPage.jsx) | Organizations list with search & recycle bin | 201 |
| OrganizationFormPage | [pages/OrganizationFormPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/OrganizationFormPage.jsx) | Create/Edit organization form (6 sections) | 608 |
| OrgAdminDashboard | [pages/OrgAdminDashboard.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/OrgAdminDashboard.jsx) | Organization Admin dashboard | 400 |
| OrgDashboardPage | [pages/OrgDashboardPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/OrgDashboardPage.jsx) | Wrapper for OrgAdminDashboard | 6 |
| SettingsPage | [pages/SettingsPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/SettingsPage.jsx) | Organization settings management with tabs (Organization, Employees, Attendance) | 600+ |
| EmployeeSettingsForm | [pages/EmployeeSettingsForm.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/EmployeeSettingsForm.jsx) | Employee ID generation & field configuration | 350+ |
| AttendanceSettingsForm | [pages/AttendanceSettingsForm.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/AttendanceSettingsForm.jsx) | Attendance & shift settings with dynamic forms | 911 |
| DashboardPage | [pages/DashboardPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/DashboardPage.jsx) | **LEGACY:** Old monolithic dashboard (replaced) | 777 |

### Layout Components

| Component | File | Purpose |
|-----------|------|---------||
| DashboardLayout | [layouts/DashboardLayout.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/layouts/DashboardLayout.jsx) | Main layout wrapper with AppBar, Drawer, and Routes |

### Reusable Components

| Component | File | Purpose |
|-----------|------|---------||
| SidebarContent | [components/layout/SidebarContent.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/components/layout/SidebarContent.jsx) | Navigation sidebar with user info |

### Component Breakdown

**DashboardLayout:**
- Props: `user`, `navItems`, `mobileDrawerOpen`, `onOpenMobileDrawer`, `onCloseMobileDrawer`, `onLogout`, `children`
- Responsive layout with fixed drawer (280px width) on desktop, temporary drawer on mobile
- Uses `useLocation` and `useNavigate` from React Router for active nav item highlighting
- Wraps all authenticated routes with shared AppBar and Sidebar

**SidebarContent:**
- Props: `user`, `navItems`, `onItemClick`
- Displays GhoulHRMS branding, navigation list, user email/role chip
- Used in both permanent (desktop) and temporary (mobile) drawers

**LoginPage:**
- Props: `mode`, `setMode`, `form`, `onFieldChange`, `onSubmit`, `loading`, `error`
- Two-tab interface: "Super Admin" / "Employee/Admin"
- Gradient background with marketing features list
- Password visibility toggle

**OverviewPage (SUPER_ADMIN):**
- Props: `stats`, `activeCount`, `inactiveCount`
- Stats cards: Total Organizations, Total Users, Total Revenue
- Organization Growth chart (last 6 months) with progress bars
- Org Status Snapshot (Active/Inactive counts)

**OrganizationsPage (SUPER_ADMIN):**
- Props: `organizations`, `deletedOrganizations`, `isLoading`, `error`, `search`, `onSearchChange`, `onEdit`, `onDelete`, `onRestore`
- Searchable organization table with status chips
- Actions: Edit (navigates to form), Delete (soft delete)
- Recycle bin table for soft-deleted organizations with Restore action
- Loading spinner and empty state handling

**OrganizationFormPage (SUPER_ADMIN):**
- Props: `accessToken`, `onSaved`
- Accordion-based form with 6 sections, 50+ fields
- Sections: Basic Details, Address, Statutory & Compliance, Payroll Settings, Admin User, Bank Details
- Create and Edit modes (detected via `useParams`)
- Loads organization data for edit mode via `getOrganizationById`
- Prevents double-fetch in React StrictMode using `useRef`
- Strips backend-managed fields (id, timestamps, db credentials) before submission

**OrgAdminDashboard (ORG_ADMIN):**
- Props: `accessToken`, `user`, `userName`, `mobileDrawerOpen`, `onOpenMobileDrawer`, `onCloseMobileDrawer`, `onLogout`
- Organization-specific dashboard with branded welcome banner
- Stats cards: Total Employees, Present Today, Pending Payroll, Active Departments
- Quick action cards: Add Employee, Mark Attendance, Process Payroll, Org Settings
- Recent activity feed
- Role indicator showing "Organization Admin Panel"

**SettingsPage:**
- Props: `accessToken`, `organizationId`
- **Tabbed Interface:** Three tabs for different settings categories
  - **Tab 1: Organization** - Profile settings with logo upload
  - **Tab 2: Employees** - Employee ID generation and required fields configuration
  - **Tab 3: Attendance** - Working days, shift management, and attendance rules
- Regional settings: Timezone, Currency, Date Format, Language
- Uses `react-hook-form` for form management
- Uses custom hooks with React Query (`useSettings`, `useEmployeeSettings`, `useAttendanceSettings`)
- Success/error alerts with auto-dismiss
- Logo preview with base64 conversion

**EmployeeSettingsForm:**
- Props: `accessToken`, `organizationId`
- Employee ID configuration: prefix, auto-generation toggle
- Required fields multi-select with pre-defined options
- Default probation period configuration
- Form validation for required fields
- Uses `useEmployeeSettings` hook with React Query

**AttendanceSettingsForm:**
- Props: `accessToken`, `organizationId`
- **8 Configuration Sections:**
  1. **Working Days** - Multi-select chips for weekdays (Mon-Sun)
  2. **Shift Management** - Dynamic add/remove shifts with `useFieldArray`
  3. **Grace Period** - Numeric input for late check-in tolerance
  4. **Half-Day Rule** - Minutes threshold for half-day marking
  5. **Overtime** - Toggle switch with conditional rules (max hours, multiplier)
  6. **Attendance Mode** - Dropdown: manual, biometric, geo, IP-based
  7. **Geo-Fencing** - Toggle for location-based attendance
  8. **Allowed IP Addresses** - Tag input for IP whitelist (supports CIDR)
- Form validation: time format (HH:mm), required fields, IP format
- Dynamic shift array with add/remove functionality
- Uses `useAttendanceSettings` hook with React Query

---

## 6. State Management

**Approach:** React built-in hooks + React Query (@tanstack/react-query)

### Global State (App.jsx)

```javascript
const [session, setSession] = useState(() => readSession());  // From localStorage or URL
const [mode, setMode] = useState('superadmin');
const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [form, setForm] = useState({ email: '', password: '' });
const userRole = user?.role;  // Used for role-based dashboard routing

// Organization data (SUPER_ADMIN)
const [organizations, setOrganizations] = useState([]);
const [deletedOrganizations, setDeletedOrganizations] = useState([]);
const [stats, setStats] = useState({ totalOrganizations: 0, totalUsers: 0, ... });
const [orgLoading, setOrgLoading] = useState(true);
const [orgError, setOrgError] = useState('');
const [orgSearch, setOrgSearch] = useState('');
```

### React Query Setup (App.jsx)

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Wrapped in QueryClientProvider
<QueryClientProvider client={queryClient}>
  <App />
</QueryClientProvider>
```

### Custom Hooks

**File:** [hooks/useSettings.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/hooks/useSettings.js)

```javascript
export function useSettings(accessToken, organizationId) {
  const queryClient = useQueryClient();

  // Fetch settings
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: () => getOrgProfile(accessToken, organizationId),
    enabled: !!accessToken && !!organizationId,
    staleTime: 5 * 60 * 1000,  // Cache for 5 minutes
    gcTime: 10 * 60 * 1000,    // Keep in GC for 10 minutes
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (formData) => updateOrgProfile(accessToken, organizationId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    settings: data || {},
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
```

**File:** [hooks/useEmployeeSettings.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/hooks/useEmployeeSettings.js)

```javascript
export function useEmployeeSettings(accessToken, organizationId) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: EMPLOYEE_SETTINGS_QUERY_KEY,
    queryFn: () => getEmployeeSettings(accessToken, organizationId),
    enabled: !!accessToken && !!organizationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => updateEmployeeSettings(accessToken, organizationId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EMPLOYEE_SETTINGS_QUERY_KEY });
    },
  });

  return {
    settings: data || {},
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
```

**File:** [hooks/useAttendanceSettings.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/hooks/useAttendanceSettings.js)

```javascript
export function useAttendanceSettings(accessToken, organizationId) {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ATTENDANCE_SETTINGS_QUERY_KEY,
    queryFn: () => getAttendanceSettings(accessToken, organizationId),
    enabled: !!accessToken && !!organizationId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const updateMutation = useMutation({
    mutationFn: (formData) => updateAttendanceSettings(accessToken, organizationId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ATTENDANCE_SETTINGS_QUERY_KEY });
    },
  });

  return {
    settings: data || {},
    isLoading,
    error: error || updateMutation.error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
    refetch,
  };
}
```

### Derived State (useMemo)

```javascript
const filteredOrganizations = useMemo(() => {
  // Search filtering logic
}, [organizations, search]);

const userName = useMemo(() => user?.email?.split('@')[0] || 'User', [user?.email]);
```

**Session Persistence:**
- `localStorage` key: `ghoulhr_session`
- Stored data: `{ accessToken, user }`
- Functions: [session.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/utils/session.js) (`readSession`, `persistSession`, `clearSession`)
- **Cross-subdomain transfer:** Session data encoded in URL parameters during redirect, decoded and saved to localStorage on target subdomain

**State Management Improvements:**
1. **React Query** replaces manual data fetching for settings with caching, auto-refetch, and mutation support
2. **Component-level state** for organizations data in App.jsx (could be migrated to React Query)
3. **React Hook Form** for form state management in SettingsPage with validation

---

## 7. API Integration Layer

**For full API details, see: [Backend API](./BACKEND.md#api-endpoints)**

### Configuration

**File:** [config/appConfig.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/config/appConfig.js)

```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
export const DEFAULT_BOOTSTRAP_KEY = import.meta.env.VITE_BOOTSTRAP_ADMIN_KEY ?? '';
export const STORAGE_KEY = 'ghoulhr_session';
```

### Base Request Function

**File:** [services/authApi.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/services/authApi.js#L3-L29)

```javascript
async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    ...options,
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message = (payload && (payload.message?.[0] ?? payload.message ?? payload.error)) 
                    || 'Request failed. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}
```

**Features:**
- Automatic JSON parsing
- Error extraction from nested response structure
- Status code attachment to error objects

### Auth API

**File:** [services/authApi.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/services/authApi.js)

| Function | Method | Endpoint | Headers | Body |
|----------|--------|----------|---------|------|
| `loginRequest(email, password)` | POST | `/auth/login` | - | `{ email, password }` |
| `bootstrapSuperAdminRequest(email, password)` | POST | `/auth/superadmin/bootstrap` | `x-bootstrap-admin-key` | `{ email, password }` |

**Bootstrap Request Details:**
- Throws error if `VITE_BOOTSTRAP_ADMIN_KEY` is missing
- Sends key in `x-bootstrap-admin-key` header
- [See backend implementation](./BACKEND.md#bootstrap-super-admin-flow)

### Organizations API

**File:** [services/organizationsApi.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/services/organizationsApi.js)

All requests include `Authorization: Bearer {accessToken}` header.

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `listOrganizations(accessToken)` | GET | `/organizations` | Fetch all orgs |
| `createOrganization(accessToken, body)` | POST | `/organizations` | Create new org |
| `updateOrganization(accessToken, orgId, body)` | PATCH | `/organizations/id/:id` | Update org |
| `deleteOrganization(accessToken, orgId)` | DELETE | `/organizations/id/:id` | Soft-delete org |
| `listDeletedOrganizations(accessToken)` | GET | `/organizations/deleted` | Fetch deleted orgs |
| `restoreOrganization(accessToken, orgId)` | PATCH | `/organizations/id/:id/restore` | Restore org |
| `getSuperAdminDashboardStats(accessToken)` | GET | `/organizations/stats` | Dashboard metrics |

### Organization Admin API

**File:** [services/orgAdminApi.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/services/orgAdminApi.js)

All requests include `Authorization: Bearer {accessToken}` header.

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `getOrgAdminDashboardStats(accessToken)` | GET | `/org-admin/dashboard/stats` | Org admin dashboard metrics |
| `getOrganizationEmployees(accessToken, organizationId)` | GET | `/org-admin/employees` | Fetch org employees |
| `getOrganizationAttendance(accessToken, organizationId, date)` | GET | `/org-admin/attendance` | Fetch attendance data |
| `getOrganizationPayroll(accessToken, organizationId, month)` | GET | `/org-admin/payroll` | Fetch payroll data |
| `getOrganizationDetails(accessToken, organizationId)` | GET | `/org-admin/organization/:id` | Fetch org details |

### Settings API

**File:** [services/settingsApi.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/services/settingsApi.js)

All requests include `Authorization: Bearer {accessToken}` and `x-org-id` headers for multi-tenant support.

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------||
| `getAllSettings(accessToken, organizationId)` | GET | `/settings` | Fetch all organization settings |
| `getSettingByKey(accessToken, organizationId, key)` | GET | `/settings/:key` | Fetch specific setting |
| `updateSetting(accessToken, organizationId, payload)` | POST | `/settings` | Create/update setting |
| `updateOrgProfile(accessToken, organizationId, profileData)` | POST | `/settings/profile` | Batch update org profile |
| `getOrgProfile(accessToken, organizationId)` | GET | `/settings/profile` | Fetch org profile (auto-mapped to object) |
| `getEmployeeSettings(accessToken, organizationId)` | GET | `/settings/employee` | Fetch employee settings |
| `updateEmployeeSettings(accessToken, organizationId, employeeData)` | POST | `/settings/employee` | Update employee settings |
| `getAttendanceSettings(accessToken, organizationId)` | GET | `/settings/attendance` | Fetch attendance settings |
| `updateAttendanceSettings(accessToken, organizationId, attendanceData)` | POST | `/settings/attendance` | Update attendance settings |

### Data Loading Patterns

**Manual Data Loading (Organizations - App.jsx):**

```javascript
// App.jsx: Load organizations and stats
const loadOrganizationsAndStats = async () => {
  if (!session?.accessToken || user?.role !== 'SUPER_ADMIN') {
    setOrgLoading(false);
    return;
  }
  setOrgError('');
  setOrgLoading(true);
  try {
    const [orgs, deleted, statsResponse] = await Promise.all([
      listOrganizations(session.accessToken),
      listDeletedOrganizations(session.accessToken),
      getSuperAdminDashboardStats(session.accessToken),
    ]);
    setOrganizations(Array.isArray(orgs) ? orgs : []);
    setDeletedOrganizations(Array.isArray(deleted) ? deleted : []);
    if (statsResponse) {
      setStats(statsResponse);
    }
  } catch (err) {
    setOrgError(err.message);
  } finally {
    setOrgLoading(false);
  }
};

useEffect(() => {
  // Load dashboard data whenever a SUPER_ADMIN logs in or token changes
  if (session?.accessToken && user?.role === 'SUPER_ADMIN') {
    loadOrganizationsAndStats();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [session?.accessToken, user?.role]);
```

**React Query Pattern (Settings - useSettings hook):**

```javascript
// hooks/useSettings.js
const { data, isLoading, error } = useQuery({
  queryKey: ['settings'],
  queryFn: () => getOrgProfile(accessToken, organizationId),
  enabled: !!accessToken && !!organizationId,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

const updateMutation = useMutation({
  mutationFn: (formData) => updateOrgProfile(accessToken, organizationId, formData),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['settings'] });
  },
});
```

**Note:** Uses `Promise.all` for parallel requests to improve performance. React Query provides automatic caching, background refetching, and optimistic updates.

---

## 8. Authentication Flow

**[See backend auth implementation](./BACKEND.md#authentication--authorization)**

### Login Process

1. User enters email/password in [LoginPage](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/LoginPage.jsx)
2. Selects mode: "Super Admin" or "Employee/Admin"
3. Submits form → calls `handleSubmit()` in [App.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/App.jsx#L30-L90)

**Flow:**
```javascript
// Step 1: Try normal login
const authResult = await loginRequest(form.email, form.password);

// Step 2: If 401 and mode='superadmin', try bootstrap
if (mode === 'superadmin' && loginError.status === 401) {
  const bootstrapResult = await bootstrapSuperAdminRequest(form.email, form.password);
}

// Step 3: Persist session
persistSession({ accessToken: authResult.accessToken, user: authResult.user });

// Step 4: Redirect to tenant subdomain with session data
const redirectUrl = getTenantRedirectUrl(authResult?.user?.organizationSubdomain, nextSession);
if (redirectUrl) {
  window.location.assign(redirectUrl);  // URL includes encoded session
}
```

### Token Storage

- **Location:** `localStorage` (key: `ghoulhr_session`)
- **Format:** `{ accessToken: string, user: object }`
- **Loaded on app start:** `useState(() => readSession())`

### Session Validation

- No automatic token refresh
- No expiry checking on load
- Token validated by backend on each API call
- If token invalid → backend returns 401 → error displayed

### Logout

```javascript
const handleLogout = () => {
  clearSession();      // Remove from localStorage
  setSession(null);    // Triggers re-render to LoginPage
};
```

### Protected Routes

- **Mechanism:** Conditional rendering based on `session?.accessToken`
- **No route guards:** Entire app is either login or dashboard
- **Role-based routing:** Dashboard component selected based on `user.role`
  - `SUPER_ADMIN` → `<DashboardPage>`
  - `ORG_ADMIN` → `<OrgAdminDashboard>`
  - Other roles → `<DashboardPage>` (default)

### Tenant Redirect Logic with Cross-Subdomain Session Transfer

**Files:** 
- [utils/tenant.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/utils/tenant.js)
- [utils/session.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/utils/session.js)

After successful login:
1. Extract `organizationSubdomain` from user object
2. Compare with current hostname
3. If different, construct new URL: `{protocol}//{subdomain}.{rootDomain}:{port}`
4. **Encode session data as base64 in URL query parameter**: `?session=eyJhY2Nlc3NUb2tlbiI6...`
5. Redirect via `window.location.assign()`
6. On target subdomain, `readSession()` decodes URL parameter and saves to localStorage
7. URL cleaned up automatically (session parameter removed)

**Why This Is Needed:**
- `localStorage` is **subdomain-specific**
- Session saved on `buggy.localhost` cannot be read on `ghoulhr.localhost`
- Encoding session in URL allows cross-subdomain session transfer

**Example:**
- Login on `buggy.localhost:5173` as SUPER_ADMIN
- User's org subdomain: `ghoulhr`
- Redirects to `ghoulhr.localhost:5173/?session=eyJ...`
- Session decoded and saved to `ghoulhr.localhost` localStorage
- URL cleaned to `ghoulhr.localhost:5173/`

---

## 9. Styling

### UI Library: Material UI (MUI) 7

**Theme Configuration:** [theme/appTheme.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/theme/appTheme.js)

```javascript
export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3f51e8' },
    background: { default: '#f4f7ff', paper: '#ffffff' },
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
});
```

### Styling Approach

1. **MUI sx prop:** Inline styles with theme access
   ```javascript
   <Card sx={{ border: '1px solid', borderColor: 'divider' }}>
   ```

2. **MUI System Props:** Spacing, layout, responsive design
   ```javascript
   <Grid size={{ xs: 12, sm: 6 }}>
   <Box sx={{ p: { xs: 2.5, md: 3.5 } }}>
   ```

3. **CSS Gradients:** Custom backgrounds for visual appeal
   ```javascript
   background: 'linear-gradient(160deg, #3f51e8 0%, #6577ff 100%)'
   ```

4. **Responsive Design:**
   - Mobile drawer (temporary)
   - Desktop drawer (permanent, 280px)
   - Grid breakpoints: `xs`, `sm`, `md`, `lg`

### Design System

- **Border Radius:** 14px (global)
- **Primary Color:** `#3f51e8` (indigo blue)
- **Background:** `#f4f7ff` (light blue-gray)
- **Typography:** Inter font family
- **Card Elevation:** 0 (flat design with borders)
- **Buttons:** Gradient fills, rounded corners

---

## 10. Environment Variables

**File:** [.env](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/.env)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_BASE_URL` | No | `http://localhost:8080` | Backend API URL (proxy port) |
| `VITE_BOOTSTRAP_ADMIN_KEY` | Yes | - | Secret key for SUPER_ADMIN bootstrap ([See backend](./BACKEND.md#bootstrap-super-admin-flow)) |

**API URL Configuration:**
The [appConfig.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/config/appConfig.js) file now implements dynamic API URL resolution:
- Detects subdomain from hostname (e.g., `buggy.localhost` → `buggy`)
- Routes requests through proxy on port 8080: `http://{subdomain}.localhost:8080`
- Falls back to `VITE_API_BASE_URL` or `http://localhost:8080`

**⚠️ Security Warning:** `VITE_BOOTSTRAP_ADMIN_KEY` is exposed in client-side code. Anyone can inspect the bundled JavaScript to retrieve this key. This is a **critical security issue** that should be addressed.

---

## 11. Run & Build

### Prerequisites
- Node.js (latest LTS recommended)
- npm

### Installation
```bash
cd frontend/ghoulhr
npm install
```

### Environment Setup
```bash
# .env file already exists with defaults
# Update VITE_API_BASE_URL if backend runs on different port
```

### Development
```bash
npm run dev          # Start Vite dev server (default: localhost:5173)
```

### Production Build
```bash
npm run build        # Build to dist/
npm run preview      # Preview production build
```

### Linting
```bash
npm run lint         # ESLint check
```

---

## 12. Conventions

### File Naming
- **Components:** PascalCase (e.g., `LoginPage.jsx`, `SidebarContent.jsx`, `DashboardLayout.jsx`)
- **Pages:** PascalCase with "Page" suffix (e.g., `OverviewPage.jsx`, `OrganizationsPage.jsx`)
- **Layouts:** PascalCase with "Layout" suffix (e.g., `DashboardLayout.jsx`)
- **Hooks:** camelCase with "use" prefix (e.g., `useSettings.js`)
- **Utilities:** camelCase (e.g., `session.js`, `tenant.js`, `settingsMapper.js`)
- **Services:** camelCase with "Api" suffix (e.g., `authApi.js`, `organizationsApi.js`, `settingsApi.js`)
- **Types:** camelCase with ".types" suffix (e.g., `settings.types.js`)

### Folder Structure
- `pages/` → Route-level components (one per route)
- `layouts/` → Layout wrapper components
- `components/` → Reusable UI components
- `hooks/` → Custom React hooks
- `services/` → API integration layer
- `utils/` → Pure utility functions
- `config/` → Configuration constants
- `theme/` → Styling configuration
- `types/` → JSDoc type definitions

### Component Structure
```javascript
// Props destructuring in function signature
export function ComponentName({ prop1, prop2, onAction }) {
  // State hooks
  const [state, setState] = useState(initialValue);
  
  // Derived state
  const computedValue = useMemo(() => { ... }, [dependencies]);
  
  // Effects
  useEffect(() => { ... }, [dependencies]);
  
  // Event handlers
  const handleAction = async () => { ... };
  
  // Render
  return ( ... );
}
```

### API Service Pattern
```javascript
export function functionName(accessToken, params) {
  return authorizedRequest('/endpoint', accessToken, {
    method: 'POST',
    body: JSON.stringify(params),
  });
}
```

### React Query Hook Pattern
```javascript
export function useFeatureName(accessToken, id) {
  const queryClient = useQueryClient();

  // Fetch data
  const { data, isLoading, error } = useQuery({
    queryKey: ['featureName', id],
    queryFn: () => fetchData(accessToken, id),
    enabled: !!accessToken && !!id,
  });

  // Update mutation
  const mutation = useMutation({
    mutationFn: (formData) => updateData(accessToken, id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['featureName', id] });
    },
  });

  return {
    data: data || {},
    isLoading,
    error,
    updateData: mutation.mutate,
    isUpdating: mutation.isPending,
  };
}
```

### Form Management Pattern (React Hook Form)
```javascript
export function FormPage() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      name: '',
      setting: 'value',
    },
  });

  const onSubmit = async (formData) => {
    await updateSettings(formData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('name', { required: 'Name is required' })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <Button type="submit">Save</Button>
    </form>
  );
}
```

---

## 13. Observations & Improvements

### ✅ Strengths
1. **Clean Service Layer:** API calls well-organized and reusable
2. **Responsive Design:** Mobile-first approach with MUI Grid
3. **Parallel Data Loading:** `Promise.all` for dashboard stats
4. **Error Handling:** User-friendly error messages from backend
5. **Tenant Awareness:** Automatic subdomain redirect after login
6. **Modern Stack:** React 19, Vite 7, MUI 7, React Router 7 (latest versions)
7. **Role-Based Dashboards:** Separate dashboards for SUPER_ADMIN and ORG_ADMIN
8. **Cross-Subdomain Session Transfer:** Session data preserved during subdomain redirects
9. **React Query Integration:** Automatic caching, background refetching, and mutations for settings
10. **React Hook Form:** Efficient form management with validation support
11. **Component Architecture:** Well-separated pages with single responsibilities
12. **Route-Based Navigation:** Proper URL-based routing enables bookmarking and deep linking
13. **Settings System:** Comprehensive organization settings with regional preferences, employee configuration, and attendance management
14. **Type Safety:** JSDoc type definitions in `types/settings.types.js`
15. **Tabbed Settings Interface:** Organized settings into logical tabs (Organization, Employees, Attendance)
16. **Dynamic Form Arrays:** `useFieldArray` for shift management with add/remove functionality
17. **Comprehensive Validation:** Time format validation, IP validation, required field checks
18. **Reusable Custom Hooks:** Consistent React Query pattern across all settings types

### 🚀 Architecture Improvements (Completed)
1. **React Router DOM:** Replaced internal state-based navigation with proper routing
2. **Component Decomposition:** Split 777-line `DashboardPage` into focused components:
   - `OverviewPage` (107 lines) - Stats and charts
   - `OrganizationsPage` (201 lines) - List and recycle bin
   - `OrganizationFormPage` (608 lines) - Create/Edit form
3. **Layout Pattern:** Introduced `DashboardLayout` for shared UI across routes
4. **Custom Hooks:** `useSettings` hook with React Query for data fetching (✅ Extended to `useEmployeeSettings` and `useAttendanceSettings`)
5. **Form Management:** `react-hook-form` for efficient form state and validation (✅ Extended with `useFieldArray` for dynamic shifts)

### ⚠️ UI/UX Issues
1. **No Loading Skeletons:** Dashboard shows spinner but no skeleton screens
2. **No Client-Side Validation:** Organization form lacks validation (except required fields)
3. **No Confirmation Dialogs:** Delete operations happen without confirmation
4. **No Success Messages:** Operations complete silently (only errors shown) - *Partially fixed in SettingsPage*
5. **Large Form Overwhelming:** 50+ fields in accordion may confuse users
6. **No Pagination:** Organization table shows all records

### 🚀 Performance Improvements
1. **~~Code Splitting:~~** ~~Use `React.lazy()` for DashboardPage~~ **DONE:** Routes are already separated into different components
2. **React Query/SWR:** ~~Replace manual data fetching~~ **DONE:** Settings uses React Query; Organizations could be migrated
3. **Debounce Search:** Add debounce to organization search input
4. **Memoize Components:** Wrap `SidebarContent` with `React.memo`
5. **Virtualization:** Use `@mui/x-data-grid` for large organization lists

### 🔒 Security Concerns
1. **Bootstrap Key Exposure:** `VITE_BOOTSTRAP_ADMIN_KEY` visible in source code
   - **Fix:** Remove from frontend; use backend-only bootstrap process
2. **No CSRF Protection:** Fetch requests don't include CSRF tokens
3. **XSS Risk:** Rendering `org.name` without sanitization (though React auto-escapes)
4. **No Token Refresh:** Users logged out after token expiry (8 hours default)

### 📐 Code Structure Suggestions
1. **~~Add React Router:~~** ~~Implement proper routing for sections~~ **DONE:** React Router 7 implemented
2. **~~Separate Form Component:~~** ~~Extract organization form~~ **DONE:** `OrganizationFormPage` created
3. **Custom Hooks:** Create `useOrganizations()`, `useAuth()` to match `useSettings()` pattern (✅ Partially done: employee and attendance settings hooks created)
4. **Constants File:** Move `emptyForm`, nav items to separate files
5. **TypeScript Migration:** Add type safety with `.tsx` files (JSDoc types already started)
6. **Environment-Specific Config:** Create `config/dev.js`, `config/prod.js`

### 🐛 Potential Bugs
1. **~~Tenant Redirect Loop:~~** ~~If subdomain already matches, returns `null`, but logic may cause issues on localhost~~ **FIXED:** Cross-subdomain session transfer implemented
2. **Edit Form State Leak:** Switching between edit and create may retain old form data
3. **No Error Boundary:** App crashes if unhandled error occurs in component tree
4. **useEffect Missing Dependencies:** `loadOrganizationsAndStats` has comment disabling exhaustive-deps rule

### 📝 Code Quality
- **Good:** Consistent formatting, meaningful variable names, proper prop passing, component separation
- **Needs Work:** Migrate organizations data fetching to React Query for consistency; add comprehensive error boundaries
- **Improved:** Comments explaining complex logic (React Query setup, tenant redirect, session transfer)
- **Testing:** No unit/integration tests present

### 🎯 Recommended Next Steps
1. **Immediate:** Remove `VITE_BOOTSTRAP_ADMIN_KEY` from frontend
2. **Short-term:** Add confirmation dialogs, form validation to OrganizationFormPage, success messages
3. **Medium-term:** Migrate organizations data to React Query, add debounce to search, implement error boundaries
4. **Long-term:** Migrate to TypeScript, add comprehensive test suite
5. **Backend Integration:** Implement ORG_ADMIN API endpoints for employees, attendance, payroll
6. **Settings Enhancements:** Add shift overlap detection, attendance rules engine, bulk import/export for settings
7. **Form Improvements:** Add loading skeletons, confirmation dialogs, undo functionality for settings changes
