# Frontend Documentation

## 1. Overview

The GhoulHRMS frontend is a **React-based single-page application (SPA)** that provides role-based dashboards for managing multi-tenant HR organizations. It handles authentication, tenant-based routing, role-based dashboard routing, and organization CRUD operations through a modern Material UI interface.

**Tech Stack:**
- **Framework:** React 19
- **Build Tool:** Vite 7
- **UI Library:** Material UI (MUI) 7
- **Styling:** Emotion (MUI's default)
- **HTTP Client:** Native Fetch API
- **State Management:** React hooks (useState, useMemo, useEffect)
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
│   ├── pages/
│   │   ├── DashboardPage.jsx              # Super Admin dashboard (777 lines)
│   │   ├── LoginPage.jsx                  # Authentication page
│   │   └── OrgAdminDashboard.jsx          # Organization Admin dashboard (400 lines)
│   ├── services/
│   │   ├── authApi.js                     # Authentication API calls
│   │   ├── organizationsApi.js            # Organization API calls
│   │   └── orgAdminApi.js                 # Organization Admin API calls
│   ├── theme/
│   │   └── appTheme.js                    # MUI theme configuration
│   ├── utils/
│   │   ├── session.js                     # LocalStorage session management
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
<App> (Auth state manager & role-based routing)
├── <LoginPage> (if not authenticated)
│   ├── Tabs (Super Admin / Employee modes)
│   ├── Email/Password form
│   └── Submit → calls authApi.js
│
└── Role-Based Dashboard Routing (if authenticated)
    ├── SUPER_ADMIN → <DashboardPage>
    │   ├── AppBar (top navigation)
    │   ├── SidebarContent (reusable drawer)
    │   └── Main Content
    │       ├── Overview Section (stats cards, growth chart)
    │       └── Organizations Section
    │           ├── Create/Edit Form (accordion-based)
    │           ├── Organizations Table
    │           └── Recycle Bin Table
    │
    └── ORG_ADMIN → <OrgAdminDashboard>
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
2. **Container/Presentational:** `App.jsx` manages state, pages render UI
3. **Service Layer Pattern:** API calls isolated in `services/*.js` files
4. **Custom Hooks Alternative:** Using plain functions in `utils/` for session/tenant logic

---

## 4. Routing

**No client-side router (React Router) is used.** Routing is handled through:

1. **Auth-based conditional rendering:**
   - No session → `<LoginPage>`
   - Valid session → Role-based dashboard routing

2. **Role-based dashboard routing:**
   - `user.role === 'SUPER_ADMIN'` → `<DashboardPage>`
   - `user.role === 'ORG_ADMIN'` → `<OrgAdminDashboard>`
   - Other roles → `<DashboardPage>` (default)

3. **Section-based navigation (internal state):**
   - `activeSection` state controls dashboard sections
   - SUPER_ADMIN values: `'overview'`, `'organizations'`, `'users'`, `'billing'`, `'settings'`
   - ORG_ADMIN values: `'overview'`, `'employees'`, `'attendance'`, `'payroll'`, `'organization'`

4. **Tenant subdomain redirects with session transfer:**
   - After login, redirects to `{subdomain}.ghoulhr.com` via `window.location.assign()`
   - Session data encoded in URL parameters for cross-subdomain transfer
   - Logic in [tenant.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/utils/tenant.js) and [session.js](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/utils/session.js)

**Current Limitation:** Only `overview` and `organizations` sections are implemented for SUPER_ADMIN; `overview` section implemented for ORG_ADMIN; other sections show placeholder content.

---

## 5. Components

### Page Components

| Component | File | Purpose | Lines |
|-----------|------|---------|-------|
| LoginPage | [pages/LoginPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/LoginPage.jsx) | Email/password authentication form | 221 |
| DashboardPage | [pages/DashboardPage.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/DashboardPage.jsx) | Super Admin dashboard with org management | 777 |
| OrgAdminDashboard | [pages/OrgAdminDashboard.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/pages/OrgAdminDashboard.jsx) | Organization Admin dashboard | 400 |

### Reusable Components

| Component | File | Purpose |
|-----------|------|---------|
| SidebarContent | [components/layout/SidebarContent.jsx](file:///d:/Web%20dev/ghoulhr/frontend/ghoulhr/src/components/layout/SidebarContent.jsx) | Navigation sidebar with user info |

### Component Breakdown

**SidebarContent:**
- Props: `user`, `navItems`, `onItemClick`
- Displays GhoulHRMS branding, navigation list, user email/role chip
- Used in both permanent (desktop) and temporary (mobile) drawers

**LoginPage:**
- Props: `mode`, `setMode`, `form`, `onFieldChange`, `onSubmit`, `loading`, `error`
- Two-tab interface: "Super Admin" / "Employee/Admin"
- Gradient background with marketing features list
- Password visibility toggle

**DashboardPage (SUPER_ADMIN):**
- Props: `accessToken`, `user`, `userName`, `mobileDrawerOpen`, `onOpenMobileDrawer`, `onCloseMobileDrawer`, `onLogout`
- Responsive layout with fixed drawer (280px width)
- Accordion-based organization form (6 sections, 50+ fields)
- Searchable organization table
- Recycle bin for soft-deleted organizations
- Dashboard stats with progress bars

**OrgAdminDashboard (ORG_ADMIN):**
- Props: `accessToken`, `user`, `userName`, `mobileDrawerOpen`, `onOpenMobileDrawer`, `onCloseMobileDrawer`, `onLogout`
- Organization-specific dashboard with branded welcome banner
- Stats cards: Total Employees, Present Today, Pending Payroll, Active Departments
- Quick action cards: Add Employee, Mark Attendance, Process Payroll, Org Settings
- Recent activity feed
- Role indicator showing "Organization Admin Panel"

---

## 6. State Management

**Approach:** React built-in hooks (no Redux/Zustand)

### Global State (App.jsx)

```javascript
const [session, setSession] = useState(() => readSession());  // From localStorage or URL
const [mode, setMode] = useState('superadmin');
const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [form, setForm] = useState({ email: '', password: '' });
const userRole = user?.role;  // Used for role-based dashboard routing
```

### Role-Based Dashboard Routing (App.jsx)

```javascript
const renderDashboard = () => {
  const dashboardProps = { /* ... */ };
  
  // Route to different dashboards based on user role
  if (userRole === 'ORG_ADMIN') {
    return <OrgAdminDashboard {...dashboardProps} />;
  }
  
  // Default to Super Admin dashboard for SUPER_ADMIN and other roles
  return <DashboardPage {...dashboardProps} />;
};
```

### Dashboard State (DashboardPage.jsx)

```javascript
const [activeSection, setActiveSection] = useState('overview');
const [organizations, setOrganizations] = useState([]);
const [deletedOrganizations, setDeletedOrganizations] = useState([]);
const [stats, setStats] = useState({ totalOrganizations: 0, totalUsers: 0, ... });
const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState('');
const [search, setSearch] = useState('');
const [editingOrganizationId, setEditingOrganizationId] = useState(null);
const [createForm, setCreateForm] = useState(emptyOrganizationForm);
const [isCreating, setIsCreating] = useState(false);
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

### Data Loading Pattern

```javascript
// DashboardPage.jsx:167-193
const loadOrganizations = async () => {
  const [organizationsResponse, deletedOrganizationsResponse, statsResponse] = await Promise.all([
    listOrganizations(accessToken),
    listDeletedOrganizations(accessToken),
    getSuperAdminDashboardStats(accessToken),
  ]);
  // ...
};

useEffect(() => {
  loadOrganizations();
}, [accessToken, isSuperAdmin]);
```

**Note:** Uses `Promise.all` for parallel requests to improve performance.

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
| `VITE_API_BASE_URL` | No | `http://localhost:3000` | Backend API URL |
| `VITE_BOOTSTRAP_ADMIN_KEY` | Yes | - | Secret key for SUPER_ADMIN bootstrap ([See backend](./BACKEND.md#bootstrap-super-admin-flow)) |

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
- **Components:** PascalCase (e.g., `LoginPage.jsx`, `SidebarContent.jsx`)
- **Utilities:** camelCase (e.g., `session.js`, `tenant.js`)
- **Services:** camelCase with "Api" suffix (e.g., `authApi.js`, `organizationsApi.js`)

### Folder Structure
- `pages/` → Route-level components
- `components/` → Reusable UI components
- `services/` → API integration layer
- `utils/` → Pure utility functions
- `config/` → Configuration constants
- `theme/` → Styling configuration

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

---

## 13. Observations & Improvements

### ✅ Strengths
1. **Clean Service Layer:** API calls well-organized and reusable
2. **Responsive Design:** Mobile-first approach with MUI Grid
3. **Parallel Data Loading:** `Promise.all` for dashboard stats
4. **Error Handling:** User-friendly error messages from backend
5. **Tenant Awareness:** Automatic subdomain redirect after login
6. **Modern Stack:** React 19, Vite 7, MUI 7 (latest versions)
7. **Role-Based Dashboards:** Separate dashboards for SUPER_ADMIN and ORG_ADMIN
8. **Cross-Subdomain Session Transfer:** Session data preserved during subdomain redirects

### ⚠️ UI/UX Issues
1. **No Loading Skeletons:** Dashboard shows spinner but no skeleton screens
2. **No Form Validation:** Organization form has no client-side validation
3. **No Confirmation Dialogs:** Delete operations happen without confirmation
4. **No Success Messages:** Operations complete silently (only errors shown)
5. **Large Form Overwhelming:** 50+ fields in accordion may confuse users
6. **No Pagination:** Organization table shows all records

### 🚀 Performance Improvements
1. **Code Splitting:** Use `React.lazy()` for DashboardPage
   ```javascript
   const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
   ```
2. **React Query/SWR:** Replace manual data fetching with caching library
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
1. **Add React Router:** Implement proper routing for sections
   ```javascript
   <Routes>
     <Route path="/" element={<Overview />} />
     <Route path="/organizations" element={<Organizations />} />
   </Routes>
   ```
2. **Separate Form Component:** Extract organization form to `components/forms/OrganizationForm.jsx`
3. **Custom Hooks:** Create `useOrganizations()`, `useAuth()`, `useDashboardStats()`
4. **Constants File:** Move `emptyOrganizationForm`, `navItems` to separate files
5. **TypeScript Migration:** Add type safety with `.tsx` files and PropTypes
6. **Environment-Specific Config:** Create `config/dev.js`, `config/prod.js`

### 🐛 Potential Bugs
1. **~~Tenant Redirect Loop:~~** ~~If subdomain already matches, returns `null`, but logic may cause issues on localhost~~ **FIXED:** Cross-subdomain session transfer implemented
2. **Edit Form State Leak:** Switching between edit and create may retain old form data
3. **No Error Boundary:** App crashes if unhandled error occurs in component tree
4. **useEffect Missing Dependencies:** `loadOrganizations` has comment disabling exhaustive-deps rule

### 📝 Code Quality
- **Good:** Consistent formatting, meaningful variable names, proper prop passing
- **Needs Work:** 777-line DashboardPage should be split into smaller components; OrgAdminDashboard needs backend integration
- **Missing:** No comments explaining complex logic (e.g., tenant redirect, session transfer)
- **Testing:** No unit/integration tests present

### 🎯 Recommended Next Steps
1. **Immediate:** Remove `VITE_BOOTSTRAP_ADMIN_KEY` from frontend
2. **Short-term:** Add confirmation dialogs, success messages, form validation
3. **Medium-term:** Implement React Router, code splitting, React Query
4. **Long-term:** Migrate to TypeScript, add comprehensive test suite
5. **Backend Integration:** Implement ORG_ADMIN API endpoints for employees, attendance, payroll
