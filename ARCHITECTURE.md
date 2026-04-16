# AMOPETS — Architecture Document

> **Project Type:** WEB (E-commerce Frontend — Vite + Vanilla JS)
> **Stack:** Vite 6 + HTML5 + CSS3 + Vanilla JavaScript (ES Modules)
> **Deploy Target:** Vercel (Static Site / Edge Functions)
> **Design Approach:** Mobile-First
> **Test Runner:** Vitest + Node.js native `node:test`
> **Updated:** 2026-04-16

---

## 📑 Table of Contents

- [Project Identity](#-project-identity)
- [Current State Assessment](#-current-state-assessment)
- [Target Architecture (Vite + Vercel)](#-target-architecture-vite--vercel)
- [Migration Phases](#-migration-phases)
- [File Map — Current vs Target](#-file-map--current-vs-target)
- [Design System](#-design-system)
- [Mobile-First Strategy](#-mobile-first-strategy)
- [Agent Assignment Matrix](#-agent-assignment-matrix)
- [Vercel Deployment](#-vercel-deployment)
- [Conventions](#-conventions)

---

## 🐾 Project Identity

| Key | Value |
|-----|-------|
| **Brand** | AMOPETS |
| **Tagline** | "Passeio com estilo. Amor de verdade." |
| **Product** | Coleiras (cães e gatos) — exclusivamente |
| **Audience** | Jovens 18-30, predominantemente feminino, "pet parents" |
| **Tone** | Carinhoso, divertido, jovem — nunca corporativo |
| **Design** | "Playful Amethyst" — Purple (#7B2D8E) + Yellow (#FFD23F) |
| **Reference** | Inspired by Zooghy (zooghy.com.br) |

---

## 📊 Current State Assessment

### ✅ Completed Features (Phases 1–7)

| Feature | Status | Files |
|---------|--------|-------|
| Landing Page (8 sections, responsive) | ✅ | `index.html`, `main.js`, `carousel.js` |
| Checkout (3 steps, Pix/Card/Boleto, ViaCEP) | ✅ | `checkout.html`, `checkout.js` |
| Product Detail (gallery, variants, qty) | ✅ | `product.html`, `product.js` |
| Catalog (filters, sort, pagination, URL sync) | ✅ | `catalog.html`, `catalog.js` |
| Cart Drawer (slide-out, localStorage) | ✅ | `cartDrawer.js`, `miniCart.css` |
| SEO (Schema.org, OG, sitemap, robots) | ✅ | All pages |
| Search Transition (lupa → morph bar → catalog) | ✅ | `layout.css`, `main.js` |
| Unit Tests (215 utility + 182 component = 397) | ✅ | `tests/*.test.js` |

### 🔴 Current Technical Debt

| Issue | Impact | Fix in Migration |
|-------|--------|-----------------|
| No build system | No minification, no tree-shaking, no code splitting | Vite solves all |
| IIFE pattern + `window.*` globals | No ES modules, poor encapsulation | ES module imports |
| Multiple `<script>` tags per page | Render-blocking, no bundling | Vite auto-bundles |
| Multiple `<link rel="stylesheet">` per page | No CSS bundling, no PostCSS | Vite CSS pipeline |
| No `package.json` | Can't install deps, no scripts | `npm init` |
| `var` keyword + ES5 patterns | Unnecessary, all target browsers support ES6+ | `const`/`let` |
| `npx http-server` dev server | No HMR, no auto-reload | Vite dev server |
| Static HTML pages (no routing) | Page reloads on navigation, duplicated headers/footers | Vite MPA or vanilla-router |
| No image optimization pipeline | Large PNGs (400-900KB each) | `vite-imagetools` |
| No environment variables | Hardcoded URLs | `.env` + `import.meta.env` |

---

## 🏗 Target Architecture (Vite + Vercel)

```
┌──────────────────────────────────────────────────────────┐
│                    VITE BUILD SYSTEM                      │
│                                                          │
│  vite.config.js ── Multi-page app config                 │
│  .env / .env.production ── Environment variables          │
│  vercel.json ── Deploy config + rewrites                 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    PAGES (MPA — Multi-Page App)           │
│                                                          │
│  index.html ─────── Landing Page (entry point)           │
│  catalog.html ───── Catalog / Shop                       │
│  product.html ───── Product Detail Page                  │
│  checkout.html ──── Multi-step Checkout                  │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    STYLING LAYER (PostCSS)                │
│                                                          │
│  src/css/variables.css ── Design tokens                  │
│  src/css/base.css ─────── Reset, typography, a11y        │
│  src/css/components.css ── Reusable components           │
│  src/css/layout.css ────── Page layouts & grids          │
│  src/css/animations.css ── Keyframes & reveals           │
│  src/css/pages/checkout.css ── Checkout-specific         │
│  src/css/pages/product.css ─── PDP-specific              │
│  src/css/pages/catalog.css ─── Catalog-specific          │
│  src/css/pages/miniCart.css ── Cart drawer                │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                    LOGIC LAYER (ES Modules)               │
│                                                          │
│  src/js/main.js ────────── Landing page entry            │
│  src/js/catalog.js ─────── Catalog entry                 │
│  src/js/product.js ─────── PDP entry                     │
│  src/js/checkout.js ────── Checkout entry                 │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              SHARED MODULES (ES Modules)                  │
│                                                          │
│  src/js/components/*.js ── 9 component modules           │
│  src/js/utils/*.js ─────── 6 utility modules             │
│  src/js/shared/header.js ── Shared header logic          │
│  src/js/shared/footer.js ── Shared footer injection      │
│  src/js/shared/cart-badge.js ── Cart badge sync           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              ASSETS (Optimized by Vite)                   │
│                                                          │
│  public/images/ ── Product + collection PNGs             │
│  public/favicon.ico ── Favicon                           │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              TEST LAYER                                   │
│                                                          │
│  tests/unit/*.test.js ── Vitest unit tests               │
│  tests/e2e/*.spec.js ─── Playwright E2E (future)        │
│                                                          │
├──────────────────────────────────────────────────────────┤
│              DEPLOY (Vercel)                              │
│                                                          │
│  vercel.json ── Routing, headers, edge config            │
│  dist/ ──────── Vite build output (auto-deployed)        │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## 📋 Migration Phases

### Phase M1: Vite Scaffold — `devops-engineer` + `frontend-specialist`

> **Goal:** Get the existing site running under Vite with zero regressions.
> **Duration estimate:** Single session
> **Priority:** 🔴 CRITICAL — blocks everything

```
Step 1: Initialize Vite
├── npm init -y
├── npm install -D vite
├── Create vite.config.js (MPA mode, 4 entry points)
├── Create .gitignore (node_modules, dist)
└── Verify: npm run dev serves index.html

Step 2: Move files to Vite structure
├── css/ → src/css/ (keep structure)
├── js/ → src/js/ (keep structure)
├── images/ → public/images/
├── *.html stays at root (Vite MPA convention)
└── Update all <link> and <script> paths in HTML

Step 3: Convert <script> tags to ES module entries
├── Each page gets ONE <script type="module" src="...">
├── Entry files import their dependencies via ES imports
└── Remove all other <script> tags from HTML

Step 4: Convert IIFEs to ES Modules
├── js/utils/*.js → export functions (remove window.*)
├── js/components/*.js → export functions (remove window.*)
├── js/main.js → import from utils & components
├── js/catalog.js → import from utils & components
├── js/product.js → import from utils & components
├── js/checkout.js → import from utils & components
└── Update tests to use ES imports (or keep CommonJS with dual export)

Step 5: Verify
├── npm run dev — all 4 pages render correctly
├── npm run build — clean build, no errors
├── npm run preview — production preview works
└── node --test tests/ — all 397 tests still pass
```

**Agent:** `devops-engineer` (project scaffold, `vite.config.js`, `package.json`)
**Support:** `frontend-specialist` (HTML/CSS path updates, module conversion)

---

### Phase M2: Mobile-First CSS Audit — `mobile-developer` + `frontend-specialist`

> **Goal:** Audit and fix all CSS for touch-first, mobile-first design.
> **Priority:** 🔴 CRITICAL

```
Audit Checklist:
├── All media queries → mobile-first (min-width, not max-width)
├── Touch targets ≥ 48px on all buttons/links
├── Thumb-zone analysis (primary CTAs in bottom 1/3)
├── Viewport meta tag verified on all pages
├── Font sizes → fluid typography (clamp-based)
├── Images → responsive (srcset/sizes or CSS object-fit)
├── Sidebar filter → sheet/drawer on mobile (not inline)
├── Checkout steps → stacked layout on mobile
├── Cart drawer → full-width on mobile
├── Header → collapsible with hamburger (already done)
├── No horizontal scroll at 320px viewport
├── Text legible at arm's length (16px minimum body)
└── Form inputs → type="tel" for CEP, autocomplete attrs
```

**Agent:** `mobile-developer` (touch audit, thumb zones, gesture patterns)
**Support:** `frontend-specialist` (CSS implementation)

---

### Phase M3: Vercel Deployment — `devops-engineer`

> **Goal:** Deploy to Vercel with custom domain readiness.
> **Priority:** 🔴 CRITICAL

```
Step 1: Create vercel.json
├── Framework: "vite"
├── Build command: "npm run build"
├── Output directory: "dist"
├── Rewrites for clean URLs
└── Security headers (CSP, X-Frame, HSTS)

Step 2: Environment Variables
├── VITE_SITE_URL → for OG/canonical URLs
├── VITE_GA_ID → Google Analytics (future)
└── Set in Vercel dashboard

Step 3: Deploy
├── Connect Git repo to Vercel
├── Automatic deploys on push to main
├── Preview deploys on PRs
└── Verify all 4 pages work in production

Step 4: Performance Baseline
├── Lighthouse mobile score ≥ 90
├── Core Web Vitals passing
├── Image optimization via Vercel Edge
└── Cache headers configured
```

**Agent:** `devops-engineer`
**Support:** `performance-optimizer` (Lighthouse, caching)

---

### Phase M4: Image Optimization Pipeline — `performance-optimizer`

> **Goal:** Reduce page weight by 70%+ with modern image formats.
> **Priority:** 🟡 HIGH

```
├── Convert all PNGs → WebP + AVIF (with PNG fallback)
├── Implement <picture> elements with srcset
├── Lazy-load below-fold images (loading="lazy")
├── Responsive sizes (300w, 600w, 900w)
├── Hero image → preloaded, LCP optimized
└── Total image budget: < 500KB per page
```

**Agent:** `performance-optimizer`

---

### Phase M5: Shared Components Extraction — `frontend-specialist`

> **Goal:** Eliminate duplicated HTML (header, footer, cart drawer) across pages.
> **Priority:** 🟡 HIGH

```
src/js/shared/
├── header.js ── Injects header HTML via JS, manages state
├── footer.js ── Injects footer HTML via JS
├── cart-badge.js ── Syncs cart count badge across pages
└── search.js ── Search transition system (shared)
```

**Rationale:** Currently, header and footer HTML are copy-pasted across 4 pages. With Vite's ES modules, we can extract them into shared modules that inject at runtime, ensuring consistency.

**Agent:** `frontend-specialist`

---

### Phase M6: Test Migration — `test-engineer`

> **Goal:** Migrate 397 tests to Vitest, add E2E baseline.
> **Priority:** 🟡 HIGH

```
Step 1: Unit Tests → Vitest
├── npm install -D vitest
├── Convert node:test → Vitest syntax (describe/it/expect)
├── Keep pure-function testing (no DOM)
├── Verify 397+ tests pass
└── Add vitest.config.js

Step 2: E2E Tests → Playwright
├── npm install -D @playwright/test
├── tests/e2e/smoke.spec.js (P0 — all pages load)
├── tests/e2e/search.spec.js (search flow)
├── tests/e2e/catalog.spec.js (filter + add to cart)
├── tests/e2e/checkout.spec.js (full checkout flow)
└── tests/e2e/mobile.spec.js (mobile viewport tests)
```

**Agent:** `test-engineer` (unit), `qa-automation-engineer` (E2E)

---

### Phase M7: PWA & Offline — `mobile-developer` + `frontend-specialist`

> **Goal:** Progressive Web App for installability + offline product browsing.
> **Priority:** 🟢 MEDIUM (post-launch)

```
├── manifest.json (icons, theme_color, display: standalone)
├── Service Worker (vite-plugin-pwa)
│   ├── Precache: all CSS/JS bundles
│   ├── Runtime cache: product images (stale-while-revalidate)
│   └── Offline fallback page
├── Add to Home Screen prompt
└── Splash screen (Playful Amethyst themed)
```

**Agent:** `mobile-developer` (PWA strategy, offline patterns)
**Support:** `frontend-specialist` (service worker, manifest)

---

### Phase M8: Backend API (Vercel Functions) — `backend-specialist`

> **Goal:** Replace mock data with real API endpoints on Vercel Edge.
> **Priority:** 🟢 MEDIUM (post-launch)

```
api/
├── products.js ──── GET /api/products, GET /api/products/:id
├── cart.js ──────── POST /api/cart (session-based)
├── checkout.js ──── POST /api/checkout (validate + Stripe/Pix)
├── cep.js ──────── GET /api/cep/:cep (proxy to ViaCEP)
└── coupons.js ──── POST /api/coupons/validate
```

**Stack:** Vercel Edge Functions (zero cold start)
**Agent:** `backend-specialist`

---

## 📁 File Map — Current vs Target

```
CURRENT (Vanilla)                    TARGET (Vite)
─────────────────                    ─────────────
amopet/                              amopet/
├── css/                             ├── src/
│   ├── variables.css                │   ├── css/
│   ├── base.css                     │   │   ├── variables.css
│   ├── components.css               │   │   ├── base.css
│   ├── layout.css                   │   │   ├── components.css
│   ├── animations.css               │   │   ├── layout.css
│   ├── checkout.css                 │   │   ├── animations.css
│   ├── product.css                  │   │   └── pages/
│   ├── catalog.css                  │   │       ├── checkout.css
│   └── miniCart.css                 │   │       ├── product.css
│                                    │   │       ├── catalog.css
├── js/                              │   │       └── miniCart.css
│   ├── main.js                      │   │
│   ├── carousel.js                  │   └── js/
│   ├── checkout.js                  │       ├── main.js        ← entry
│   ├── product.js                   │       ├── catalog.js     ← entry
│   ├── catalog.js                   │       ├── product.js     ← entry
│   ├── components/                  │       ├── checkout.js    ← entry
│   │   ├── productCard.js           │       ├── carousel.js
│   │   ├── gallery.js               │       ├── components/    (same)
│   │   ├── sideFilter.js            │       ├── utils/         (same)
│   │   ├── variantSelector.js       │       └── shared/
│   │   ├── quantityStepper.js       │           ├── header.js
│   │   ├── miniCart.js              │           ├── footer.js
│   │   ├── addressForm.js           │           └── cart-badge.js
│   │   ├── orderSummary.js          │
│   │   └── cartDrawer.js           ├── public/
│   └── utils/                       │   ├── images/           (moved)
│       ├── formatters.js            │   └── favicon.ico
│       ├── validators.js            │
│       ├── cart.js                  ├── index.html            (updated paths)
│       ├── badges.js                ├── catalog.html          (updated paths)
│       ├── availability.js          ├── product.html          (updated paths)
│       └── queryParams.js           ├── checkout.html         (updated paths)
│                                    │
├── images/                          ├── vite.config.js
├── tests/                           ├── vercel.json
├── index.html                       ├── package.json
├── catalog.html                     ├── .env
├── checkout.html                    ├── .gitignore
├── product.html                     │
└── ARCHITECTURE.md                  ├── tests/
                                     │   ├── unit/             (migrated)
                                     │   └── e2e/              (new)
                                     │
                                     └── ARCHITECTURE.md
```

---

## 🎨 Design System

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `--color-purple-primary` | `#7B2D8E` | Brand, headings, focus rings |
| `--color-purple-dark` | `#4A1259` | Hero bg, footer, dark accents |
| `--color-purple-light` | `#C589D6` | Hover states, disabled text |
| `--color-yellow-primary` | `#FFD23F` | CTAs, badges, highlights |
| `--color-yellow-dark` | `#E5A800` | Hover CTA, completed states |
| `--color-yellow-light` | `#FFF5CC` | Savings callouts, icon bgs |
| `--color-white` | `#FEFCF9` | Page background |
| `--color-dark` | `#2D1B36` | Body text, footer bg |

### Typography
| Font | Family | Usage |
|------|--------|-------|
| Display | `Fredoka` | Headings, section titles, logo |
| Body | `Quicksand` | Paragraphs, labels, descriptions |
| Accent | `Space Grotesk` | Prices, codes, technical text |

### Border Radius
| Token | Value | Note |
|-------|-------|------|
| `--radius-lg` | `20px` | Inputs, icons |
| `--radius-card` | `24px` | Product/cart cards |
| `--radius-pill` | `50px` | Buttons, badges, nav links |

> **Rule:** No "safe zone" (4-8px). Always go soft (20-24px) or pill (50px).

### Animation Easings
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Hover scale, stepper |
| `--ease-smooth` | `cubic-bezier(0.25, 0.46, 0.45, 0.94)` | Scroll reveals |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit transitions |

---

## 📱 Mobile-First Strategy

### Core Principles (from `mobile-developer`)

| # | Principle | Implementation |
|---|-----------|---------------|
| 1 | **Touch-first** | All interactive elements ≥ 48px, 12px spacing |
| 2 | **Thumb zone** | Primary CTAs in bottom 40% of viewport |
| 3 | **One-hand usage** | Cart drawer, filter sheet accessible from bottom |
| 4 | **Network-resilient** | Lazy load images, aggressive caching, SW for offline |
| 5 | **Battery-conscious** | Minimal JS, CSS-only animations where possible |
| 6 | **Content-first** | Show product grid immediately, defer sidebar |

### Breakpoint Strategy (Mobile-First)

```css
/* Base styles = mobile (320px+) */
.grid { grid-template-columns: 1fr; }

/* Tablet */
@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop */
@media (min-width: 1024px) {
  .grid { grid-template-columns: repeat(3, 1fr); }
}

/* Wide */
@media (min-width: 1280px) {
  .grid { grid-template-columns: repeat(4, 1fr); }
}
```

### Mobile-Specific UI Patterns

| Component | Mobile | Desktop |
|-----------|--------|---------|
| **Nav** | Hamburger → slide-out drawer | Horizontal links |
| **Catalog Filters** | Bottom sheet / full-screen modal | Fixed sidebar |
| **Search** | Full-width expanding bar | Centered 640px bar |
| **Cart Drawer** | Full-screen slide-up | 400px slide-right |
| **Product Gallery** | Swipe carousel (touch) | Thumbnails + zoom |
| **Checkout** | Stacked steps, large inputs | Side-by-side layout |
| **Footer** | Single column, stacked | 4-column grid |

### Touch Target Validation

```
EVERY interactive element MUST satisfy:
├── width ≥ 48px (CSS)
├── height ≥ 48px (CSS)
├── gap ≥ 12px from adjacent targets
├── visible focus ring on :focus-visible
└── active state feedback (scale or color change)
```

---

## 🤖 Agent Assignment Matrix

### Migration Phases

| Phase | Lead Agent | Support | Domain |
|-------|-----------|---------|--------|
| **M1: Vite Scaffold** | `devops-engineer` | `frontend-specialist` | Build system, project config |
| **M2: Mobile-First CSS** | `mobile-developer` | `frontend-specialist` | Touch audit, responsive CSS |
| **M3: Vercel Deploy** | `devops-engineer` | `performance-optimizer` | Deploy config, headers, CDN |
| **M4: Image Optimization** | `performance-optimizer` | — | WebP/AVIF, srcset, lazy load |
| **M5: Shared Components** | `frontend-specialist` | — | Header/footer extraction |
| **M6: Test Migration** | `test-engineer` | `qa-automation-engineer` | Vitest + Playwright |
| **M7: PWA & Offline** | `mobile-developer` | `frontend-specialist` | Service worker, manifest |
| **M8: Backend API** | `backend-specialist` | `database-architect` | Vercel Edge Functions |

### Agent Boundaries

| Agent | Owns These Files | ❌ Cannot Touch |
|-------|------------------|-----------------| 
| `devops-engineer` | `vite.config.js`, `vercel.json`, `package.json`, `.env`, CI configs | Application code |
| `frontend-specialist` | `src/css/*`, `src/js/*`, `*.html` | Tests, deploy config |
| `mobile-developer` | Mobile CSS audit, touch targets, PWA config, responsive patterns | Non-mobile CSS, JS logic |
| `test-engineer` | `tests/unit/*` | Production code |
| `qa-automation-engineer` | `tests/e2e/*` | Production code |
| `performance-optimizer` | Image pipeline, critical CSS, lazy loading | Business logic |
| `backend-specialist` | `api/*` (Vercel functions) | Frontend code |

---

## ☁️ Vercel Deployment

### `vercel.json`

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

### `vite.config.js` (Target)

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalog: resolve(__dirname, 'catalog.html'),
        product: resolve(__dirname, 'product.html'),
        checkout: resolve(__dirname, 'checkout.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

---

## 📐 Conventions

### CSS
- BEM naming: `.block__element--modifier`
- Design tokens only (no magic numbers)
- **Mobile-first** media queries (`min-width` only)
- `prefers-reduced-motion` support mandatory
- `focus-visible` rings on all interactive elements
- Touch targets ≥ 48px on mobile

### JavaScript
- **ES Modules** (`import`/`export`) — no IIFEs, no `window.*` globals
- Pure functions, immutable state (`Object.assign`, spread)
- `const`/`let` only (no `var`)
- Brazilian Portuguese for all user-facing strings
- Entry point per page imports all its dependencies

### HTML
- Semantic HTML5 (`<article>`, `<nav>`, `<section>`, `<aside>`)
- Every interactive element has unique `id`
- Every image has descriptive `alt` text
- `aria-label` on icon buttons
- `aria-live` on dynamic regions
- `<script type="module">` for all JS entries

### Testing
- **Vitest** for unit tests (fast, ES module native)
- **Playwright** for E2E tests (cross-browser, mobile viewports)
- AAA pattern (Arrange → Act → Assert)
- One assertion focus per test
- Mobile viewport tests mandatory for all E2E specs

### Accessibility (WCAG 2.1 AA)
- Color contrast ≥ 4.5:1 for normal text
- All interactive elements ≥ 48×48px touch target (mobile-developer standard)
- Keyboard navigation (Tab, Enter, Space, Escape)
- Skip-to-content link
- Screen reader announcements via `aria-live`
- `prefers-reduced-motion` respected

---

## ⚡ Scripts & Commands

### Current (Pre-migration)

```bash
# Run all tests (397 passing)
node --test tests/all-unit-tests.js tests/components.test.js

# Start dev server
npx http-server -p 3000 -c-1
```

### Target (Post-migration)

```bash
# Dev server (HMR, auto-reload)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Lighthouse audit
npx lighthouse http://localhost:3000 --output html

# Deploy (automatic via Vercel Git integration)
git push origin main
```
