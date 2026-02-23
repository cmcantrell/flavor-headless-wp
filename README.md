# Flavor — Headless WordPress Framework

A headless WordPress starter built on Next.js 16, WPGraphQL, and React 19. Designed as an installable "theme" for existing WordPress sites — bring your own WordPress, drop in the plugin + theme, point the frontend at it.

> **Status:** The headless app and monorepo structure are complete. WP plugin/theme zips can be built via `scripts/package-wp.sh`. CI runs on every push to `main`.

## How It Works

```
┌─────────────────────┐        GraphQL         ┌──────────────────────┐
│   Next.js Frontend   │ ◄──────────────────── │      WordPress       │
│   (apps/web)         │                        │  + WPGraphQL         │
│   Docker / Vercel    │ ────────────────────► │  + Headless Core     │
│                      │    Revalidation hook   │  + Headless Theme    │
└─────────────────────┘                        └──────────────────────┘
```

WordPress and the frontend are **completely separate**. WordPress runs wherever you already have it (shared hosting, VPS, managed WP). The Next.js frontend connects via environment variables and can be deployed independently via Docker, Vercel, or any Node.js host.

## Architecture

```
├── _docker/                    Local dev stack (WP + MySQL + nginx SSL + Redis)
├── app/                        Local WP installation (mounted by Docker, NOT distributed)
│   └── wp-content/
│       ├── plugins/
│       │   └── headless-core/  WP plugin: settings, GraphQL extensions, preview, revalidation
│       └── themes/
│           └── headless-theme/ WP theme: menu locations, image sizes, theme support
├── headless/                   Next.js monorepo (Turborepo + pnpm workspaces)
│   ├── apps/web/               Next.js 16 application (@flavor/web)
│   ├── packages/core/          Shared library (@flavor/core) — components, hooks, GraphQL
│   ├── turbo.json              Build orchestration
│   ├── pnpm-workspace.yaml     Workspace definition
│   └── docker-compose.production.yml  Production deployment (app + Redis)
├── deploy/                     Server configs (not distributed)
└── README.md
```

### Monorepo Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@flavor/web` | `apps/web/` | Next.js app — routes, API endpoints, layouts |
| `@flavor/core` | `packages/core/` | Shared library — GraphQL client, queries, components, hooks, contexts, Redis, auth |

`@flavor/core` exports raw TypeScript. The web app transpiles it via `transpilePackages` in `next.config.ts`.

### WordPress Components

| Component | Path | Purpose |
|-----------|------|---------|
| **Headless Core** (plugin) | `app/wp-content/plugins/headless-core/` | Settings page, GraphQL schema extensions, preview redirect, ISR revalidation webhooks |
| **Headless Theme** (theme) | `app/wp-content/themes/headless-theme/` | Registers menu locations (primary + footer), image sizes, theme support |

**Required WordPress plugins:** WPGraphQL, Headless Login for WPGraphQL (declared in the Headless Core plugin header).

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| API | WPGraphQL (GraphQL) |
| Client Cache | SWR (dedup, stale-while-revalidate) |
| Server Cache | ISR (Next.js) + Redis (optional) |
| Auth | Headless Login for WPGraphQL, JWT in httpOnly cookies |
| CMS | WordPress 6.x |
| Build | Turborepo + pnpm workspaces |
| Containers | Docker Compose |

## Features

### Content
- **Homepage** — respects WP "Settings > Reading > Static page" via `nodeByUri("/")`
- **Blog** — `/blog` with hybrid Load More + numbered pagination, respects `postsPerPage`
- **Posts** — `/blog/[slug]` with author, categories, tags, featured image, comments
- **Pages** — `/[slug]` catch-all for any WP page
- **Category archives** — `/category/[slug]` with Load More pagination
- **Tag archives** — `/tag/[slug]` with Load More pagination
- **Author pages** — `/author/[slug]` with bio, avatar, and posts
- **Search** — `/search` with full-text search and Load More

### Navigation
- WP theme registers `primary` + `footer` menu locations
- Fetched via `GET_MENU_BY_LOCATION` GraphQL query in root layout
- Header renders dropdown child items, Footer renders flat links

### Comments
- Threaded comments (5 levels, configurable via WP Discussion settings)
- Server-rendered initial load + SWR client-side refresh
- Respects: avatars, require name/email, registration required, threading depth
- Mutations go through `/api/graphql` proxy → WP `createComment`

### Authentication
- Login / register / logout via API routes
- JWT tokens stored in httpOnly cookies (never exposed to client JS)
- Account dashboard — view/edit profile, change password
- Session refresh at 75% of token lifetime
- Rate limiting on all auth endpoints (5 req/60s sliding window)

### Caching (Multi-Layer)
```
Browser ← SWR (client dedup, stale-while-revalidate)
       ← /api/graphql proxy (Redis cache + CDN headers)
       ← Next.js ISR (server-side, 5min default, instant via revalidation webhook)
       ← WordPress / WPGraphQL
```

### On-Demand Revalidation
- WP plugin fires webhook on post/page/comment/menu/settings changes
- Next.js endpoint (`/api/revalidate`) accepts POST with shared secret
- Smart path invalidation — only busts cache for affected pages

### Security
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP, Referrer-Policy)
- Rate limiting on auth routes (in-memory sliding window)
- Health check endpoint (`/api/health`)

### SEO & Feeds
- XML sitemap (`/sitemap.xml`)
- RSS feed (`/feed`)
- robots.txt (respects WP "Discourage search engines" setting)

## Local Development

### Prerequisites

- Docker Desktop
- Node.js 20+ / pnpm 9+
- mkcert (`brew install mkcert nss && mkcert -install`)

### Quick Start

```bash
# Start the full stack (WP + Next.js + Redis + phpMyAdmin)
cd _docker && docker compose up -d

# Or run headless outside Docker for faster HMR
cd headless && pnpm install && pnpm dev
```

### Services

| Service | URL |
|---------|-----|
| **Headless Frontend** | http://localhost:3000 |
| **WordPress Admin** | https://wordpress.test/wp-admin |
| **WPGraphQL IDE** | https://wordpress.test/wp-admin → GraphQL |
| **phpMyAdmin** | http://localhost:8092 |
| **GraphQL Endpoint** | https://wordpress.test/graphql |

### Environment Variables

Copy `headless/.env.example` to `headless/.env.local`:

```env
NEXT_PUBLIC_WORDPRESS_URL=https://wordpress.test
NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://wordpress.test/graphql
REVALIDATE_SECRET=your-secret-here

# Optional
# REDIS_URL=redis://localhost:6379/0
# ISR_REVALIDATE_SECONDS=300
# OPTIMIZE_IMAGES=true
# IMAGE_DOMAINS=cdn.example.com
```

## Production Deployment

The production Docker setup ships **only** the Next.js app + Redis. WordPress runs separately.

```bash
cd headless
docker compose -f docker-compose.production.yml up -d --build
```

Configure your WordPress URL and revalidation secret via environment variables in `docker-compose.production.yml`.

## WordPress Setup (Existing Site)

To connect an existing WordPress site:

1. Install and activate **WPGraphQL** plugin
2. Install and activate **Headless Login for WPGraphQL** plugin
3. Install and activate **Headless Core** plugin (from `app/wp-content/plugins/headless-core/`)
4. Install and activate **Headless Theme** (from `app/wp-content/themes/headless-theme/`)
5. Go to **Settings > Headless** — set Frontend URL and Revalidation Secret
6. Go to **Appearance > Menus** — assign menus to Primary and Footer locations
7. Point the Next.js app at your WP instance via env vars

## Project Structure (Headless)

```
headless/
├── apps/web/src/
│   ├── app/
│   │   ├── layout.tsx                Root layout (settings, menus, providers)
│   │   ├── page.tsx                  Homepage
│   │   ├── not-found.tsx             404
│   │   ├── error.tsx                 Error boundary
│   │   ├── sitemap.ts               XML sitemap
│   │   ├── robots.ts                robots.txt
│   │   ├── [slug]/page.tsx           CMS pages
│   │   ├── blog/
│   │   │   ├── page.tsx              Blog listing
│   │   │   ├── [slug]/page.tsx       Single post + comments
│   │   │   └── page/[page]/page.tsx  Numbered pagination
│   │   ├── category/[slug]/page.tsx  Category archive
│   │   ├── tag/[slug]/page.tsx       Tag archive
│   │   ├── author/[slug]/page.tsx    Author archive
│   │   ├── search/page.tsx           Search results
│   │   ├── account/                  User profile (auth protected)
│   │   ├── feed/route.ts             RSS feed
│   │   └── api/
│   │       ├── graphql/route.ts      GraphQL proxy (Redis cache)
│   │       ├── revalidate/route.ts   ISR revalidation webhook
│   │       ├── health/route.ts       Health check
│   │       └── auth/                 Login, register, logout, session, password
│   └── styles/                       Tailwind CSS
│
├── packages/core/src/
│   ├── components/
│   │   ├── Header.tsx / Footer.tsx   Navigation
│   │   ├── auth/                     LoginForm, RegisterForm, UserMenu, AuthModal
│   │   ├── blog/                     PostCard, PostList, ArchivePostList
│   │   ├── comments/                 CommentSection, CommentItem, CommentForm
│   │   ├── search/                   SearchResults
│   │   └── account/                  ProfileForm, PasswordForm
│   ├── context/
│   │   ├── SiteContext.tsx            Global settings, menus, discussion config
│   │   └── AuthContext.tsx            User auth state, login/logout/register
│   └── lib/
│       ├── wordpress/
│       │   ├── client.ts             wpFetch() — server-side GraphQL with ISR
│       │   ├── types.ts              TypeScript interfaces
│       │   ├── fragments.ts          GraphQL fragments
│       │   ├── pagination.ts         Relay cursor helpers
│       │   ├── archive.ts            fetchArchiveData() helper
│       │   └── queries/              All GraphQL queries and mutations
│       ├── redis/                     Optional server-side cache
│       ├── swr/                       Client-side SWR config + provider
│       ├── auth/cookies.ts            httpOnly cookie management
│       ├── hooks/useLoadMore.ts       Client-side pagination hook
│       └── rateLimit.ts               In-memory rate limiter
```

## Headless Core Plugin

| File | Purpose |
|------|---------|
| `class-settings.php` | Settings > Headless page (frontend URL, revalidation secret, token lifetimes) |
| `class-graphql.php` | Extends WPGraphQL: `headlessConfig`, `discussionConfig`, `blogPublic`, `postsPerPageMax` |
| `class-preview.php` | Rewrites WP preview links to Next.js frontend |
| `class-revalidate.php` | Fires webhook to Next.js on post/page/comment/menu/settings changes |

## Future: Optional Modules

The architecture supports optional plugin/modules for extended functionality. These would be separate packages — not part of the base install:

- **WooCommerce** — product catalog, cart, checkout (via WooGraphQL)
- **Multi-language** — WPML or Polylang integration
- **Advanced SEO** — Yoast SEO + WPGraphQL Yoast extension
- **Edge caching** — Cloudflare cache tag purging
