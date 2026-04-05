# Analytics Canvas (User + Admin)

This canvas is a reusable checklist for analytics/dashboards in this project.

## Goals

- Give **users** a clear view of wallet inflow/outflow, transaction mix, and rewards activity.
- Give **admins** a complete view of platform health (users + KYC + reward catalog performance).

## Data Sources (Frontend → API)

### User

- **Wallet transactions**: `walletAPI.getTransactions(page,size)` → `/api/wallet/transactions`
- **Wallet ledger**: `walletAPI.getLedger(page,size)` → `/api/wallet/ledger`
- **Rewards transactions**: `rewardsAPI.getTransactions(page,size)` → `/api/rewards/transactions`

### Admin

- **Admin KPI dashboard**: `adminAPI.getDashboard()` → `/api/admin/dashboard`
- **Rewards catalog (CRUD)**: `rewardsAdminAPI.*` → `/api/rewards/admin/catalog*`

## Views

### User Analytics View

- **Stat cards**: credited, debited, successful txns, net.
- **Charts**:
  - Pie: transaction type share (amount)
  - Bar: top transaction types by amount
  - Pie: rewards activity by type (points)

### Admin Analytics View

- **Existing charts**:
  - KYC distribution
  - User role distribution
  - Growth metrics
- **Catalog management**:
  - List catalog
  - Update / delete items

## Interaction Checklist

- Refresh button on dashboards
- Loading skeletons
- Empty-state rendering
- Tooltips for chart values

