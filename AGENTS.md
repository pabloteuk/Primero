# AGENTS.md

Guidance for Cloud Agents and automated development environments working on this repository.

## Product

**Primero** (Vabble) is an AI-powered trade finance origination platform: React frontend + Express API. Optional ClickHouse (Docker) powers analytics and trade-data features.

## Cursor Cloud specific instructions

### Services to run (minimal E2E)

| Service | Command | Port |
|---------|---------|------|
| Frontend (Vite) | `npm run dev --workspace=frontend` | 5173 |
| Backend (Express) | `npm run dev --workspace=backend` | 3001 |
| Both | `npm run dev` (from repo root) | 5173 + 3001 |

ClickHouse is **optional** for dashboard demo (API returns mock/simulated data). Start with `npm run clickhouse:setup` when testing analytics lake features. Docker is required for ClickHouse and is not always available in Cloud Agent VMs.

### First-time / Linux setup gotcha

`frontend/node_modules` is **committed to git** with macOS-native binaries (`darwin-arm64` for Rollup/esbuild). On Linux, delete and reinstall the frontend workspace before starting Vite:

```bash
rm -rf frontend/node_modules
npm install --workspace=frontend
```

`frontend/package.json` includes `@rollup/rollup-linux-x64-gnu` as an optional dependency to help Linux installs resolve the correct native Rollup binary.

### Backend environment

Copy `backend/.env.example` to `backend/.env` before starting the API. Set `FRONTEND_URL` and `CORS_ORIGIN` to `http://localhost:5173` (Vite default), not `3000`.

### Lint / typecheck / test / build

| Task | Command | Notes |
|------|---------|-------|
| Typecheck + build | `npm run build` | Runs `tsc && vite build` in frontend; **currently fails** with pre-existing TypeScript errors |
| Dev (no tsc gate) | `npm run dev` | Vite dev server works despite build failures |
| Tests | `npm test` | Runs Jest in backend; **no test files exist** — exits non-zero unless `--passWithNoTests` is added |
| Lint | — | No ESLint script configured in package.json |

Use `npm run dev` and curl/browser checks for Cloud Agent verification rather than `npm run build`.

### API smoke checks

```bash
curl http://localhost:3001/health
curl http://localhost:3001/api/analytics/dashboard
curl -o /dev/null -w '%{http_code}\n' http://localhost:5173/
```

### Monorepo layout

- `frontend/` — React + Vite + TypeScript
- `backend/` — Express API (`backend/src/server.js`)
- `ml-models/` — TensorFlow.js workspace (not wired into runtime API)
- Root `package.json` — npm workspaces orchestration

See `README.md` for ClickHouse, Trade Map Python pipeline, and MCP integration details.
