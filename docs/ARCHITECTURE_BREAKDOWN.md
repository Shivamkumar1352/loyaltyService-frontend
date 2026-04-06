# Project Breakdown

## Top-level structure

- `src/app`: application bootstrap and routing concerns.
- `src/core`: infrastructure such as API clients and request interceptors.
- `src/features`: feature-first UI and feature-local helpers.
- `src/layouts`: app/admin shells plus shared layout building blocks.
- `src/shared`: reusable components, hooks, and generic utilities.
- `src/store`: Redux store setup, slices, persistence, and facade hooks.

## Current module boundaries

- `src/app/routes`
  Keeps lazy route registration, route guards, and the shared route loader out of `App.tsx`.

- `src/store`
  Split into `types.ts`, `constants.ts`, `persistence.ts`, `slices/`, `store.ts`, and `hooks.ts`.
  This separates reducer logic from persistence and from the convenience hooks consumed by screens.

- `src/layouts/shared`
  Contains shell primitives such as `LayoutShell`, `LayoutSidebar`, `LayoutTopbar`, `LayoutBackdrop`, `LayoutContent`, `SidebarNav`, and `ThemeToggle`.
  `AppLayout.tsx` and `AdminLayout.tsx` now compose those pieces instead of duplicating shell logic.

- `src/features/dashboard`
  `Dashboard.tsx` is now a screen orchestrator.
  UI sections live in `components/`.
  Reusable display constants and data types live in `constants.ts` and `types.ts`.

- `src/features/wallet/add-money`
  Add money flow is split into `components/`, `constants.ts`, `types.ts`, and `utils.ts`.
  The page component now owns only async flow and state transitions.

- `src/features/wallet/transfer`
  Transfer flow is split into `components/`, `constants.ts`, and `types.ts`.
  The page component now focuses on submission state and API orchestration.

## Refactor pattern to keep using

- Page files should coordinate data fetching and state transitions, not render every section inline.
- Repeated shell UI belongs in `layouts/shared`.
- Feature-specific constants and helper functions should live beside the feature, not in global shared files.
- Global shared code should be reserved for code reused by multiple features.
