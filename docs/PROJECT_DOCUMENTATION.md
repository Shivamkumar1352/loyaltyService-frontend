# WalletPay Frontend — Project Documentation

## Overview

This repository contains the **React + Vite + Tailwind** frontend for the WalletPay wallet platform. It includes:

- User app (wallet, transfers, rewards, transactions, profile/KYC)
- Admin app (dashboard, user/KYC management, rewards catalog)
- Shared UI primitives (tables, modals, stat cards, scratch card)

## Implementation Guidelines Compliance (How + Where)

This section maps each **Frontend Implementation & Evaluation Guideline** to the **exact implementation** in this codebase.

### 1) Architecture & Code Quality

- **Feature-based structure**: `src/features/*` (auth, wallet, rewards, transactions, admin, analytics)
- **Layouts separated from features**: `src/layouts/AppLayout.tsx`, `src/layouts/AdminLayout.tsx`
- **Shared reusable UI**: `src/shared/components/index.tsx` (Modal/Table/Pagination/StatCard/etc.)
- **Shared utilities**: `src/shared/utils/*`
- **Reusable hooks (shared logic)**: `src/shared/hooks/useDebouncedValue.ts`

### 2) API Integration & Data Handling

- **Centralized API service layer (Axios)**: `src/core/api/index.ts`
- **Interceptors**:
  - Attach tokens + user headers: `src/core/api/index.ts` request interceptor
  - Global refresh on 401 + retry: `src/core/api/index.ts` response interceptor
  - Global network error messaging: `src/core/api/index.ts` (network error toast)
- **Loading / success / error states**:
  - Skeletons: `src/shared/components/index.tsx` (`Skeleton`)
  - Feature pages handle loading + empty states (examples):
    - `src/features/dashboard/Dashboard.tsx`
    - `src/features/transactions/Transactions.tsx`
    - `src/features/rewards/Rewards.tsx`
    - `src/features/admin/AdminDashboard.tsx`

### 3) Authentication & Authorization

- **Login flows**:
  - Password login + OTP login with same identifier field: `src/features/auth/Login.tsx`
  - Shared identifier normalization logic: `src/features/auth/authUtils.ts`
- **Signup + email OTP verification**: `src/features/auth/Signup.tsx`
- **Forgot password (OTP → reset)**: `src/features/auth/ForgotPassword.tsx`
- **JWT handling + session expiry**:
  - Tokens stored in persisted global state: `src/store/index.ts` (`useAuthStore`)
  - Auto refresh on 401: `src/core/api/index.ts` (`/api/auth/refresh`)
- **Route protection + role-based guards**: `src/App.tsx` (`ProtectedRoute` + `adminOnly`)
- **Role-based UI rendering**:
  - Admin entry point in user sidebar: `src/layouts/AppLayout.tsx` (ADMIN-only link)

### 4) Error Handling & Resilience

- **Global fallback UI**: `src/shared/components/ErrorBoundary.tsx`
- **Wired at app root**: `src/main.tsx` (wraps `<App />`)
- **User-friendly error messages**:
  - Toaster configured globally: `src/main.tsx`
  - Consistent API error toasts across features (examples): wallet/auth/admin pages
- **Edge cases**:
  - Empty states in list views (`Table` emptyText): `src/shared/components/index.tsx`
  - Skeleton loaders: `src/shared/components/index.tsx`

### 5) State Management

- **Global state** (auth/theme/notifications): `src/store/index.ts` (Zustand persisted stores)
- **Local vs global separation**:
  - Global: auth tokens/theme/notifications (store)
  - Local: page UI state (forms, modals, tabs) within feature components
- **Async operations**: handled inside features with clear loading flags

### 6) Environment & Configuration Management

- **Environment variables**:
  - `.env.example`, `.env`
  - API base URL: `VITE_API_BASE_URL`
  - Razorpay: `VITE_RAZORPAY_KEY_ID`
- **Environment-aware API base**: `src/core/api/index.ts` uses `VITE_API_BASE_URL` (or relative base for dev proxy)
- **Dev proxy**: `vite.config.js` proxies `/api` → `http://localhost:8080`

### 7) Component Design & Reusability (DRY)

- **Reusable primitives**: `src/shared/components/index.tsx`
- **Reusable success animation overlay**: `src/shared/components/PaymentSuccessOverlay.tsx`
- **Reusable notifications UI**: `src/shared/components/NotificationBell.tsx`

### 8) UX & Interaction Logic

- **Feedback**:
  - Loading indicators/skeletons: `src/shared/components/index.tsx`
  - Success/failure screens for payments/transfers:
    - `src/features/wallet/AddMoney.tsx`
    - `src/features/wallet/Transfer.tsx`
- **Form validation UX**: React Hook Form used in auth/wallet/profile flows

### 9) UI Design & Visual Quality

- **Consistent design tokens**: `src/styles/index.css` (CSS variables / tokens)
- **Consistent components**: buttons/inputs/cards used across features

### 10) Responsiveness & Cross-Browser Compatibility

- **Responsive layouts**:
  - Mobile sidebar overlay + hamburger: `src/layouts/AppLayout.tsx`, `src/layouts/AdminLayout.tsx`
- **Mobile interaction for scratch**:
  - Pointer/touch scratching: `src/shared/components/ScratchCard.tsx`

### 11) Performance Optimization

- **Lazy loading/code splitting**: `src/App.tsx` uses `React.lazy` + `Suspense` for feature routes
- **Debouncing (avoid excessive API calls)**: `src/shared/hooks/useDebouncedValue.ts` used in `src/features/admin/AdminUsers.tsx`

### 12) Real-Time Communication

- **Status**: Not implemented (no WebSocket endpoints provided in this project scope).

### 13) Payment Integration

- **Razorpay flow**:
  - Script loading + payment initiation: `src/features/wallet/AddMoney.tsx`
  - Backend order creation: `walletAPI.createOrder` → `src/core/api/index.ts`
  - Secure verification step: `walletAPI.verifyPayment` → `src/core/api/index.ts`
  - Success/failure handling: `src/features/wallet/AddMoney.tsx`

### 14) Testing & Debugging

- **Unit test setup**:
  - Vitest config: `vite.config.js`
  - Setup file: `src/test/setup.ts`
  - Example unit test: `src/features/auth/authUtils.test.ts`

### 15) Documentation & Maintainability

- **README**: `README.md`
- **Project documentation**: `docs/PROJECT_DOCUMENTATION.md` (this file)
- **Analytics documentation**: `docs/ANALYTICS_CANVAS.md`

## Feature Map (where it’s implemented)

### Notifications (bell icon, mark-as-read removes it)

- **Bell + popover UI**: `src/shared/components/NotificationBell.tsx`
- **Top-right placement**:
  - User topbar: `src/layouts/AppLayout.tsx`
  - Admin topbar: `src/layouts/AdminLayout.tsx`
- **State + persistence**: `src/store/index.ts` (`useNotificationStore`)
- **Events that generate notifications**:
  - Transfer / withdrawal success: `src/features/wallet/Transfer.tsx`
  - Add money success: `src/features/wallet/AddMoney.tsx`
  - Scratch reward redemption success: `src/features/rewards/Rewards.tsx`

### Full-screen green payment success animation (Paytm/GPay-like)

- **Reusable full-screen overlay**: `src/shared/components/PaymentSuccessOverlay.tsx`
- **Used by**:
  - Wallet transfer / withdrawal flow: `src/features/wallet/Transfer.tsx`
  - Add money flow: `src/features/wallet/AddMoney.tsx`

### Scratch UI improvement (more interactive)

- **Scratch card component**: `src/shared/components/ScratchCard.tsx`
- **Improvements added**:
  - Pointer/touch support (drag to scratch on mobile)
  - Clear instruction text for hover + drag

### Login with OTP or password (single email/phone input)

- **Unified login screen**: `src/features/auth/Login.tsx`
- **Modes**:
  - Password login (email or phone in same field)
  - OTP login (send OTP → verify OTP)
- **APIs used**:
  - `authAPI.login` (email/password)
  - `authAPI.loginPhone` (phone/password)
  - `authAPI.sendOtp` (email/phone)
  - `authAPI.verifyOtp` (email/phone + otp)

### Admin rewards catalog endpoints (CRUD)

Endpoints (per requirement):

- `GET /api/rewards/admin/catalog`
- `PUT /api/rewards/admin/catalog/{rewardId}`
- `DELETE /api/rewards/admin/catalog/{rewardId}`

Implementation:

- **API client**: `src/core/api/index.ts` (`rewardsAdminAPI`)
- **Admin UI page**: `src/features/admin/AdminRewards.tsx`
- **Route**: `src/App.tsx` → `/admin/rewards`
- **Admin sidebar nav**: `src/layouts/AdminLayout.tsx`

### Charts & graphs (user + admin)

- **User analytics dashboard**: `src/features/analytics/Analytics.tsx`
  - Uses `recharts` with `/api/wallet/transactions`, `/api/wallet/ledger`, `/api/rewards/transactions`
- **Route + nav**:
  - Route: `src/App.tsx` → `/analytics`
  - Sidebar item: `src/layouts/AppLayout.tsx`
- **Admin dashboard charts**: `src/features/admin/AdminDashboard.tsx`

## API Surface (frontend client)

- Centralized in: `src/core/api/index.ts`
- Uses Axios interceptors to attach:
  - `Authorization: Bearer <token>`
  - `X-User-Id`, `X-UserRole` / `X-User-Role`

## Notes / Assumptions

- Notifications are **client-side** (persisted in local storage) and are generated from in-app events (successful actions). If backend notification endpoints are added later, the store can be extended to sync them.

