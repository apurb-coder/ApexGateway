# ApexGateway: Frontend Architecture & Development Plan

This document details the refined frontend architecture and step-by-step development plan for the **ApexGateway Developer Portal and Marketplace**. 

It is tailored specifically to match the current backend implementation: a custom Express.js server using JWT auth (via `jsonwebtoken` and `bcryptjs`), a Prisma/PostgreSQL database, and a Redis-backed API gateway.

---

## 1. Overview & Tech Stack

The frontend will act as a developer portal, serving two primary roles: **API Consumers** (developers using APIs) and **API Providers** (developers publishing and monitoring APIs).

* **Framework:** ReactJS (Vite for rapid build times and hot module replacement)
* **Styling:** Tailwind CSS v4 (providing modern CSS variables and styling)
* **State Management:** Zustand (lightweight, reactive, and persistent state for auth and UI)
* **Routing:** React Router v6 (declarative routing with support for layout routes and protected routes)
* **Icons:** Lucide React (clean, consistent SVG icons)
* **Charts:** Recharts or Chart.js (responsive metrics visualization)
* **API Client:** Axios (configured with interceptors for JWT injection and centralized error handling)

---

## 2. Real-World Backend Constraints & Frontend Alignment

To avoid typical frontend-backend discrepancies, the following architecture constraints must be adhered to:

### A. Authentication
* **No Supabase Auth:** The backend utilizes a custom local JWT auth workflow. Registration expects `{ email, password, role }` at `/auth/register` and login expects `{ email, password }` at `/auth/login`.
* **JWT Storage:** The JWT returned by the backend must be stored securely in `localStorage` and managed via a persistent Zustand store (`useAuthStore`).
* **Roles:** The backend users are assigned a role of either `CONSUMER` or `PROVIDER`. The frontend must handle role-based navigation and route protection accordingly.

### B. Multi-Service API Layout
The frontend must communicate with two separate ports in development:
1. **Marketplace API (`http://localhost:3000`)**: Handles user authentication, API registration, pricing plan creation, subscribing, and retrieving subscription lists.
2. **Gateway API (`http://localhost:4000`)**: Acts as the proxy gateway. The frontend will only call this URL (with the matching path `/api/:apiName`) when testing APIs directly from the browser/details page using the client's API Key.

### C. One-Time API Key Delivery
* **Key Hashing:** The backend hashes API keys using SHA-256 before storing them (`apiKeyHash`). The raw key (`apx_live_...`) is **only returned once** in the response body of the subscription creation (`POST /subscriptions`).
* **UI Behavior:** When a consumer clicks "Subscribe", the frontend must display a **One-Time Copy Modal** showing the raw API key. It must explicitly warn the user that the key cannot be shown again.
* **Subscription Management:** Subsequent listings of subscriptions (`GET /subscriptions`) will not contain the key. The UI will show subscription details (active plan, limits, status) but will require key regeneration if the key is lost.

### D. Analytics & Health Checks (Redis & Prisma)
* **Current Backend State:** The gateway pushes logs to a Redis list (`queue:analytics`) and the database contains a `HealthCheck` model. However, there are currently no backend endpoints exposed to query this data for charts.
* **Frontend Strategy:**
  1. Set up responsive analytics charts (using Recharts) on the consumer dashboard (showing requests, latency, rate limits) and the provider dashboard (showing api uptime, pings).
  2. Implement local mocked datasets inside the dashboard components initially to support immediate visual validation.
  3. Detail backend extensions (e.g., a Redis queue consumer and analytical API endpoints) in the backend roadmap.

---

## 3. Global State & Context (Zustand)

Global state is split into two lightweight, single-purpose stores:

### `useAuthStore`
Manages user session, JWT token, and role authorization.
* **State:** `user` (id, email, role), `token` (JWT string), `isAuthenticated` (boolean).
* **Actions:** `login(userData, jwtToken)`, `logout()`, `updateProfile(updatedData)`.
* **Middleware:** Zustand `persist` middleware to sync auth status automatically with `localStorage`.

### `useUIStore`
Manages UI theme, layout toggles, and notification systems.
* **State:** `sidebarCollapsed` (boolean), `theme` ('light' | 'dark'), `toasts` (array of active toast notifications).
* **Actions:** `toggleSidebar()`, `setTheme(theme)`, `addToast(message, type)`, `removeToast(id)`.

---

## 4. Page Routes & Layout Structure

### Public Routes
* `/` (Landing Page) — Value proposition, interactive Gateway pricing, CTA to explore APIs.
* `/login` (Sign In) — Login form, role detection, redirection.
* `/signup` (Sign Up) — Form with Email, Password, and Role selection (`CONSUMER` vs. `PROVIDER`).

### Consumer Protected Routes (Role: `CONSUMER`)
* `/marketplace` — Browse and search all published APIs.
* `/marketplace/:apiId` — API Details page, pricing plans, and "Subscribe" action.
* `/dashboard/consumer/keys` — Active subscriptions, status, and instructions for gateway usage.
* `/dashboard/consumer/analytics` — Consumer request metrics, latency charts, and rate limit hits.

### Provider Protected Routes (Role: `PROVIDER`)
* `/dashboard/provider/apis` — List of published APIs with status badges (`ACTIVE`, `INACTIVE`, `DEGRADED`).
* `/dashboard/provider/apis/new` — Publish form to register API name, upstream URL, and description.
* `/dashboard/provider/apis/:apiId/plans/new` — Define subscription plans (name, requests per minute, price) for an API.
* `/dashboard/provider/apis/:apiId/health` — Provider's service health dashboard showing mock latency/uptime graphs.
* `/dashboard/provider/apis/:apiId/consumers` — Subscriptions and consumers dashboard.

### Shared Routes
* `/settings/profile` — Profile overview, change password (mocked).

---

## 5. API Integration & Interceptor Strategy

A centralized Axios instance (`src/services/api.js`) will manage HTTP communications:

```javascript
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_MARKETPLACE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token into Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Centralized error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const { status, data } = error.response || {};
    const addToast = useUIStore.getState().addToast;

    if (status === 401) {
      // Token expired or invalid -> clear store and redirect
      useAuthStore.getState().logout();
      addToast('Session expired. Please log in again.', 'error');
    } else if (status === 429) {
      addToast('Rate limit exceeded! Please wait a moment.', 'warning');
    } else {
      addToast(data?.error || 'An unexpected error occurred.', 'error');
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## 6. Premium UI/UX Design Directives
To deliver a high-end interface that reflects ApexGateway's performance:
* **Dark Mode Core:** Implement a modern dark-first theme (using slate, charcoal, and dark-blue tones) with vibrant accent glows (emerald for active/healthy, rose for rate limits/errors, violet for branding highlights).
* **Visual Polish:** Incorporate card hover-scales, micro-interactions on button click, loading skeleton states for API grids/tables, and smooth page transition animations.
* **Documentation & Console:** Build an interactive API tester console inside the marketplace details page where users can input parameters and test their subscriptions against the Gateway (`localhost:4000`) in real time.

---
---

# ApexGateway: Frontend Implementation TODO List

This TODO list defines the precise phases to build out the frontend portal.

## Phase 1: Project Setup & Tools Installation
- [x] Initialize a React Vite application inside the `client` folder.
  ```bash
  npm create vite@latest client -- --template react
  ```
- [x] Install essential development dependencies:
  * Zustand (`zustand`)
  * Axios (`axios`)
  * React Router (`react-router-dom`)
  * Lucide Icons (`lucide-react`)
  * Charts (`recharts`)
- [x] Set up Tailwind CSS v4 in the project. Configure the post-css plugins or Vite configuration as per Tailwind v4 directives.
- [x] Establish standard directory structure:
  ```
  client/src/
  ├── assets/
  ├── components/      # Reusable UI components (Buttons, Inputs, Modals, Cards)
  ├── hooks/           # Custom React hooks
  ├── layouts/         # Layout shells (DashboardLayout, AuthLayout)
  ├── pages/           # Page views (Marketplace, Login, Dashboard, etc.)
  ├── services/        # Axios API client instances
  ├── store/           # Zustand state files (useAuthStore.js, useUIStore.js)
  └── index.css        # Global CSS variables and tailwind imports
  ```
- [x] Add `.env` file configuration in `client/` pointing to endpoints:
  * `VITE_MARKETPLACE_API_URL=http://localhost:3000`
  * `VITE_GATEWAY_API_URL=http://localhost:4000`

## Phase 2: Core State & Interceptors Setup
- [x] Implement `src/store/useAuthStore.js` with persistence to local storage.
- [x] Implement `src/store/useUIStore.js` with toast notification queue management.
- [x] Write `src/services/api.js` creating the Axios instance with request and response interceptors.
- [x] Define global toast container component to render alerts.

## Phase 3: Routing & Auth Implementation
- [x] Configure `src/App.jsx` with React Router routing structure.
- [x] Create route-guards:
  * `ProtectedRoute.jsx`: Redirects unauthenticated users to `/login`. Optionally verifies role matches the user's role.
  * `PublicRoute.jsx`: Redirects authenticated users away from `/login`/`/signup` directly to the dashboard.
- [x] Build `/signup` page. Ensure user can select their role (`CONSUMER` vs `PROVIDER`). Integrate with `/auth/register` API.
- [x] Build `/login` page. Hook up to `/auth/login` API, write JWT token and user info into `useAuthStore`, and redirect based on role.

## Phase 4: Layout & Shared Dashboard Shell
- [x] Build `DashboardLayout` shell containing:
  * Persistent Sidebar navigation (collapsible).
  * Header showing breadcrumbs, user profile dropdown, and Theme toggle.
  * Main content container with smooth animations.
- [x] Dynamically populate sidebar navigation links depending on the authenticated user's role:
  * **Provider Links:** Published APIs, New API Form, Health Checks, Consumer Subscriptions.
  * **Consumer Links:** API Marketplace, Keys & Subscriptions, Analytics.
- [x] Implement profile settings page `/settings/profile` for viewing current user email and role.

## Phase 5: Consumer Portal Features
- [x] **Marketplace Browser (`/marketplace`)**:
  * Implement list/grid view displaying all APIs retrieved from `GET /apis`.
  * Add search inputs to filter APIs by name and description.
- [x] **API Detail Page (`/marketplace/:apiId`)**:
  * Render API specifications, description, and list of subscription plans.
  * Build the **"Subscribe" Flow**:
    * Post subscription request to `POST /subscriptions` with `planId`.
    * On success, trigger the **One-Time Key Modal** displaying the raw `apiKey`.
    * Add a "Copy to Clipboard" button and strong warning message.
  * Build an interactive API Console where consumers can test invoking the endpoint through the gateway (`http://localhost:4000/api/:apiName`) with header input for `X-API-Key`.
- [x] **My Keys & Subscriptions (`/dashboard/consumer/keys`)**:
  * List all subscriptions returned from `GET /subscriptions`.
  * Render active status badges and associated plan details.
- [x] **Consumer Analytics (`/dashboard/consumer/analytics`)**:
  * Construct analytics page using Recharts.
  * Provide visual graphs tracking request counts, latencies, and 429 rate-limiting events (mocked, matching gateway metrics).

## Phase 6: Provider Portal Features
- [x] **My Published APIs (`/dashboard/provider/apis`)**:
  * Render a clean dashboard table showing APIs published by the user (`GET /apis` filtered or dedicated provider endpoints).
  * Show API status badges (Active, Degraded, Inactive).
- [x] **New API Form (`/dashboard/provider/apis/new`)**:
  * Build form with validations for Name, Description, and Upstream URL.
  * Integrate with `POST /apis` backend route.
- [x] **Manage Plans (`/dashboard/provider/apis/:apiId/plans/new`)**:
  * Form to create plans for the specified API (`POST /apis/:apiId/plans`).
  * Include validation for Plan Name, Requests Per Minute, and Price.
- [x] **API Health Dashboard (`/dashboard/provider/apis/:apiId/health`)**:
  * Create uptime percentage monitors, latency histograms, and latency-over-time lines (mocked/simulated with fallback).
- [x] **Consumer Subscriptions (`/dashboard/provider/apis/:apiId/consumers`)**:
  * Fetch and list subscriptions belonging to the provider's API (`GET /subscriptions` with role checks).
  * Display consumer emails and subscription creation timestamps.

## Phase 7: Polish, Transitions & Validation
- [x] Refine the typography using a clean font like Inter or Outfit.
- [x] Apply smooth micro-animations to all interactive components (buttons, links, tables) using standard CSS transitions.
- [x] Verify error states and validation error messages match what the backend sends.
- [x] Validate rate limit triggers: verify that hitting the Gateway's rate limits triggers the expected 429 toast alert on the frontend.
