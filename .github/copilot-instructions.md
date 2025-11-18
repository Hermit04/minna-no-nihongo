# Copilot Instructions

## Architecture Overview

This is a **Turborepo monorepo** built with the Better-T-Stack that separates frontend (`apps/web`) and backend (`packages/backend`) concerns:

- **Frontend**: Next.js 16 App Router (port 3001) with React 19, shadcn/ui, TailwindCSS v4
- **Backend**: Convex (reactive BaaS) with Better-Auth integration
- **Monorepo**: Turborepo manages workspace dependencies and build orchestration

### Key Architectural Patterns

1. **Convex as Backend**: All data operations go through Convex functions (queries/mutations), not REST/GraphQL
2. **Auth Integration**: Better-Auth is integrated via `@convex-dev/better-auth` component with email/password auth
3. **Reactive Data Flow**: Frontend uses `useQuery`/`useMutation` hooks that auto-refresh on backend changes

## Critical Setup & Workflows

### First-Time Setup
```bash
npm install
npm run dev:setup  # Configure Convex project (creates deployment)
npm run dev        # Start both frontend and backend
```

### Environment Variables
- Backend: `packages/backend/.env.local` - Contains `CONVEX_DEPLOYMENT`, `CONVEX_URL`, `CONVEX_SITE_URL`, `SITE_URL`
- Frontend: `apps/web/.env` - Contains `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`

**Important**: Environment variables are set during `dev:setup`. `SITE_URL` must be set in Convex dashboard: `npx convex env set SITE_URL http://localhost:3001`

### Development Commands
- `npm run dev:web` - Start only Next.js frontend
- `npm run dev:server` - Start only Convex backend (`@my-better-t-app/backend`)
- `npm run check-types` - TypeScript validation across all workspaces

## Project-Specific Conventions

### Backend (Convex)

**Location**: `packages/backend/convex/`

1. **Schema Definition** (`schema.ts`):
   ```typescript
   defineTable({
     field: v.string(),
     // Always use convex/values validators
   })
   ```

2. **Queries & Mutations** (e.g., `todos.ts`):
   - Export query/mutation with `args` validation using `v` from `convex/values`
   - Return types use `ctx.db.query()`, `ctx.db.insert()`, `ctx.db.patch()`, `ctx.db.delete()`
   - Use `v.id("tableName")` for ID types

3. **Auth Setup**:
   - `auth.ts` exports `createAuth` function (not a constant)
   - `auth.config.ts` configures Better-Auth provider
   - `http.ts` registers auth routes via `authComponent.registerRoutes()`
   - `convex.config.ts` uses `@convex-dev/better-auth` component

4. **Generated Files**: `_generated/` contains API types - import as:
   ```typescript
   import { api } from "@my-better-t-app/backend/convex/_generated/api";
   import type { Id } from "@my-better-t-app/backend/convex/_generated/dataModel";
   ```

### Frontend (Next.js)

**Location**: `apps/web/src/`

1. **Convex Client Setup** (`components/providers.tsx`):
   - Wrap app with `ConvexBetterAuthProvider` > `ConvexProvider`
   - Initialize `ConvexReactClient` with `NEXT_PUBLIC_CONVEX_URL`

2. **Data Fetching Patterns**:
   ```typescript
   const data = useQuery(api.module.functionName, { args });
   const mutate = useMutation(api.module.functionName);
   ```
   - All client components using Convex must be `"use client"`
   - Queries return `undefined` while loading - handle this state

3. **Auth Patterns**:
   - `<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` components for conditional rendering
   - `authClient` from `@/lib/auth-client` for client-side auth
   - `getToken()` from `@/lib/auth-server` for server components

4. **UI Components** (shadcn/ui):
   - Located in `components/ui/`
   - Use `class-variance-authority` for variants
   - Tailwind v4 with CSS-first approach (no `tailwind.config.js`)

5. **Routing**:
   - `typedRoutes: true` enabled in `next.config.ts`
   - Auth API routes: `app/api/auth/[...all]/route.ts` uses `nextJsHandler()`

## Integration Points

### Frontend ↔ Backend Communication
- Frontend imports generated Convex API: `import { api } from "@my-better-t-app/backend/convex/_generated/api"`
- No manual API routes needed - Convex handles all RPC
- Backend package is referenced as `@my-better-t-app/backend` in frontend `package.json`

### Better-Auth Flow
1. Auth config in backend (`auth.config.ts`, `auth.ts`)
2. HTTP routes registered in `http.ts`
3. Frontend auth client uses `convexClient()` plugin
4. Server-side token retrieval via `@convex-dev/better-auth/nextjs`

## Common Tasks

### Adding a New Database Table
1. Update `packages/backend/convex/schema.ts` with `defineTable()`
2. Create query/mutation functions in new file (e.g., `items.ts`)
3. Convex auto-generates types - restart dev server to see them

### Creating New UI Components
1. Use `components/ui/` for reusable shadcn/ui components
2. Page-specific components go in `components/` (e.g., `sign-in-form.tsx`)
3. All components using Convex hooks need `"use client"` directive

### Debugging Convex Functions
- Check Convex dashboard logs (URL printed during `dev:setup`)
- Use `console.log()` in functions - output appears in terminal running `npm run dev:server`
- Test queries/mutations directly in Convex dashboard
