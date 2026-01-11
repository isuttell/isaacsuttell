# Isaac Suttell

Designer and Engineer building AI infrastructure, with a focus on creative applications of technology.

## ✨ Features

- **Interactive Simulations**: WebGL-powered visualizations including Gravitational Lensing and Audio Visualizers
- **Photography Galleries**: Curated collections of Astrophotography and Fashion photography
- **Modern Architecture**: Next.js 16 App Router with React 19, Convex backend, and shared component library
- **Optimized Performance**: Server-side rendering, image optimization, and responsive design

## 🛠 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 16.1.1 | React framework with App Router |
| React | 19.2.3 | UI library |
| Convex | 1.31.2 | Backend-as-a-Service |
| Tailwind CSS | 4 | Styling framework |
| TypeScript | 5 | Type safety |
| Turborepo | 2 | Monorepo build system |
| Bun | 1.3.5 | Package manager & runtime |

## 📁 Project Structure

```
├── apps/
│   └── web/                  # Next.js frontend application
├── packages/
│   ├── backend/              # Convex backend
│   │   └── convex/           # Convex functions (queries, mutations, actions)
│   ├── ui/                   # Shared React component library (@isaacsuttell/ui)
│   └── config/               # Shared configurations (tsconfig, eslint)
├── convex.json               # Convex project configuration
├── turbo.json                # Turborepo build pipeline
├── vercel.json               # Vercel deployment configuration
└── package.json              # Root workspace configuration
```

## 🚀 Getting Started

### Prerequisites

- **Bun 1.3.5+** - [Install Bun](https://bun.sh)

### Installation

```bash
bun install
```

### Development

Start all development servers (Next.js + Convex):

```bash
bun run dev
```

The web app will be available at [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
bun run dev            # Start dev servers (web + convex)
bun run build          # Production build all packages
bun run lint           # Lint all packages with ESLint
bun run typecheck      # Type check all packages with TypeScript
bun run format         # Format code with Prettier
bun run format:check   # Check code formatting
```

### Convex Commands

Run from the root directory:

```bash
bun convex dev --once  # Sync Convex schema once
```

### Package-Specific Commands

Target individual packages with Turbo filters:

```bash
bun run dev --filter=web        # Run only web app
bun run build --filter=web      # Build only web app
```

## 📦 Packages

### @isaacsuttell/ui

Shared React component library with reusable UI components:

- **`Button`** - Customizable button component with multiple variants (primary, secondary, ghost)
- **`PhotoGallery`** - Interactive photo gallery with lightbox and navigation
- **`Starfield`** - Animated starfield background using Canvas API

### @isaacsuttell/backend

Convex backend with:
- Queries for data fetching
- Mutations for data updates
- Actions for external API integration

### @isaacsuttell/config

Shared configuration packages:
- TypeScript configurations
- ESLint configurations

## 🌐 Deployment

This project is deployed on:
- **Frontend**: Vercel
- **Backend**: Convex Cloud

### Deployment Workflow

- Merges to `main` trigger automatic production deployments
- Pull requests receive preview deployments with unique URLs
- Convex functions deploy before Next.js build (configured in `vercel.json`)

### Environment Variables

| Variable | Environment | Description |
|----------|-------------|-------------|
| `CONVEX_DEPLOY_KEY` | Production | Production deploy key from Convex Dashboard |
| `CONVEX_DEPLOY_KEY` | Preview | Preview deploy key from Convex Dashboard |
| `NEXT_PUBLIC_CONVEX_URL` | All | Auto-injected during Vercel build |

## 📖 Development Guidelines

For detailed development guidelines, architecture patterns, and best practices, see [CLAUDE.md](./CLAUDE.md).

Key principles:
- Default to Server Components (use `'use client'` sparingly)
- Convex is your state manager - no Redux/Zustand needed
- Organize Convex functions by resource (users, videos, etc.)
- Keep client components small and push state down

## 📄 License

MIT
