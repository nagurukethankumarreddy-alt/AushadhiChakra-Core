# AushadhiChakra

A healthcare supply resilience command center that helps Udupi district teams prevent medicine stockouts through FEFO rebalancing, simulation, dispatch, and offline SMS intake.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/aushadhi-chakra/` — React/Vite operator console and AushadhiWatch public view.
- `artifacts/api-server/src/routes/supply.ts` — in-memory facilities, inventory, simulation, rebalance, manifest authorization, SMS, and public availability endpoints.
- `lib/api-spec/openapi.yaml` — source of truth for the generated API client and Zod schemas.

## Architecture decisions

- Inventory state is intentionally in-memory so SMS writes and FEFO decisions stay synchronized throughout the active session without introducing a database dependency.
- The frontend consumes generated React Query hooks from the shared OpenAPI contract rather than hand-written fetch types.
- Manifest authorization codes are deterministic HMAC-SHA256 digests scoped to each rebalance order.
- The operator console and public portal share the same live API state but use distinct shells and information density.

## Product

- Command center with seeded Udupi facilities, stockout queue, KPI ribbon, facility map, and inventory ledger.
- Contagion simulation controls for elasticity, patient displacement, and demand spikes.
- FEFO-generated dispatch orders with government-formatted manifest download.
- Offline SMS console accepting `STK <facility_id> <drug_code> <units>`.
- AushadhiWatch public availability portal with taluk coverage and verified clinic advisory.

## User preferences

_No project-specific preferences recorded._

## Gotchas

- Regenerate the API client after changing `lib/api-spec/openapi.yaml`.
- The seeded data and SMS updates reset when the API workflow restarts.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
