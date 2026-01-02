# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Commands

```bash
bun run dev            # Start all dev servers (web + convex)
bun run build          # Production build all packages
bun run lint           # Lint all packages
bun run typecheck      # Type check all packages
```

### Convex commands (run from root)

```bash
bun convex dev --once  # Dev sync
```

### Package-specific commands

```bash
bun run dev --filter=web
bun run build --filter=web
```

## Architecture

**Stack**: Next.js 16 (App Router) + Convex + Tailwind CSS 4 + TypeScript

**Monorepo Structure**:

```
├── apps/
│   └── web/                  # Next.js frontend
├── packages/
│   ├── backend/              # Convex backend
│   │   └── convex/           # Convex functions
│   ├── ui/                   # Shared component library
│   └── config/               # Shared tsconfig + eslint
├── convex.json               # Convex project config (points to packages/backend/convex/)
├── turbo.json                # Turborepo configuration
├── vercel.json               # Vercel deployment config
└── package.json              # Root workspace config
```

**Path Aliases**: `@/*` maps to `./src/*` in apps/web

## Deployment

**Hosting**: Vercel (frontend) + Convex Cloud (backend)

**Git Workflow**:

- All changes via pull requests
- Merges to `main` auto-deploy to production
- PRs get preview deployments

**Vercel Configuration** (vercel.json at root):

- Build command deploys Convex first, then builds Next.js
- `NEXT_PUBLIC_CONVEX_URL` injected automatically during deploy

**Environment Variables**:
| Variable | Environment | Source |
|----------|-------------|--------|
| `CONVEX_DEPLOY_KEY` | Production | Convex Dashboard → Settings → Production Deploy Key |
| `CONVEX_DEPLOY_KEY` | Preview | Convex Dashboard → Settings → Preview Deploy Key |

## Convex Patterns

Backend functions live in `packages/backend/convex/`. Use:

- `query` for reads
- `mutation` for writes
- `action` for external API calls only
- Import from `./_generated/server` for ctx types
- Import `v` from `convex/values` for validators

### Folder Structure

Organize by resource: `convex/users/`, `convex/videos/`, etc.

- Put business logic in `convex/model/` with public functions as thin wrappers
- Separate validators into dedicated files

### Actions

- Use for external API calls and batch jobs only
- Prefer queries/mutations when possible (faster, transactional)
- **Anti-pattern**: Calling actions directly from clients
- **Pattern**: Client → mutation (writes intent to DB) → schedules action

### Avoiding Nested Actions

- Never call `ctx.runAction` from an action (use plain TypeScript helpers)
- Minimize `ctx.runQuery`/`ctx.runMutation` calls - combine into single transactions

## Best Practices

**Server vs Client Components**:

- Default to Server Components (no 'use client' directive)
- Add 'use client' only for: interactivity, hooks, browser APIs
- Keep client components small; push state down

**Data Fetching**:

- Use Convex `useQuery` for reactive data
- All external API calls through Convex actions

**State Management**:

- Convex is your state manager - no need for Redux/Zustand
- Use `useState` only for ephemeral UI state
- Never duplicate Convex data in local state

**Shared Packages**:

- UI components: `@isaacsuttell/ui`
- Configs: `@isaacsuttell/config`
