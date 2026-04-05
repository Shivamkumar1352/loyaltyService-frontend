# WalletPay — Project Guide

This document explains **what** WalletPay is, **where** the code lives, **why** key technical choices were made, and **how** user flows, API integration, and navigation work end to end. It is intended for developers onboarding to the repo or reviewing the system architecture.

---

## 1. What is this project?

**WalletPay** is a **single-page web application (SPA)** that implements the **user-facing and admin-facing frontends** for a digital wallet product. It talks to a **backend API gateway** (documented in the root `README.md` as `http://localhost:8080`) which routes traffic to microservices: auth, users/KYC, wallet/payments, rewards, and admin operations.

The app is **not** a standalone wallet engine: balances, transfers, Razorpay orders, KYC state, and admin actions are all **persisted and enforced on the server**. This repo owns **presentation, client-side state, routing, and HTTP orchestration**.

---

## 2. Why this tech stack?

| Concern | Choice | Rationale |
|--------|--------|-----------|
| UI | React 18 | Component model, ecosystem, hiring familiarity |
| Build / dev | Vite | Fast HMR, simple config, ESM-native |
| Styling | Tailwind CSS + CSS variables | Utility-first layout; theme tokens in `src/styles/index.css` for light/dark |
| Routing | React Router v6 | Nested layouts, declarative guards |
| Global state | Zustand + `persist` | Minimal boilerplate; auth/theme/notifications survive reloads |
| Forms | React Hook Form | Validation and controlled flows without heavy rerenders |
| HTTP | Axios | Interceptors for JWT attach and refresh |
| Charts | Recharts | User analytics and admin KPI visualizations |
| Feedback | react-hot-toast | Non-blocking success/error messages |
| Icons | Lucide React | Consistent icon set |

---

## 3. Repository layout (where things live)

```
src/
├── main.tsx                 # App mount: Router, ErrorBoundary, Toaster
├── App.tsx                  # Route table, lazy routes, ProtectedRoute / PublicRoute
├── core/
│   └── api/index.ts         # Axios instance, interceptors, API namespaces
├── store/index.ts           # Zustand: theme, auth, notifications (persisted)
├── layouts/
│   ├── AppLayout.tsx        # End-user shell: sidebar, topbar, logout
│   └── AdminLayout.tsx      # Admin shell: nav, back to app
├── features/                # Screen-level modules (co-located UI + data fetching)
│   ├── auth/                # Login, Signup, ForgotPassword, authUtils
│   ├── dashboard/
│   ├── wallet/              # AddMoney, Transfer
│   ├── rewards/
│   ├── transactions/
│   ├── profile/
│   ├── analytics/
│   └── admin/
├── shared/
│   ├── components/          # Table, Modal, Badge, Pagination, NotificationBell, …
│   ├── hooks/               # e.g. useDebouncedValue
│   └── utils/               # fmt (INR, dates), cn, statusClass
├── styles/index.css         # Tailwind layers, design tokens, component classes
└── test/setup.ts            # Vitest / Testing Library setup
```

**Path alias:** `@/*` → `src/*` (`tsconfig.json`, `vite.config.js`).

---

## 4. How the app boots and renders

1. **`main.tsx`** mounts the root with `BrowserRouter`, wraps the tree in **`ErrorBoundary`**, and registers **`Toaster`** (global toasts).
2. **`App.tsx`** calls **`useThemeStore().init()`** once so the saved or OS **dark/light** preference applies (`dark` class on `document.documentElement`).
3. **`Routes`** define **public** routes (`/login`, `/signup`, `/forgot-password`) and **nested** routes under **`AppLayout`** (user) and **`AdminLayout`** (admin).
4. Feature screens are **`lazy()` loaded** with a **`Suspense`** fallback spinner to keep the initial bundle smaller.

---

## 5. Authentication and authorization

### 5.1 Client-side auth state

**File:** `src/store/index.ts`

- **`useAuthStore`** persists `user`, `accessToken`, `refreshToken`, and `isAuthenticated`.
- **`setAuth`** is called after successful login/signup/OTP verification.
- **`logout`** clears tokens and user.
- **`updateToken` / `setTokens`** support refresh flows.

### 5.2 Route guards

**File:** `src/App.tsx`

- **`ProtectedRoute`**: If not authenticated → redirect to `/login`. If `adminOnly` and `user.role !== 'ADMIN'` → redirect to `/dashboard`.
- **`PublicRoute`**: If already authenticated → redirect to `/dashboard` (prevents seeing login while logged in).
- Unknown paths (`*`) → `/login`.

**Note:** True security is server-side (JWT validation, role checks). The guards only improve UX and hide admin URLs from normal users.

### 5.3 Login modes

**File:** `src/features/auth/Login.tsx`

- **Password login:** Single “identifier” field is normalized via **`normalizeIdentifier`** (`src/features/auth/authUtils.ts`):
  - Contains `@` → treated as **email** → `POST /api/auth/login`
  - Otherwise digits (≥10) → **phone** → `POST /api/auth/login/phone`
- **OTP login:** Send OTP → verify OTP; uses the same identifier rules with `sendOtp` / `verifyOtp`.
- On success, **`doSetAuthFromResponse`** unwraps `res.data.data` or `res.data`, then **`setAuth`**, then navigates to **`/admin/dashboard`** if `user.role === 'ADMIN'`, else **`/dashboard`**.

Signup and forgot-password screens follow the same API modules in `authAPI` (see API section).

### 5.4 Logout

**File:** `src/layouts/AppLayout.tsx`

- Calls **`authAPI.logout`** with `refreshToken` (errors ignored), then **`logout()`** in the store and navigate to `/login`.

---

## 6. HTTP client: how API calls work

**File:** `src/core/api/index.ts`

### 6.1 Base URL

- `BASE_URL = import.meta.env.VITE_API_BASE_URL || ''`
- In development, leaving this empty means requests like `/api/...` hit the **Vite dev server**, which **proxies** `/api` → `http://localhost:8080` (`vite.config.js`).

### 6.2 Request interceptor

For every request, if present:

- `Authorization: Bearer <accessToken>`
- `X-User-Id`, `X-UserRole` / `X-User-Role`, `X-UserEmail`

These headers support backends that expect user context beyond JWT decoding (implementation-dependent).

### 6.3 Response interceptor and token refresh

- On **401**, for requests that are not already retry, not `/api/auth/refresh`, and not `/api/auth/logout`:
  - Calls **`refreshAccessToken()`** → `POST /api/auth/refresh` with stored `refreshToken`
  - On success, updates tokens via **`setTokens`**, retries the original request
  - On failure → **`logout()`** and full-page redirect to `/login`
- On **network errors** (no `response`): throttled toast (“Network error…”).

### 6.4 API surface (grouped modules)

| Module | Purpose |
|--------|---------|
| `authAPI` | login, phone login, signup, OTP, forgot password, reset, refresh, logout |
| `userAPI` | profile get/update |
| `kycAPI` | multipart submit, status |
| `walletAPI` | balance, transactions, ledger, statement, transfer, withdraw, payment order + verify |
| `rewardsAPI` | summary, catalog, reward transactions, redeem, redeem-points |
| `rewardsAdminAPI` | admin catalog CRUD |
| `adminAPI` | dashboard KPIs, user list/search, block/unblock, role, KYC queue approve/reject, add reward |

Exact paths match the gateway contract described in `README.md`.

---

## 7. Layouts and navigation

### 7.1 User app (`AppLayout`)

**File:** `src/layouts/AppLayout.tsx`

- **Sidebar:** Dashboard, Add Money, Transfer, Rewards, Transactions, Analytics, Profile/KYC.
- **Admin link:** Shown only if `user.role === 'ADMIN'` → `/admin/dashboard`.
- **Topbar:** `NotificationBell`, theme toggle.
- **Responsive:** Mobile hamburger, overlay, slide-in sidebar.
- **Main:** `Outlet` renders the active child route.

### 7.2 Admin (`AdminLayout`)

**File:** `src/layouts/AdminLayout.tsx`

- Nav: Dashboard, Users, KYC Review, Rewards; **Back to App** → `/dashboard`.
- Same topbar pattern (notifications + theme).

---

## 8. Features: how each area works

### 8.1 Dashboard

**File:** `src/features/dashboard/Dashboard.tsx`

- Parallel fetch: **balance**, **rewards summary**, **recent transactions** (`Promise.allSettled` for partial failure tolerance).
- Displays balance card (with hide/show), quick actions, rewards tier/summary, recent txn list with type icons.

### 8.2 Add Money (Razorpay)

**File:** `src/features/wallet/AddMoney.tsx`

1. Loads Razorpay Checkout script (`checkout.js`).
2. **`walletAPI.createOrder(amount)`** → backend creates order; response drives Razorpay `options` (`key` from **`VITE_RAZORPAY_KEY_ID`**).
3. On **`handler`**, **`walletAPI.verifyPayment`** sends Razorpay ids/signature to the backend.
4. Success path: optional **`PaymentSuccessOverlay`**, **`useNotificationStore.add`** for in-app notification.
5. Modal dismiss resets UI state.

### 8.3 Transfer / Withdraw

**File:** `src/features/wallet/Transfer.tsx`

- **Steps:** form → confirm → success/fail.
- **Transfer:** `walletAPI.transfer` with `receiverId`, `amount`, `description`, **`idempotencyKey`** (client-generated) to avoid duplicate submits on retry.
- **Withdraw:** `walletAPI.withdraw`.
- Uses **`PaymentSuccessOverlay`** and notifications on success.

### 8.4 Transactions

**File:** `src/features/transactions/Transactions.tsx`

- Tabs: **transactions** vs **ledger** (different endpoints / semantics from backend).
- Pagination, client-side filters on loaded page (type/status), statement **preview** and **CSV download** via `getStatement` / `downloadStatement`.
- Dispute UI via modal (implementation continues below the excerpt; uses `walletAPI` / UX patterns consistent with the file).

### 8.5 Profile and KYC

**File:** `src/features/profile/Profile.tsx`

- Loads **profile** and **KYC status** in parallel.
- Profile save: **`userAPI.updateProfile`**, then **`setAuth`** to sync `name`/`phone` in persisted auth user.
- KYC: builds **`FormData`**, **`kycAPI.submit`** with query `docType` & `docNumber`.

### 8.6 Rewards

**File:** `src/features/rewards/Rewards.tsx`

- Loads summary, catalog, paginated reward transactions.
- **Scratch card** UX via **`ScratchCard`** + **`rewardsAPI.redeem`**; handles cashback amount in response when present.
- **Points to cash:** `rewardsAPI.redeemPoints`.
- Notifications on successful redemption paths.

### 8.7 Analytics (user)

**File:** `src/features/analytics/Analytics.tsx`

- Fetches wallet transactions, ledger, reward transactions (larger page sizes).
- Aggregates in the client (e.g. last 7 days series, pie splits) and renders **Recharts** (area/bar/pie).
- Optional polling (`POLL_MS`) for near-live refresh.

### 8.8 Admin Dashboard

**File:** `src/features/admin/AdminDashboard.tsx`

- **`adminAPI.getDashboard`** → KPIs for charts (KYC breakdown, users, reward metrics).
- Modal flow to **`adminAPI.addRewardItem`** for quick catalog additions from the dashboard.

### 8.9 Admin Users

**File:** `src/features/admin/AdminUsers.tsx`

- Listing with filters; search debounced via **`useDebouncedValue`**.
- Search modes: generic search, email, phone, KYC status list.
- Row actions: block/unblock, role change modal, KYC approve/reject helpers where wired.
- **`getUsersFromResponse`** normalizes multiple backend response shapes into `{ content, number, totalPages }`.

### 8.10 Admin KYC

**File:** `src/features/admin/AdminKyc.tsx`

- Paginated **`getPendingKyc`**, approve/reject with reason for reject.

### 8.11 Admin Rewards catalog

**File:** `src/features/admin/AdminRewards.tsx`

- **`rewardsAdminAPI.getCatalog`** for admin listing.
- Edit/update, delete, add (uses **`adminAPI.addRewardItem`** and/or admin rewards endpoints as implemented).

---

## 9. Shared UI and design system

### 9.1 Design tokens

**File:** `src/styles/index.css`

- **CSS variables** for backgrounds, text, border, brand colors.
- **`.dark`** overrides tokens; theme toggle flips `document.documentElement` class via Zustand.

### 9.2 Shared components

**File:** `src/shared/components/index.tsx`

- **`Skeleton`**, **`Badge`**, **`Modal`**, **`EmptyState`**, **`StatCard`**, **`Pagination`**, **`Table`** — used across features for consistent loading and data display.

**Other:** `NotificationBell`, `PaymentSuccessOverlay`, `ScratchCard`, `ErrorBoundary`.

### 9.3 Utilities

**File:** `src/shared/utils/index.ts`

- **`fmt.currency`**, **`fmt.date`**, **`fmt.datetime`**, **`fmt.initials`** — India locale (`en-IN`, INR).
- **`statusClass`** maps backend statuses to badge styles.

---

## 10. Notifications (client-side)

**Files:** `src/store/index.ts`, `src/shared/components/NotificationBell.tsx`

- **`useNotificationStore`**: persisted list (max 50); **`add`**, **`remove`**, **`clear`**.
- Features such as Add Money and Transfer **`add`** items on success (title, message, severity, optional `href`).
- Bell dropdown lists items with timestamps (`fmt.datetime`), links, clear/remove actions, click-outside and Escape to close.

These notifications are **local to the browser**; they are not server push unless extended.

---

## 11. Testing

- **Runner:** Vitest (`npm test`), **`environment: 'jsdom'`**, setup in `src/test/setup.ts`.
- **Example:** `src/features/auth/authUtils.test.ts` covers **`normalizeIdentifier`**.

---

## 12. Environment variables

| Variable | Purpose |
|---------|---------|
| `VITE_API_BASE_URL` | Production (or custom) API origin; omit in dev to use Vite proxy |
| `VITE_RAZORPAY_KEY_ID` | Razorpay Checkout public key |

Use `.env.local` (see root `README.md`).

---

## 13. Build and scripts

| Script | Command |
|--------|---------|
| Dev server | `npm run dev` |
| Production build | `npm run build` |
| Preview build | `npm run preview` |
| Lint | `npm run lint` |
| Tests | `npm run test` |

---

## 14. Frontend implementation & evaluation guidelines (mapping)

The checklist below mirrors common **production-oriented React** evaluation criteria. For each area: **where** it lives in WalletPay and **how** it is implemented (or intentionally out of scope).

| # | Guideline area | Where / how in WalletPay |
|---|----------------|---------------------------|
| **1** | **Overview — scalable, maintainable, production-ready** | Vertical **feature folders** (`src/features/*`), single **API layer** (`src/core/api/index.ts`), **guarded routes** (`src/App.tsx`), **env-based** API URL and Razorpay key ([§12](#12-environment-variables)). |
| **2** | **Architecture & code quality** | **Feature-based layout** (see [§3](#3-repository-layout-where-things-live)); **shared** UI/hooks/utils under `src/shared/*`; **layouts** separate shell from pages; naming follows React/file conventions (`PascalCase` components, `useX` hooks). |
| **3** | **API integration & data handling** | **Axios** with `api` instance; **centralized** `authAPI`, `walletAPI`, etc. in `src/core/api/index.ts`; **interceptors** attach JWT + user headers, **refresh on 401**, **throttled** network toasts; screens own **loading / success / error** UI (e.g. `Dashboard` `Promise.allSettled`, forms with local state). |
| **4** | **Authentication & authorization** | **JWT** in Zustand `useAuthStore` (persisted): `accessToken`, `refreshToken`, `user` ([§5.1](#51-client-side-auth-state)); **login** password + OTP paths (`Login.tsx`, `authUtils.ts`); **route guards** `ProtectedRoute` / `PublicRoute` ([§5.2](#52-route-guards)); **admin-only** routes + **sidebar** link gated by `user.role === 'ADMIN'`; **session expiry** handled via refresh failure → `logout()` + redirect to `/login` ([§6.3](#63-response-interceptor-and-token-refresh)). |
| **5** | **Error handling & resilience** | **Global:** `ErrorBoundary` (`main.tsx`), axios **response interceptor** (toasts / redirect), `Promise.allSettled` on dashboard for partial failures; **shared** `EmptyState`, skeletons, spinners in `Suspense` and feature screens; user-facing messages via **react-hot-toast** and notifications store. |
| **6** | **State management** | **Zustand** (+ `persist`) instead of Redux Toolkit: **auth**, **theme**, **notifications** in `src/store/index.ts` — same separation intent (global vs local form/UI state in features). Async handled in components or small helpers; **React Hook Form** reduces unnecessary input re-renders on auth forms ([§2](#2-why-this-tech-stack)). |
| **7** | **Environment & configuration** | **`import.meta.env`**: `VITE_API_BASE_URL`, `VITE_RAZORPAY_KEY_ID`; dev uses **relative** `/api` + Vite proxy; no hardcoded secrets in source — document in **README** / `.env.local` ([§12](#12-environment-variables), [§6.1](#61-base-url)). |
| **8** | **Component design & reusability** | **`src/shared/components`**: `Modal`, `Table`, `Pagination`, `EmptyState`, `PaymentSuccessOverlay`, `ScratchCard`, etc.; **`useDebouncedValue`** for admin search (`AdminUsers.tsx`); **DRY** via `fmt.*`, `statusClass`, `cn`. |
| **9** | **UX & interaction logic** | **Loading** spinners (`App.tsx` `Loader`, feature-level flags); **toasts** + in-app **notifications** on money/reward successes; **multi-step** transfer confirm flow; **form validation** via React Hook Form + inline errors on auth/wallet forms. |
| **10** | **UI design & visual quality** | **Tailwind** + **CSS variables** in `src/styles/index.css` (light/dark, brand); consistent typography (e.g. Toaster font in `main.tsx`), spacing via utility classes; shared cards/stats patterns across dashboard and admin. |
| **11** | **Responsiveness & cross-browser** | **`AppLayout`**: mobile hamburger, overlay sidebar, responsive main content; layouts and tables use flex/grid patterns suitable for smaller viewports. Cross-browser: standard React/DOM APIs; no IE-specific shims — verify in target browsers as needed. |
| **12** | **Performance** | **Route-level `lazy()` + `Suspense`** (`App.tsx`); **debounced** search; **optional polling** on Analytics; axios **timeout** 15s; chart data aggregated client-side from paginated fetches — tune page sizes / memoization where profiles show bottlenecks. |
| **13** | **Real-time communication** | **Not implemented** in this codebase (HTTP + optional **short polling** on Analytics only). WebSockets would require backend support and a dedicated client module. |
| **14** | **Payment integration** | **Razorpay Checkout**: `AddMoney.tsx` — `createOrder` → script load → `verifyPayment` on success; **public key** from env; success **overlay** + notification; backend holds order/signature verification truth ([§8.2](#82-add-money-razorpay)). |
| **15** | **Testing & debugging** | **Vitest** + Testing Library (`src/test/setup.ts`); **unit example**: `src/features/auth/authUtils.test.ts`. Use browser devtools + network tab + axios errors for API debugging. |
| **16** | **Documentation & maintainability** | This guide, root **`README.md`**, **`docs/PROJECT_DOCUMENTATION.md`**; code structured for navigation by feature path; comments used sparingly where behavior is non-obvious (e.g. refresh request skips Bearer). |
| **17** | **Feature completeness** | End-user flows: auth, dashboard, **add money**, **transfer/withdraw**, transactions/ledger, profile/KYC, rewards, analytics; admin: dashboard, users, KYC, rewards catalog — all wired through `core/api` to the gateway contract. |
| **18–19** | **Explanation & communication** | Onboarding readers should use this document’s sections **5–8** for walkthroughs; **§6** for HTTP behavior; justify **Zustand over Redux** via minimal boilerplate and persisted slices ([§2](#2-why-this-tech-stack)). |
| **20** | **Security best practices** | **No refresh token in localStorage** beyond what `persist` stores — team should threat-model for XSS; **Razorpay secret** never on client; **inputs** normalized (`normalizeIdentifier`) and validated on forms; **JWT** only sent via Axios headers, stripped on refresh calls; rely on **backend** for authorization. |
| **21** | **Advanced practices** | **`useDebouncedValue`** (`src/shared/hooks/useDebouncedValue.ts`); **lazy** routes; interceptor **deduped** refresh; **idempotency keys** on transfer (`Transfer.tsx`) to reduce duplicate settlement risk. |

### Quick file index for reviewers

| Concern | Primary files |
|--------|----------------|
| API + interceptors | `src/core/api/index.ts` |
| Auth state + persistence | `src/store/index.ts` |
| Route guards | `src/App.tsx` |
| Global error UI | `src/shared/components/ErrorBoundary.tsx`, `src/main.tsx` (Toaster) |
| Payments | `src/features/wallet/AddMoney.tsx`, `walletAPI` in `core/api` |
| Reusable UI | `src/shared/components/index.tsx` |
| Theming | `src/styles/index.css`, `useThemeStore` |

---

## 15. Mental model summary

1. **Vite + React** deliver the UI; **React Router** defines structure and guards.
2. **Zustand** holds **auth, theme, notifications** with **localStorage** persistence.
3. **Axios** centralizes **JWT attachment**, **refresh-on-401**, and **normalized error UX**.
4. **Features** under `src/features/*` are **vertical slices**: each screen owns its form state, loading flags, and calls into **`core/api`**.
5. **Backend** is the source of truth; the frontend assumes REST responses often wrap payloads in `.data` or `.data.data` and defensively unwraps in places like login and admin lists.

For a concise quick start and gateway port map, see the root **`README.md`**. For analytics-oriented notes, see **`docs/ANALYTICS_CANVAS.md`** if present in your branch.
