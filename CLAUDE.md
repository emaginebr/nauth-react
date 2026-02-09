# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run build          # TypeScript check + Vite library build (ES + CJS output)
npm test               # Vitest single run
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Coverage report (text, json, html)
npm run lint           # ESLint (zero warnings threshold)
npm run type-check     # TypeScript check only (tsc --noEmit)
npm run dev            # Vite dev server
npm run storybook      # Storybook on port 6006
```

## Architecture

This is an **NPM library package** (`nauth-react`), not a standalone application. It provides React components, hooks, and an API client for integrating with the NAuth backend authentication service.

**Build**: Vite in library mode outputs dual formats (ES `.js` + CJS `.cjs`). Peer dependencies (react, react-dom, react-router-dom) are externalized. Path alias `@/*` maps to `./src/*`.

**Entry point**: `src/index.ts` is the public API surface — all exports consumed by library users are declared here.

**State management**: Single React Context in `src/contexts/NAuthContext.tsx` holds auth state (user, token, isLoading) and exposes all API methods. Three focused hooks provide scoped access:
- `useAuth()` — auth state + login/logout/register
- `useUser()` — user profile operations
- `useProtectedRoute()` — route guard with optional admin requirement (uses react-router-dom's `useNavigate`)

**API layer**: `src/services/nauth-api.ts` contains the `NAuthAPI` class wrapping Axios. Key behaviors:
- Interceptors auto-inject Bearer token and device fingerprint (`X-Device-Fingerprint` header via FingerprintJS)
- 401 responses automatically clear auth state
- `createNAuthClient(config)` factory used by NAuthContext to instantiate

**Forms**: All form components use react-hook-form with zod schemas for validation.

**UI components**: Built on Radix UI primitives (`src/components/ui/`), styled with Tailwind CSS and class-variance-authority. The `cn()` utility in `src/utils/cn.ts` merges Tailwind classes.

**Validators**: `src/utils/validators.ts` includes Brazilian-specific validation (CPF/CNPJ with checksum verification, phone format, document format) alongside standard validators (email, password strength).

**Tests**: Vitest + @testing-library/react + jsdom. Test files live in `src/__tests__/`. Global test APIs are enabled (no need to import `describe`/`it`/`expect`). Setup file mocks `matchMedia`, `localStorage`, and `navigator.userAgent`.
