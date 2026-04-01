# WalletPay — Digital Wallet Frontend

Production-grade React + Vite + Tailwind frontend for the WalletPay microservices backend.

## Tech Stack

| Concern         | Library                      |
|-----------------|------------------------------|
| Framework       | React 18 + Vite              |
| Styling         | Tailwind CSS (dark/light)    |
| Routing         | React Router v6              |
| State           | Zustand (persist)            |
| Forms           | React Hook Form              |
| HTTP            | Axios + interceptors         |
| Charts          | Recharts                     |
| Notifications   | React Hot Toast              |
| Icons           | Lucide React                 |

## Project Structure

```
src/
├── core/api/index.js        # All API endpoints mapped to :8080
├── shared/
│   ├── components/          # Table, Modal, Badge, Pagination, StatCard
│   └── utils/               # fmt helpers, status color map
├── store/index.js           # Zustand: auth + theme (persisted)
├── styles/index.css         # CSS variables, design tokens
├── layouts/
│   ├── AppLayout.jsx        # User sidebar + topbar
│   └── AdminLayout.jsx      # Admin sidebar
├── features/
│   ├── auth/                # Login, Signup, ForgotPassword
│   ├── dashboard/           # Wallet balance, quick actions
│   ├── wallet/              # AddMoney, Transfer
│   ├── rewards/             # Rewards catalog + redemption
│   ├── transactions/        # History, ledger, export
│   ├── profile/             # Profile edit + KYC submit
│   └── admin/               # Dashboard, Users, KYC review
└── routes/                  # Protected + public route guards
```

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server (proxies /api → localhost:8080)
npm run dev

# Build for production
npm run build
```

## API Gateway

All API calls are proxied through `http://localhost:8080`.
Configure in `vite.config.js` → `server.proxy`.

Services mapped:
- `POST /api/auth/*`        → Auth Service (:8084)
- `GET/PUT /api/users/*`    → User Service (:8082)
- `GET/POST /api/kyc/*`     → KYC Service (:8082)
- `GET/POST /api/wallet/*`  → Wallet Service (:8083)
- `GET/POST /api/payment/*` → Payment Service (:8083)
- `GET/POST /api/rewards/*` → Rewards Service (:8085)
- `GET/POST /api/admin/*`   → Admin Service (:8082)

## Features

### User (Applicant)
- ✅ Login (email/password + phone/password)
- ✅ Signup with email OTP verification
- ✅ Forgot password (OTP → reset flow)
- ✅ Wallet dashboard with balance, quick actions, rewards summary, recent transactions
- ✅ Add Money (Razorpay integration, quick amount selection)
- ✅ Send/Transfer with confirmation step
- ✅ Rewards & Loyalty (catalog, redeem items, convert points to cash)
- ✅ Transaction History (filters, ledger, CSV export, dispute raising)
- ✅ Profile edit + KYC document upload

### Admin
- ✅ Dashboard with KYC/user KPI charts (Recharts)
- ✅ User management (search, filter, block/unblock, role change)
- ✅ KYC review queue (approve/reject with reason)

### UX
- ✅ Dark / Light mode toggle (persisted, respects OS preference)
- ✅ Responsive layout (mobile hamburger, desktop sidebar)
- ✅ JWT auto-refresh on 401
- ✅ Loading skeletons everywhere
- ✅ Role-based route guards (Admin panel locked to ADMIN role)
- ✅ Toast notifications

## Environment Variables

Create `.env.local` for overrides:
```
VITE_API_BASE_URL=http://localhost:8080
```
