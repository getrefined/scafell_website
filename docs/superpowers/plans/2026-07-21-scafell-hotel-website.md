# The Scafell Hotel Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the static marketing website for The Scafell Hotel (8 pages + 404) in Astro 5, per `docs/superpowers/specs/2026-07-21-scafell-hotel-website-design.md`.

**Architecture:** Fully static Astro site. All copy lives in typed data files under `src/content/` and page frontmatter; all external/placeholder values (booking URL, form endpoint, phone…) live in `src/config/site.ts`. Styling is hand-rolled CSS: design tokens in `src/styles/tokens.css`, shared layout/typography in `src/styles/global.css`, component-specific styles scoped inside each `.astro` component. Animation is CSS-first with one small IntersectionObserver script, gated behind `prefers-reduced-motion`.

**Tech Stack:** Astro 5, TypeScript (strict), `@astrojs/sitemap`, `@fontsource/prata`, `@fontsource/manrope`. No UI framework, no Tailwind, no test framework (per spec — `astro build` + `astro check` are the gate).

## Global Constraints

- Fonts: headings **Prata Regular**, body **Manrope** Light(300)/Regular(400)/Bold(700), self-hosted via `@fontsource`.
- Palette (exact values): Lake Blue `#2D3540`, Mountain Blue `#54728C`, Sky Blue `#BDD9F2`, Fell Green `#8A8C46`, Gorse Purple `#7C506E`. Page background is warm off-white `#FAF8F5`, not stark white.
- All page copy is **verbatim** from `Client Docs/brief.md` — do not rewrite, "improve", or paraphrase it. (Short room/offer/explore card blurbs that the brief doesn't provide are written new; those are given in full in this plan.)
- Contact facts (use exactly): phone `+44 17687 77208`, email `info@scafellhotel.co.uk`, address `The Scafell Hotel, Rosthwaite, Keswick CA12 5XB, United Kingdom`.
- Unset booking URL → every BOOK NOW button links to `/contact`. Never ship a dead `#` link.
- All motion is disabled under `@media (prefers-reduced-motion: reduce)`.
- Verification for every task: `npm run build` must succeed (the `build` script runs `astro check && astro build`). There is no unit-test framework — build + check + the stated manual/grep verifications ARE the test cycle.
- Commit after every task (and at any intermediate point marked "Commit").
- Run all commands from the repo root: `/Users/ajs/WebstormProjects/scafell-claude`.

---

### Task 1: Convert repo to an Astro 5 project with brand tokens and a building skeleton

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Delete: `src/index.ts`
- Create: `astro.config.mjs`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/layouts/Base.astro` (minimal — extended in Task 4)
- Create: `src/pages/index.astro` (placeholder — replaced in Task 6)
- Modify: `.gitignore`

**Interfaces:**
- Produces: `Base.astro` with props `{ title: string; description: string }` and a default slot — every page task wraps its content in this layout. Produces global CSS classes used by all later tasks: `.container`, `.section`, `.eyebrow`, `.btn`, `.btn--ghost`, `.reveal`, `.grid`, `.grid--2`, `.grid--3`, `.feature`, `.feature--flip`, `.band`, `.band--green`.

- [ ] **Step 1: Install dependencies and remove the old scaffold**

```bash
npm install astro @astrojs/sitemap @fontsource/prata @fontsource/manrope
rm src/index.ts
```

- [ ] **Step 2: Replace `package.json` scripts**

Edit `package.json` so `main` is removed and scripts are:

```json
{
  "name": "scafell-claude",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro check && astro build",
    "preview": "astro preview"
  }
}
```

Keep the `dependencies`/`devDependencies` npm wrote in Step 1. Move `typescript` into `dependencies` if npm left it in `devDependencies` — or just leave it; either works with `astro check`. Also run `npm install @astrojs/check` (needed by `astro check`).

- [ ] **Step 3: Replace `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "src/**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Create `astro.config.mjs`**

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.scafellhotel.co.uk',
  integrations: [sitemap()],
});
```

- [ ] **Step 5: Create `src/styles/tokens.css`**

```css
:root {
  /* Brand palette */
  --c-lake: #2d3540;
  --c-mountain: #54728c;
  --c-sky: #bdd9f2;
  --c-fell: #8a8c46;
  --c-gorse: #7c506e;
  --c-offwhite: #faf8f5;
  --c-white: #ffffff;
  --c-scrim: rgba(20, 26, 32, 0.45);

  /* Type */
  --font-display: 'Prata', 'Georgia', serif;
  --font-body: 'Manrope', system-ui, sans-serif;

  /* Scale */
  --space-xs: 0.5rem;
  --space-s: 1rem;
  --space-m: 2rem;
  --space-l: 4rem;
  --space-xl: 7rem;
  --container: 72rem;
  --radius: 4px;

  /* Motion */
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  --dur: 0.7s;
}
```

- [ ] **Step 6: Create `src/styles/global.css`**

```css
@import './tokens.css';

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-body);
  font-weight: 300;
  line-height: 1.7;
  color: var(--c-lake);
  background: var(--c-offwhite);
  -webkit-font-smoothing: antialiased;
}

img {
  max-width: 100%;
  height: auto;
  display: block;
}

h1,
h2,
h3 {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 1.15;
  margin: 0 0 var(--space-s);
}

h1 { font-size: clamp(2.2rem, 5vw, 3.8rem); }
h2 { font-size: clamp(1.7rem, 3.5vw, 2.6rem); }
h3 { font-size: clamp(1.2rem, 2vw, 1.5rem); }

p { margin: 0 0 var(--space-s); }

a { color: var(--c-mountain); }

ul { padding-left: 1.2em; }

.container {
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: clamp(1rem, 4vw, 2rem);
}

.section { padding-block: clamp(var(--space-l), 9vw, var(--space-xl)); }

.eyebrow {
  display: block;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--c-fell);
  margin-bottom: var(--space-s);
}

/* Buttons */
.btn {
  display: inline-block;
  font-family: var(--font-body);
  font-weight: 700;
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--c-white);
  background: var(--c-mountain);
  border: 1px solid var(--c-mountain);
  border-radius: var(--radius);
  padding: 0.9em 2em;
  cursor: pointer;
  transition: background 0.25s var(--ease-out), color 0.25s var(--ease-out);
}

.btn:hover { background: var(--c-lake); border-color: var(--c-lake); }

.btn--ghost {
  background: transparent;
  color: var(--c-white);
  border-color: var(--c-white);
}

.btn--ghost:hover { background: var(--c-white); color: var(--c-lake); }

/* Grids */
.grid { display: grid; gap: var(--space-m); }
.grid--2 { grid-template-columns: repeat(auto-fit, minmax(min(20rem, 100%), 1fr)); }
.grid--3 { grid-template-columns: repeat(auto-fit, minmax(min(16rem, 100%), 1fr)); }

/* Alternating image/text feature rows */
.feature {
  display: grid;
  gap: clamp(var(--space-m), 5vw, var(--space-l));
  align-items: center;
}

@media (min-width: 50rem) {
  .feature { grid-template-columns: 1fr 1fr; }
  .feature--flip > :first-child { order: 2; }
}

.feature img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: var(--radius);
}

/* Full-width colour bands */
.band {
  background: var(--c-lake);
  color: var(--c-white);
  text-align: center;
}

.band--green { background: var(--c-fell); }

.band a:not(.btn) { color: var(--c-sky); }

/* Scroll reveal */
.reveal {
  opacity: 0;
  transform: translateY(1.5rem);
  transition: opacity var(--dur) var(--ease-out), transform var(--dur) var(--ease-out);
}

.reveal.is-visible {
  opacity: 1;
  transform: none;
}

.grid > .reveal:nth-child(2) { transition-delay: 0.1s; }
.grid > .reveal:nth-child(3) { transition-delay: 0.2s; }
.grid > .reveal:nth-child(4) { transition-delay: 0.3s; }
.grid > .reveal:nth-child(5) { transition-delay: 0.4s; }
.grid > .reveal:nth-child(6) { transition-delay: 0.5s; }

@media (prefers-reduced-motion: reduce) {
  .reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 7: Create minimal `src/layouts/Base.astro`** (Task 4 extends it with header/footer/SEO)

```astro
---
import '@fontsource/prata';
import '@fontsource/manrope/300.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/700.css';
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
  </head>
  <body>
    <slot />
  </body>
</html>
```

- [ ] **Step 8: Create placeholder `src/pages/index.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base title="The Scafell Hotel" description="Placeholder">
  <main class="container section"><h1>The Scafell Hotel</h1></main>
</Base>
```

- [ ] **Step 9: Append build artefacts to `.gitignore`**

Add these lines to `.gitignore`:

```
node_modules/
dist/
.astro/
```

- [ ] **Step 10: Verify the build**

Run: `npm run build`
Expected: `astro check` reports 0 errors, build completes, `dist/index.html` exists. Check with `ls dist/index.html`.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: scaffold Astro 5 project with brand tokens and global styles"
```

---

### Task 2: Brand assets and placeholder photography

**Files:**
- Create: `public/logo-white.svg`, `public/logo-colour.svg`, `public/favicon.svg` (copies from Client Docs)
- Create: `src/assets/images/*.jpg` (16 placeholder photos)
- Create: `scripts/fetch-placeholders.sh`

**Interfaces:**
- Produces: image files at exact paths that Tasks 3–13 import via `import x from '../assets/images/<name>.jpg'`. Names (all under `src/assets/images/`): `hero-home.jpg`, `hero-rooms.jpg`, `hero-restaurant.jpg`, `hero-events.jpg`, `hero-offers.jpg`, `hero-explore.jpg`, `hero-gallery.jpg`, `hero-contact.jpg`, `feature-rooms.jpg`, `feature-dining.jpg`, `feature-explore.jpg`, `room-family.jpg`, `room-double.jpg`, `room-twin.jpg`, `room-single.jpg`, `dining-detail.jpg`. Produces `/logo-white.svg`, `/logo-colour.svg`, `/favicon.svg` public URLs.

- [ ] **Step 1: Copy logo SVGs from Client Docs**

```bash
cp "Client Docs/LOGO SUITE/2- SCREEN/Scafell Hotel Logo WHITE.svg" public/logo-white.svg
cp "Client Docs/LOGO SUITE/2- SCREEN/Scafell Hotel Logo RGB.svg" public/logo-colour.svg
cp "Client Docs/LOGO SUITE/3- ICON/SCREEN/Scafell Hotel Icon Outline Mountain Blue RGB.svg" public/favicon.svg
```

If a filename differs on disk, list the directory (`ls "Client Docs/LOGO SUITE/2- SCREEN/"`) and copy the white SVG, the colour (RGB) SVG, and any Icon Outline SVG respectively. Do not rename anything inside `Client Docs/`.

- [ ] **Step 2: Create `scripts/fetch-placeholders.sh`**

Placeholder photos are scenic stand-ins served by picsum.photos (Unsplash-sourced, free licence). They exist only until the client's photography arrives; the swap is file-replacement + no code changes.

```bash
#!/usr/bin/env bash
# Downloads placeholder photography. Re-runnable; skips existing files.
set -euo pipefail
dir="src/assets/images"
mkdir -p "$dir"

fetch() { # fetch <picsum-id> <filename> <width> <height>
  local out="$dir/$2"
  [ -f "$out" ] && { echo "skip $2"; return; }
  curl -fsSL "https://picsum.photos/id/$1/$3/$4.jpg" -o "$out"
  echo "got  $2"
}

# Heroes (2000x1300 landscape)
fetch 1018 hero-home.jpg 2000 1300
fetch 1015 hero-rooms.jpg 2000 1300
fetch 429  hero-restaurant.jpg 2000 1300
fetch 1048 hero-events.jpg 2000 1300
fetch 1043 hero-offers.jpg 2000 1300
fetch 1036 hero-explore.jpg 2000 1300
fetch 1039 hero-gallery.jpg 2000 1300
fetch 1044 hero-contact.jpg 2000 1300

# Feature / card images (1200x900)
fetch 1040 feature-rooms.jpg 1200 900
fetch 425  feature-dining.jpg 1200 900
fetch 1016 feature-explore.jpg 1200 900
fetch 1060 dining-detail.jpg 1200 900
fetch 1067 room-family.jpg 1200 900
fetch 1069 room-double.jpg 1200 900
fetch 1075 room-twin.jpg 1200 900
fetch 1080 room-single.jpg 1200 900
```

- [ ] **Step 3: Run it**

```bash
chmod +x scripts/fetch-placeholders.sh && ./scripts/fetch-placeholders.sh
```

Expected: 16 `got …` lines. Verify: `ls src/assets/images | wc -l` → `16`.

If any single ID returns 404, substitute another numeric id (any of 10, 28, 29, 110, 235, 1000–1084) — the exact photo doesn't matter, only that the file lands at the exact filename above.

- [ ] **Step 4: Commit**

```bash
git add public/logo-white.svg public/logo-colour.svg public/favicon.svg src/assets/images scripts/fetch-placeholders.sh
git commit -m "feat: add brand logos and placeholder photography"
```

---

### Task 3: Site config and typed content data

**Files:**
- Create: `src/config/site.ts`
- Create: `src/content/rooms.ts`
- Create: `src/content/offers.ts`
- Create: `src/content/explore.ts`

**Interfaces:**
- Consumes: image files from Task 2.
- Produces (exact signatures — later tasks import these):
  - `site` object and `bookingHref: string` from `src/config/site.ts`
  - `rooms: Room[]` where `Room = { name: string; description: string; image: ImageMetadata; alt: string }`
  - `offers: Offer[]` where `Offer = { name: string; description: string }`
  - `highlights: Highlight[]` where `Highlight = { name: string; description: string; image: ImageMetadata; alt: string }`

- [ ] **Step 1: Create `src/config/site.ts`**

```ts
export const site = {
  name: 'The Scafell Hotel',
  tagline: 'Lake District',
  url: 'https://www.scafellhotel.co.uk',

  // ── Placeholders: set these when known ──────────────────────────
  bookingUrl: '', // external booking engine URL; '' → BOOK NOW links to /contact
  formEndpoint: '', // e.g. https://formspree.io/f/xxxxxxxx
  menusUrl: '', // link/PDF for VIEW MENUS; '' → hide the button
  facebookUrl: '', // '' → hide icon
  instagramUrl: '', // '' → hide icon
  // ────────────────────────────────────────────────────────────────

  phone: '+44 17687 77208',
  phoneHref: 'tel:+441768777208',
  email: 'info@scafellhotel.co.uk',
  address: {
    line1: 'The Scafell Hotel',
    line2: 'Lake District National Park',
    village: 'Rosthwaite',
    town: 'Keswick',
    postcode: 'CA12 5XB',
    country: 'United Kingdom',
  },
  directionsUrl:
    'https://www.google.com/maps/search/?api=1&query=The+Scafell+Hotel+Rosthwaite+Keswick+CA12+5XB',
} as const;

/** BOOK NOW target — Contact page until a booking engine is chosen. */
export const bookingHref: string = site.bookingUrl || '/contact/';
```

- [ ] **Step 2: Create `src/content/rooms.ts`**

```ts
import type { ImageMetadata } from 'astro';
import family from '../assets/images/room-family.jpg';
import double from '../assets/images/room-double.jpg';
import twin from '../assets/images/room-twin.jpg';
import single from '../assets/images/room-single.jpg';

export interface Room {
  name: string;
  description: string;
  image: ImageMetadata;
  alt: string;
}

export const rooms: Room[] = [
  {
    name: 'Family',
    description:
      'Spacious, flexible rooms with space for everyone — the perfect base for a Lake District adventure together.',
    image: family,
    alt: 'A spacious family bedroom at The Scafell Hotel',
  },
  {
    name: 'Double',
    description:
      'Cosy and characterful doubles, ideal for a romantic escape or a restful night after a day on the fells.',
    image: double,
    alt: 'A cosy double bedroom at The Scafell Hotel',
  },
  {
    name: 'Twin',
    description:
      'Comfortable twin rooms, well suited to walking companions and friends exploring the Lakes together.',
    image: twin,
    alt: 'A comfortable twin bedroom at The Scafell Hotel',
  },
  {
    name: 'Single',
    description:
      'Snug, thoughtfully furnished single rooms for the solo traveller discovering Borrowdale.',
    image: single,
    alt: 'A snug single bedroom at The Scafell Hotel',
  },
];
```

- [ ] **Step 3: Create `src/content/offers.ts`** (names verbatim from the brief's Current Offers list)

```ts
export interface Offer {
  name: string;
  description: string;
}

export const offers: Offer[] = [
  {
    name: 'Seasonal getaway packages',
    description: 'Escape to Borrowdale with stays shaped around the best of every season.',
  },
  {
    name: 'Midweek stay offers',
    description: 'Enjoy the quieter side of the Lakes with special midweek rates.',
  },
  {
    name: 'Walking and adventure breaks',
    description: 'Packages made for the fells — hearty breakfasts, comfortable beds and the mountains on your doorstep.',
  },
  {
    name: 'Dining experiences',
    description: 'Stay and dine with seasonal menus celebrating the finest local ingredients.',
  },
  {
    name: 'Extended stay savings',
    description: 'The longer you stay, the more you save — ideal for a proper countryside retreat.',
  },
  {
    name: 'Special occasion packages',
    description: 'Birthdays, anniversaries and celebrations, made memorable in the heart of the Lakes.',
  },
];
```

- [ ] **Step 4: Create `src/content/explore.ts`** (names verbatim from the brief's Nearby Highlights list)

```ts
import type { ImageMetadata } from 'astro';
import heroExplore from '../assets/images/hero-explore.jpg';
import featureExplore from '../assets/images/feature-explore.jpg';
import heroHome from '../assets/images/hero-home.jpg';
import heroRooms from '../assets/images/hero-rooms.jpg';
import heroGallery from '../assets/images/hero-gallery.jpg';
import heroContact from '../assets/images/hero-contact.jpg';

export interface Highlight {
  name: string;
  description: string;
  image: ImageMetadata;
  alt: string;
}

export const highlights: Highlight[] = [
  {
    name: 'Scafell Pike',
    description: "England's highest mountain, rising just beyond the valley.",
    image: heroExplore,
    alt: 'Mountain scenery near Scafell Pike',
  },
  {
    name: 'Borrowdale Valley',
    description: 'One of the most beautiful valleys in the Lake District, right outside the door.',
    image: featureExplore,
    alt: 'The Borrowdale Valley',
  },
  {
    name: 'Derwentwater',
    description: 'Tranquil waters, island views and lakeside walks a short drive away.',
    image: heroHome,
    alt: 'Derwentwater lake',
  },
  {
    name: 'Keswick',
    description: 'A charming market town full of independent shops, cafés and local history.',
    image: heroRooms,
    alt: 'The market town of Keswick',
  },
  {
    name: 'Catbells',
    description: 'A famously rewarding fell walk with spectacular views over the lake.',
    image: heroGallery,
    alt: 'The Catbells ridge',
  },
  {
    name: 'Honister Pass',
    description: 'A dramatic mountain pass and slate mine at the head of the valley.',
    image: heroContact,
    alt: 'The Honister Pass',
  },
];
```

*(Highlight images intentionally reuse hero photos — they're placeholders; each highlight gets its own real photo later by editing only this file.)*

- [ ] **Step 5: Verify**

Run: `npm run build`
Expected: 0 errors (data files type-check even though nothing imports them yet).

- [ ] **Step 6: Commit**

```bash
git add src/config src/content
git commit -m "feat: add site config and typed content data"
```

---

### Task 4: Header, Footer, full Base layout (SEO, fonts, reveal script)

**Files:**
- Create: `src/components/Header.astro`
- Create: `src/components/Footer.astro`
- Modify: `src/layouts/Base.astro`

**Interfaces:**
- Consumes: `site`, `bookingHref` from `src/config/site.ts`.
- Produces: final `Base.astro` props `{ title: string; description: string; transparentHeader?: boolean }`. Pages with a full-screen hero pass `transparentHeader` (default `true`); the header overlays the hero and turns solid Lake Blue on scroll. Emits the IntersectionObserver reveal script globally, favicon, OG tags, and Hotel JSON-LD.

- [ ] **Step 1: Create `src/components/Header.astro`**

```astro
---
import { site, bookingHref } from '../config/site';

interface Props {
  transparent?: boolean;
}

const { transparent = true } = Astro.props;

const links = [
  { href: '/', label: 'Home' },
  { href: '/rooms/', label: 'Rooms' },
  { href: '/restaurant/', label: 'Restaurant' },
  { href: '/private-events/', label: 'Private Events' },
  { href: '/offers/', label: 'Offers' },
  { href: '/explore/', label: 'Explore' },
  { href: '/gallery/', label: 'Gallery' },
  { href: '/contact/', label: 'Contact' },
];

const current = Astro.url.pathname;
---

<header class:list={['site-header', { 'site-header--solid': !transparent }]}>
  <div class="site-header__inner container">
    <a class="site-header__brand" href="/" aria-label={site.name}>
      <img src="/logo-white.svg" alt="" width="150" height="60" />
    </a>
    <nav class="site-header__nav" id="site-nav" aria-label="Main">
      <ul>
        {
          links.map((l) => (
            <li>
              <a href={l.href} aria-current={current === l.href ? 'page' : undefined}>
                {l.label}
              </a>
            </li>
          ))
        }
      </ul>
    </nav>
    <a class="btn site-header__book" href={bookingHref}>Book Now</a>
    <button
      class="site-header__toggle"
      type="button"
      aria-expanded="false"
      aria-controls="site-nav"
    >
      <span class="visually-hidden">Menu</span>
      <span class="site-header__bar"></span>
      <span class="site-header__bar"></span>
      <span class="site-header__bar"></span>
    </button>
  </div>
</header>

<style>
  .site-header {
    position: fixed;
    inset: 0 0 auto;
    z-index: 100;
    padding-block: 0.75rem;
    background: transparent;
    transition: background 0.35s var(--ease-out), padding 0.35s var(--ease-out);
  }

  .site-header--solid,
  .site-header.is-scrolled,
  .site-header.is-open {
    background: var(--c-lake);
  }

  .site-header__inner {
    display: flex;
    align-items: center;
    gap: var(--space-m);
  }

  .site-header__brand img { width: 110px; height: auto; }

  .site-header__nav { margin-left: auto; }

  .site-header__nav ul {
    display: flex;
    gap: 1.4rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .site-header__nav a {
    color: var(--c-white);
    text-decoration: none;
    font-size: 0.82rem;
    font-weight: 400;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    border-bottom: 1px solid transparent;
    transition: border-color 0.25s var(--ease-out);
  }

  .site-header__nav a:hover,
  .site-header__nav a[aria-current='page'] {
    border-color: var(--c-sky);
  }

  .site-header__toggle { display: none; }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
  }

  @media (max-width: 64rem) {
    .site-header__nav {
      display: none;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--c-lake);
      padding: var(--space-m);
    }

    .site-header.is-open .site-header__nav { display: block; }

    .site-header__nav ul { flex-direction: column; gap: 1rem; }

    .site-header__book { margin-left: auto; padding: 0.7em 1.3em; }

    .site-header__toggle {
      display: grid;
      gap: 5px;
      background: none;
      border: 0;
      padding: 0.5rem;
      cursor: pointer;
    }

    .site-header__bar {
      width: 24px;
      height: 2px;
      background: var(--c-white);
    }
  }
</style>

<script>
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.site-header__toggle');

  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  toggle?.addEventListener('click', () => {
    const open = header?.classList.toggle('is-open') ?? false;
    toggle.setAttribute('aria-expanded', String(open));
  });
</script>
```

- [ ] **Step 2: Create `src/components/Footer.astro`**

```astro
---
import { site, bookingHref } from '../config/site';

const year = new Date().getFullYear();
---

<footer class="site-footer">
  <div class="container site-footer__grid">
    <div>
      <img src="/logo-white.svg" alt={site.name} width="160" height="64" />
      <p class="site-footer__address">
        {site.address.line1}<br />
        {site.address.line2}<br />
        {site.address.village}, {site.address.town}<br />
        {site.address.postcode}, {site.address.country}
      </p>
    </div>
    <nav aria-label="Footer">
      <ul>
        <li><a href="/">Homepage</a></li>
        <li><a href="/rooms/">Rooms</a></li>
        <li><a href="/restaurant/">Restaurant</a></li>
        <li><a href="/private-events/">Private Events</a></li>
        <li><a href="/offers/">Offers</a></li>
        <li><a href="/explore/">Explore</a></li>
        <li><a href="/gallery/">Gallery</a></li>
        <li><a href="/contact/">Contact</a></li>
      </ul>
    </nav>
    <div>
      <p>
        <a href={site.phoneHref}>{site.phone}</a><br />
        <a href={`mailto:${site.email}`}>{site.email}</a>
      </p>
      {site.facebookUrl && <p><a href={site.facebookUrl}>Facebook</a></p>}
      {site.instagramUrl && <p><a href={site.instagramUrl}>Instagram</a></p>}
      <a class="btn btn--ghost" href={bookingHref}>Book Now</a>
    </div>
  </div>
  <p class="site-footer__legal container">
    &copy; {year} {site.name}, {site.tagline}
  </p>
</footer>

<style>
  .site-footer {
    background: var(--c-lake);
    color: var(--c-white);
    padding-block: var(--space-l) var(--space-m);
    margin-top: auto;
  }

  .site-footer a { color: var(--c-sky); text-decoration: none; }
  .site-footer a:hover { text-decoration: underline; }

  .site-footer__grid {
    display: grid;
    gap: var(--space-m);
    grid-template-columns: repeat(auto-fit, minmax(min(14rem, 100%), 1fr));
  }

  .site-footer__grid img { width: 140px; height: auto; }

  .site-footer__address { font-size: 0.9rem; opacity: 0.85; }

  .site-footer nav ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 0.5rem;
    font-size: 0.9rem;
  }

  .site-footer__legal {
    margin-top: var(--space-l);
    font-size: 0.8rem;
    opacity: 0.6;
  }
</style>
```

- [ ] **Step 3: Replace `src/layouts/Base.astro` with the full version**

```astro
---
import '@fontsource/prata';
import '@fontsource/manrope/300.css';
import '@fontsource/manrope/400.css';
import '@fontsource/manrope/700.css';
import '../styles/global.css';
import Header from '../components/Header.astro';
import Footer from '../components/Footer.astro';
import { site } from '../config/site';

interface Props {
  title: string;
  description: string;
  transparentHeader?: boolean;
}

const { title, description, transparentHeader = true } = Astro.props;

const schema = {
  '@context': 'https://schema.org',
  '@type': 'Hotel',
  name: site.name,
  telephone: site.phone,
  email: site.email,
  url: site.url,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.village,
    addressLocality: site.address.town,
    postalCode: site.address.postcode,
    addressCountry: 'GB',
  },
};
---

<!doctype html>
<html lang="en-GB">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="sitemap" href="/sitemap-index.xml" />
    <link rel="canonical" href={new URL(Astro.url.pathname, site.url).href} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content={new URL(Astro.url.pathname, site.url).href} />
    <meta property="og:site_name" content={site.name} />
    <script type="application/ld+json" set:html={JSON.stringify(schema)} />
  </head>
  <body>
    <Header transparent={transparentHeader} />
    <slot />
    <Footer />
    <script>
      const els = document.querySelectorAll('.reveal');
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.15 }
      );
      els.forEach((el) => io.observe(el));
    </script>
  </body>
</html>
```

Also add to `global.css` (append at the end, before the reduced-motion block if convenient — location doesn't matter):

```css
body { display: flex; flex-direction: column; min-height: 100vh; }
```

- [ ] **Step 4: Verify**

Run: `npm run build && grep -c 'application/ld+json' dist/index.html`
Expected: build passes; grep prints `1`. Also `grep -c 'site-header' dist/index.html` prints a number ≥ 1.

- [ ] **Step 5: Commit**

```bash
git add src/components/Header.astro src/components/Footer.astro src/layouts/Base.astro src/styles/global.css
git commit -m "feat: add header, footer and full base layout with SEO and reveal script"
```

---

### Task 5: Hero and CtaBanner components

**Files:**
- Create: `src/components/Hero.astro`
- Create: `src/components/CtaBanner.astro`

**Interfaces:**
- Consumes: `bookingHref` from config; `.btn`, `.btn--ghost`, `.band` global classes.
- Produces:
  - `Hero.astro` props `{ image: ImageMetadata; alt: string; title: string; subtitle?: string; short?: boolean }` plus a default slot rendered under the subtitle (for CTA buttons). Full viewport height by default; ~55vh when `short`.
  - `CtaBanner.astro` props `{ heading: string; buttonLabel?: string; buttonHref?: string }` — defaults to "Book your stay today" → `bookingHref`.

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { Image } from 'astro:assets';
import type { ImageMetadata } from 'astro';

interface Props {
  image: ImageMetadata;
  alt: string;
  title: string;
  subtitle?: string;
  short?: boolean;
}

const { image, alt, title, subtitle, short = false } = Astro.props;
---

<section class:list={['hero', { 'hero--short': short }]}>
  <Image
    class="hero__img"
    src={image}
    alt={alt}
    widths={[768, 1280, 2000]}
    sizes="100vw"
    loading="eager"
  />
  <div class="hero__content container">
    <h1 class="hero__title">{title}</h1>
    {subtitle && <p class="hero__subtitle">{subtitle}</p>}
    <div class="hero__actions"><slot /></div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    display: grid;
    place-items: center;
    min-height: 100vh;
    min-height: 100svh;
    overflow: hidden;
    isolation: isolate;
    text-align: center;
    color: var(--c-white);
  }

  .hero--short {
    min-height: 55vh;
    min-height: 55svh;
  }

  .hero__img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: -2;
    animation: kenburns 18s var(--ease-out) both;
  }

  .hero::after {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: linear-gradient(
      to bottom,
      rgba(20, 26, 32, 0.55),
      var(--c-scrim) 45%,
      rgba(20, 26, 32, 0.65)
    );
  }

  .hero__title,
  .hero__subtitle,
  .hero__actions {
    opacity: 0;
    animation: rise 0.9s var(--ease-out) forwards;
  }

  .hero__subtitle { animation-delay: 0.25s; }
  .hero__actions { animation-delay: 0.5s; }

  .hero__subtitle {
    max-width: 44rem;
    margin-inline: auto;
    font-size: clamp(1rem, 1.6vw, 1.2rem);
  }

  .hero__actions {
    display: flex;
    gap: var(--space-s);
    justify-content: center;
    flex-wrap: wrap;
    margin-top: var(--space-s);
  }

  @keyframes kenburns {
    from { transform: scale(1); }
    to { transform: scale(1.08); }
  }

  @keyframes rise {
    from {
      opacity: 0;
      transform: translateY(1.2rem);
    }
    to {
      opacity: 1;
      transform: none;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero__img { animation: none; }
    .hero__title,
    .hero__subtitle,
    .hero__actions {
      animation: none;
      opacity: 1;
    }
  }
</style>
```

- [ ] **Step 2: Create `src/components/CtaBanner.astro`**

```astro
---
import { bookingHref } from '../config/site';

interface Props {
  heading: string;
  buttonLabel?: string;
  buttonHref?: string;
}

const {
  heading,
  buttonLabel = 'Book your stay today',
  buttonHref = bookingHref,
} = Astro.props;
---

<section class="band section">
  <div class="container reveal">
    <h2>{heading}</h2>
    <a class="btn btn--ghost" href={buttonHref}>{buttonLabel}</a>
  </div>
</section>
```

- [ ] **Step 3: Verify**

Run: `npm run build`
Expected: 0 errors (components compile; pages use them next task).

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.astro src/components/CtaBanner.astro
git commit -m "feat: add Hero and CtaBanner components"
```

---

### Task 6: Homepage

**Files:**
- Modify: `src/pages/index.astro` (replace placeholder entirely)

**Interfaces:**
- Consumes: `Base`, `Hero`, `CtaBanner`, `bookingHref`, images `hero-home.jpg`, `feature-rooms.jpg`, `feature-dining.jpg`, `feature-explore.jpg`.

- [ ] **Step 1: Replace `src/pages/index.astro`**

All prose is verbatim from the brief's HOMEPAGE section.

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CtaBanner from '../components/CtaBanner.astro';
import { bookingHref } from '../config/site';
import heroHome from '../assets/images/hero-home.jpg';
import featureRooms from '../assets/images/feature-rooms.jpg';
import featureDining from '../assets/images/feature-dining.jpg';
import featureExplore from '../assets/images/feature-explore.jpg';

const features = [
  {
    eyebrow: 'Rooms',
    heading: 'Rest & Recharge',
    body: "After a day spent discovering the lakes, fells and hidden corners of the National Park, there's nothing quite like returning to a comfortable room where you can truly unwind. Thoughtfully designed and full of character, our accommodation offers the perfect balance of comfort, tranquillity and authentic Lake District charm.",
    cta: 'Discover Our Rooms',
    href: '/rooms/',
    image: featureRooms,
    alt: 'A characterful bedroom at The Scafell Hotel',
  },
  {
    eyebrow: 'Restaurant',
    heading: 'Dining Worth Staying For',
    body: 'Great food has always been at the heart of the guest experience at The Scafell Hotel. From leisurely breakfasts before a day of adventure to relaxed evenings spent enjoying good company, every meal is an opportunity to savour the flavours of the region in a welcoming and atmospheric setting.',
    cta: 'Explore Dining',
    href: '/restaurant/',
    image: featureDining,
    alt: 'Dining at The Scafell Hotel',
  },
  {
    eyebrow: 'Explore',
    heading: 'Adventure on Your Doorstep',
    body: "Few locations offer such immediate access to the natural beauty of the Lake District. Step outside and you'll find inspiring walking routes, stunning viewpoints, picturesque villages and unforgettable landscapes waiting to be explored. Whether you're seeking adventure or relaxation, the perfect day out begins here.",
    cta: 'Explore the Lake District',
    href: '/explore/',
    image: featureExplore,
    alt: 'Fells and valleys of the Lake District',
  },
];
---

<Base
  title="The Scafell Hotel | Lake District Hotel in Borrowdale, Keswick"
  description="Nestled in the heart of the Lake District, The Scafell Hotel offers a timeless countryside escape with 23 beautifully appointed bedrooms, a welcoming bar and restaurant."
>
  <Hero
    image={heroHome}
    alt="The Lake District landscape surrounding The Scafell Hotel"
    title="Welcome to The Scafell Hotel"
    subtitle="Nestled in the heart of the Lake District, The Scafell Hotel offers a timeless countryside escape where comfort, adventure and exceptional hospitality come together."
  >
    <a class="btn" href={bookingHref}>Book your stay today</a>
  </Hero>

  <main>
    <section class="section container" style="text-align: center;">
      <div class="reveal" style="max-width: 46rem; margin-inline: auto;">
        <p>
          With 23 beautifully appointed bedrooms, a welcoming bar and restaurant, cosy
          spaces to unwind and some of England's most spectacular landscapes on the
          doorstep, The Scafell Hotel is the perfect base for exploring the Lakes.
        </p>
        <p>
          Whether you're seeking a romantic getaway, an active walking holiday, a family
          break or a special celebration, you'll discover warm hospitality, locally
          inspired dining and breathtaking scenery at every turn.
        </p>
        <p>Experience the beauty of the Lake District from one of its most charming hotels.</p>
      </div>
    </section>

    {
      features.map((f, i) => (
        <section class="section container">
          <div class:list={['feature', 'reveal', { 'feature--flip': i % 2 === 1 }]}>
            <Image src={f.image} alt={f.alt} widths={[600, 1200]} sizes="(min-width: 50rem) 50vw, 100vw" />
            <div>
              <span class="eyebrow">{f.eyebrow}</span>
              <h2>{f.heading}</h2>
              <p>{f.body}</p>
              <a class="btn" href={f.href}>{f.cta} →</a>
            </div>
          </div>
        </section>
      ))
    }

    <CtaBanner heading="Experience the beauty of the Lake District" />
  </main>
</Base>
```

- [ ] **Step 2: Verify**

Run: `npm run build && grep -c 'Welcome to The Scafell Hotel' dist/index.html`
Expected: build passes, grep prints ≥ 1. Also `grep -o 'href="/contact/"' dist/index.html | head -1` shows the BOOK NOW fallback resolving to `/contact` (bookingUrl is empty).

- [ ] **Step 3: Visual smoke check**

Run `npm run dev`, open `http://localhost:4321/`. Confirm: full-screen hero with slow zoom and staged text fade-in; header transparent at top and Lake Blue after scrolling; feature rows alternate image side and fade up on scroll. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: build homepage with hero, feature sections and CTA banner"
```

---

### Task 7: Rooms page

**Files:**
- Create: `src/pages/rooms.astro`

**Interfaces:**
- Consumes: `Base`, `Hero`, `CtaBanner`, `rooms` from `src/content/rooms.ts`, `hero-rooms.jpg`.

- [ ] **Step 1: Create `src/pages/rooms.astro`** (prose verbatim from the brief's ROOMS section)

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CtaBanner from '../components/CtaBanner.astro';
import { rooms } from '../content/rooms';
import heroRooms from '../assets/images/hero-rooms.jpg';

const featuresList = [
  'Comfortable beds with quality linens',
  'En-suite bathrooms',
  'Complimentary Wi-Fi',
  'Tea and coffee-making facilities',
  'Flat-screen televisions',
  'Beautiful countryside views in selected rooms',
];
---

<Base
  title="Rooms | The Scafell Hotel"
  description="Our 23 individually designed bedrooms combine classic comfort with modern conveniences — cosy doubles, spacious superior rooms and family-friendly accommodation."
>
  <Hero image={heroRooms} alt="Countryside views from The Scafell Hotel" title="Relax in Comfort" short />

  <main>
    <section class="section container">
      <div class="reveal" style="max-width: 46rem;">
        <p>
          Our 23 individually designed bedrooms combine classic comfort with modern
          conveniences, creating the perfect sanctuary after a day spent exploring the
          fells, lakes and valleys of the Lake District.
        </p>
        <p>
          Choose from cosy doubles, spacious superior rooms and family-friendly
          accommodation, each thoughtfully furnished to ensure a restful stay. Many rooms
          offer stunning views of the surrounding countryside, allowing you to wake up
          immersed in the natural beauty of the Lakes.
        </p>
      </div>

      <div class="reveal" style="margin-top: var(--space-m);">
        <h2>Room Features</h2>
        <ul class="room-features">
          {featuresList.map((f) => <li>{f}</li>)}
        </ul>
        <p>
          Whether you're visiting for a weekend escape or an extended holiday, you'll find
          everything you need for a memorable stay.
        </p>
      </div>
    </section>

    <section class="section container">
      <div class="grid grid--2">
        {
          rooms.map((room) => (
            <article class="room-card reveal">
              <Image src={room.image} alt={room.alt} widths={[600, 1200]} sizes="(min-width: 50rem) 50vw, 100vw" />
              <div class="room-card__body">
                <h3>{room.name}</h3>
                <p>{room.description}</p>
              </div>
            </article>
          ))
        }
      </div>
    </section>

    <CtaBanner heading="Find your perfect sanctuary" />
  </main>
</Base>

<style>
  .room-features {
    columns: 2;
    column-gap: var(--space-m);
    max-width: 46rem;
  }

  @media (max-width: 40rem) {
    .room-features { columns: 1; }
  }

  .room-card {
    background: var(--c-white);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(45, 53, 64, 0.08);
  }

  .room-card img {
    aspect-ratio: 3 / 2;
    object-fit: cover;
    width: 100%;
    transition: transform 0.6s var(--ease-out);
  }

  .room-card:hover img { transform: scale(1.04); }

  .room-card__body { padding: var(--space-m); }

  .room-card h3 { color: var(--c-gorse); }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run build && grep -c 'Relax in Comfort' dist/rooms/index.html`
Expected: build passes, grep prints ≥ 1; all four room names present — `for n in Family Double Twin Single; do grep -o ">$n<" dist/rooms/index.html | wc -l; done` prints four numbers, each ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add src/pages/rooms.astro
git commit -m "feat: build rooms page"
```

---

### Task 8: Restaurant page

**Files:**
- Create: `src/pages/restaurant.astro`

**Interfaces:**
- Consumes: `Base`, `Hero`, `site` (for `menusUrl`, phone), images `hero-restaurant.jpg`, `dining-detail.jpg`.

- [ ] **Step 1: Create `src/pages/restaurant.astro`** (prose verbatim from the brief's RESTAURANT section)

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import { site } from '../config/site';
import heroRestaurant from '../assets/images/hero-restaurant.jpg';
import diningDetail from '../assets/images/dining-detail.jpg';
---

<Base
  title="Restaurant | The Scafell Hotel"
  description="Our restaurant celebrates the finest local ingredients, carefully crafted into seasonal dishes inspired by the surrounding landscape. Fresh. Seasonal. Local."
>
  <Hero
    image={heroRestaurant}
    alt="The restaurant at The Scafell Hotel"
    title="A Taste of the Lake District"
    short
  />

  <main>
    <section class="section container">
      <div class="feature reveal">
        <Image src={diningDetail} alt="Seasonal dishes at The Scafell Hotel" widths={[600, 1200]} sizes="(min-width: 50rem) 50vw, 100vw" />
        <div>
          <span class="eyebrow">Dining</span>
          <p>
            Dining at The Scafell Hotel is an experience to savour. Our restaurant
            celebrates the finest local ingredients, carefully crafted into seasonal
            dishes inspired by the surrounding landscape.
          </p>
          <p>
            Start your day with a hearty Lake District breakfast before heading out to
            explore, then return in the evening to enjoy expertly prepared cuisine
            alongside a carefully selected range of wines, local ales and spirits.
          </p>
        </div>
      </div>
    </section>

    <section class="band band--green section">
      <div class="container reveal">
        <h2>Fresh. Seasonal. Local.</h2>
        <p>
          From relaxed lunches to memorable evening meals, our restaurant offers warm
          hospitality and exceptional flavours in a welcoming setting.
        </p>
        {site.menusUrl && <a class="btn btn--ghost" href={site.menusUrl}>View Menus</a>}
      </div>
    </section>

    <section class="section container" style="text-align: center;">
      <div class="reveal">
        <h2>Reserve your table during your stay</h2>
        <p>
          Call us on <a href={site.phoneHref}>{site.phone}</a> to book.
        </p>
      </div>
    </section>
  </main>
</Base>
```

- [ ] **Step 2: Verify**

Run: `npm run build && grep -c 'Fresh. Seasonal. Local.' dist/restaurant/index.html`
Expected: build passes, grep ≥ 1. Confirm the menus button is absent while `menusUrl` is empty: `grep -c 'View Menus' dist/restaurant/index.html` → `0`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/restaurant.astro
git commit -m "feat: build restaurant page"
```

---

### Task 9: Private Events page

**Files:**
- Create: `src/pages/private-events.astro`

**Interfaces:**
- Consumes: `Base`, `Hero`, `CtaBanner`, `hero-events.jpg`.

- [ ] **Step 1: Create `src/pages/private-events.astro`** (prose verbatim from the brief's PRIVATE EVENTS section)

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CtaBanner from '../components/CtaBanner.astro';
import heroEvents from '../assets/images/hero-events.jpg';

const reasons = [
  'Stunning Lake District location',
  'Flexible event spaces',
  'Bespoke catering options',
  'Comfortable accommodation for guests',
  'Dedicated event support',
];
---

<Base
  title="Private Events | The Scafell Hotel"
  description="From intimate family gatherings to milestone celebrations and corporate retreats, The Scafell Hotel provides a beautiful setting for memorable events."
>
  <Hero
    image={heroEvents}
    alt="An event setting at The Scafell Hotel"
    title="Celebrate in the Heart of the Lakes"
    short
  />

  <main>
    <section class="section container">
      <div class="reveal" style="max-width: 46rem;">
        <p>
          From intimate family gatherings to milestone celebrations and corporate
          retreats, The Scafell Hotel provides a beautiful setting for memorable events.
        </p>
        <p>
          Our experienced team will work closely with you to create a bespoke experience,
          whether you're planning a birthday celebration, anniversary, private dining
          event, business meeting or special occasion.
        </p>
      </div>
    </section>

    <section class="section container">
      <h2 class="reveal">Why Choose The Scafell Hotel?</h2>
      <div class="grid grid--3">
        {
          reasons.map((reason) => (
            <div class="reason reveal">
              <p>{reason}</p>
            </div>
          ))
        }
      </div>
      <p class="reveal" style="margin-top: var(--space-m);">Let us help bring your event to life.</p>
    </section>

    <CtaBanner
      heading="Contact our team to discuss your requirements"
      buttonLabel="Get in touch"
      buttonHref="/contact/"
    />
  </main>
</Base>

<style>
  .reason {
    background: var(--c-white);
    border-top: 3px solid var(--c-gorse);
    border-radius: var(--radius);
    padding: var(--space-m);
    box-shadow: 0 10px 30px rgba(45, 53, 64, 0.08);
  }

  .reason p {
    margin: 0;
    font-weight: 400;
  }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run build && grep -c 'Celebrate in the Heart of the Lakes' dist/private-events/index.html`
Expected: build passes, grep ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add src/pages/private-events.astro
git commit -m "feat: build private events page"
```

---

### Task 10: Offers page

**Files:**
- Create: `src/pages/offers.astro`

**Interfaces:**
- Consumes: `Base`, `Hero`, `CtaBanner`, `offers` from `src/content/offers.ts`, `hero-offers.jpg`.

- [ ] **Step 1: Create `src/pages/offers.astro`** (prose verbatim from the brief's OFFERS section)

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CtaBanner from '../components/CtaBanner.astro';
import { offers } from '../content/offers';
import heroOffers from '../assets/images/hero-offers.jpg';
---

<Base
  title="Offers | The Scafell Hotel"
  description="Make your Lake District escape even more memorable with our latest special offers and seasonal packages at The Scafell Hotel."
>
  <Hero
    image={heroOffers}
    alt="The Lake District scenery around The Scafell Hotel"
    title="Exclusive Offers at The Scafell Hotel"
    short
  />

  <main>
    <section class="section container">
      <div class="reveal" style="max-width: 46rem;">
        <p>
          Make your Lake District escape even more memorable with our latest special
          offers and seasonal packages. Whether you're planning a spontaneous weekend
          away, a walking holiday in the fells or a longer countryside retreat, our
          carefully curated offers provide the perfect opportunity to experience The
          Scafell Hotel for less.
        </p>
        <p>
          From accommodation packages and dining experiences to seasonal breaks and
          exclusive savings, there's always a reason to return to the Lakes.
        </p>
      </div>
    </section>

    <section class="section container">
      <h2 class="reveal">Current Offers</h2>
      <p class="reveal">
        Our latest promotions are updated regularly throughout the year. Check back often
        to discover:
      </p>
      <div class="grid grid--3">
        {
          offers.map((offer) => (
            <article class="offer-card reveal">
              <h3>{offer.name}</h3>
              <p>{offer.description}</p>
            </article>
          ))
        }
      </div>
    </section>

    <section class="band section">
      <div class="container reveal">
        <h2>Why Book Direct?</h2>
        <p style="max-width: 44rem; margin-inline: auto;">
          When you book directly with The Scafell Hotel, you'll enjoy access to our best
          available rates, exclusive offers and the confidence of booking with our team.
        </p>
      </div>
    </section>

    <section class="section container" style="text-align: center;">
      <div class="reveal">
        <h2>Plan Your Next Escape</h2>
        <p style="max-width: 44rem; margin-inline: auto;">
          Surrounded by some of the Lake District's most spectacular scenery, there's
          never been a better time to discover everything The Scafell Hotel has to offer.
        </p>
      </div>
    </section>

    <CtaBanner heading="Book your stay today" />
  </main>
</Base>

<style>
  .offer-card {
    background: var(--c-white);
    border-top: 3px solid var(--c-fell);
    border-radius: var(--radius);
    padding: var(--space-m);
    box-shadow: 0 10px 30px rgba(45, 53, 64, 0.08);
  }

  .offer-card h3 {
    font-size: 1.15rem;
    color: var(--c-mountain);
  }

  .offer-card p { margin: 0; }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run build && grep -c 'Why Book Direct' dist/offers/index.html`
Expected: build passes, grep ≥ 1; six offers render: `grep -c 'offer-card' dist/offers/index.html` prints a number ≥ 6.

- [ ] **Step 3: Commit**

```bash
git add src/pages/offers.astro
git commit -m "feat: build offers page"
```

---

### Task 11: Explore page

**Files:**
- Create: `src/pages/explore.astro`

**Interfaces:**
- Consumes: `Base`, `Hero`, `CtaBanner`, `highlights` from `src/content/explore.ts`, `hero-explore.jpg`.

- [ ] **Step 1: Create `src/pages/explore.astro`** (prose verbatim from the brief's EXPLORE section)

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import CtaBanner from '../components/CtaBanner.astro';
import { highlights } from '../content/explore';
import heroExplore from '../assets/images/hero-explore.jpg';
---

<Base
  title="Explore the Lake District | The Scafell Hotel"
  description="The Scafell Hotel sits at the gateway to some of the Lake District's most iconic landscapes — Scafell Pike, Borrowdale Valley, Derwentwater, Keswick and more."
>
  <Hero
    image={heroExplore}
    alt="Iconic Lake District landscapes"
    title="Discover the Lake District"
    short
  />

  <main>
    <section class="section container">
      <div class="reveal" style="max-width: 46rem;">
        <p>
          The Scafell Hotel sits at the gateway to some of the Lake District's most iconic
          landscapes and outdoor adventures.
        </p>
        <p>
          From gentle lakeside walks to challenging mountain hikes, there is something for
          every visitor to enjoy.
        </p>
      </div>
    </section>

    <section class="section container">
      <h2 class="reveal">Nearby Highlights</h2>
      <div class="grid grid--3">
        {
          highlights.map((h) => (
            <article class="highlight reveal">
              <Image src={h.image} alt={h.alt} widths={[400, 800]} sizes="(min-width: 50rem) 33vw, 100vw" />
              <div class="highlight__body">
                <h3>{h.name}</h3>
                <p>{h.description}</p>
              </div>
            </article>
          ))
        }
      </div>
      <div class="reveal" style="max-width: 46rem; margin-top: var(--space-m);">
        <p>
          Explore charming villages, cruise across tranquil waters, discover local history
          or simply take in the spectacular scenery that has inspired generations of
          visitors.
        </p>
        <p>Your Lake District adventure starts here.</p>
      </div>
    </section>

    <CtaBanner heading="Your Lake District adventure starts here" />
  </main>
</Base>

<style>
  .highlight {
    background: var(--c-white);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(45, 53, 64, 0.08);
  }

  .highlight img {
    aspect-ratio: 3 / 2;
    object-fit: cover;
    width: 100%;
    transition: transform 0.6s var(--ease-out);
  }

  .highlight:hover img { transform: scale(1.04); }

  .highlight__body { padding: var(--space-m); }

  .highlight h3 {
    font-size: 1.15rem;
    color: var(--c-fell);
  }

  .highlight p { margin: 0; }
</style>
```

- [ ] **Step 2: Verify**

Run: `npm run build && grep -c 'Scafell Pike' dist/explore/index.html`
Expected: build passes; all six highlights present — `for n in "Scafell Pike" "Borrowdale Valley" "Derwentwater" "Keswick" "Catbells" "Honister Pass"; do grep -c "$n" dist/explore/index.html; done` prints six numbers all ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add src/pages/explore.astro
git commit -m "feat: build explore page"
```

---

### Task 12: Gallery page with lightbox

**Files:**
- Create: `src/pages/gallery.astro`

**Interfaces:**
- Consumes: `Base`, `Hero`, all 16 images from `src/assets/images/`.

- [ ] **Step 1: Create `src/pages/gallery.astro`** (prose verbatim from the brief's GALLERY section)

The gallery shows 12 images (all placeholders reused from elsewhere on the site — replaced wholesale when client photography arrives). Lightbox is a native `<dialog>`: click to open, Escape or backdrop-click to close, arrow keys for prev/next.

```astro
---
import { Image } from 'astro:assets';
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import heroGallery from '../assets/images/hero-gallery.jpg';
import img1 from '../assets/images/hero-home.jpg';
import img2 from '../assets/images/feature-rooms.jpg';
import img3 from '../assets/images/feature-dining.jpg';
import img4 from '../assets/images/feature-explore.jpg';
import img5 from '../assets/images/room-family.jpg';
import img6 from '../assets/images/room-double.jpg';
import img7 from '../assets/images/hero-explore.jpg';
import img8 from '../assets/images/dining-detail.jpg';
import img9 from '../assets/images/hero-rooms.jpg';
import img10 from '../assets/images/hero-contact.jpg';
import img11 from '../assets/images/hero-offers.jpg';
import img12 from '../assets/images/hero-events.jpg';

const photos = [
  { image: img1, alt: 'The Lake District landscape' },
  { image: img2, alt: 'A characterful bedroom' },
  { image: img3, alt: 'Dining at the hotel' },
  { image: img4, alt: 'Fells and valleys' },
  { image: img5, alt: 'A spacious family room' },
  { image: img6, alt: 'A cosy double room' },
  { image: img7, alt: 'Mountain scenery' },
  { image: img8, alt: 'Seasonal dishes' },
  { image: img9, alt: 'Countryside views' },
  { image: img10, alt: 'The Borrowdale valley' },
  { image: img11, alt: 'Lake District scenery' },
  { image: img12, alt: 'An event setting' },
];
---

<Base
  title="Gallery | The Scafell Hotel"
  description="Browse our gallery and experience the charm of The Scafell Hotel before you arrive — comfortable bedrooms, inviting restaurant and unforgettable Lake District views."
>
  <Hero
    image={heroGallery}
    alt="Views of The Scafell Hotel and its surroundings"
    title="Discover The Scafell Hotel"
    short
  />

  <main>
    <section class="section container">
      <div class="reveal" style="max-width: 46rem;">
        <p>
          Browse our gallery and experience the charm of The Scafell Hotel before you
          arrive.
        </p>
        <p>
          Explore our comfortable bedrooms, inviting restaurant, beautiful surroundings
          and unforgettable Lake District views.
        </p>
        <p>Every image tells part of the story of your next escape.</p>
      </div>

      <div class="gallery-grid">
        {
          photos.map((photo, i) => (
            <button class="gallery-grid__item reveal" type="button" data-index={i}>
              <Image
                src={photo.image}
                alt={photo.alt}
                widths={[400, 800]}
                sizes="(min-width: 50rem) 33vw, 50vw"
              />
            </button>
          ))
        }
      </div>
    </section>
  </main>

  <dialog class="lightbox">
    <button class="lightbox__close" type="button" aria-label="Close">&times;</button>
    <button class="lightbox__prev" type="button" aria-label="Previous image">&#8249;</button>
    <img class="lightbox__img" src="" alt="" />
    <button class="lightbox__next" type="button" aria-label="Next image">&#8250;</button>
  </dialog>
</Base>

<style>
  .gallery-grid {
    margin-top: var(--space-m);
    columns: 3;
    gap: var(--space-s);
  }

  @media (max-width: 50rem) {
    .gallery-grid { columns: 2; }
  }

  .gallery-grid__item {
    display: block;
    width: 100%;
    margin-bottom: var(--space-s);
    padding: 0;
    border: 0;
    background: none;
    cursor: zoom-in;
    border-radius: var(--radius);
    overflow: hidden;
  }

  .gallery-grid__item img {
    width: 100%;
    transition: transform 0.5s var(--ease-out);
  }

  .gallery-grid__item:hover img { transform: scale(1.04); }

  .lightbox {
    border: 0;
    padding: 0;
    background: transparent;
    max-width: 90vw;
    max-height: 90vh;
  }

  .lightbox::backdrop { background: rgba(20, 26, 32, 0.9); }

  .lightbox__img {
    max-width: 90vw;
    max-height: 85vh;
    object-fit: contain;
    border-radius: var(--radius);
  }

  .lightbox button {
    position: fixed;
    background: none;
    border: 0;
    color: var(--c-white);
    font-size: 2.5rem;
    line-height: 1;
    cursor: pointer;
    padding: 0.5rem 1rem;
  }

  .lightbox__close { top: 1rem; right: 1rem; }
  .lightbox__prev { left: 1rem; top: 50%; transform: translateY(-50%); }
  .lightbox__next { right: 1rem; top: 50%; transform: translateY(-50%); }
</style>

<script>
  const dialog = document.querySelector<HTMLDialogElement>('.lightbox');
  const img = document.querySelector<HTMLImageElement>('.lightbox__img');
  const items = [...document.querySelectorAll<HTMLButtonElement>('.gallery-grid__item')];
  let index = 0;

  const show = (i: number) => {
    index = (i + items.length) % items.length;
    const thumb = items[index]?.querySelector('img');
    if (thumb && img) {
      img.src = thumb.currentSrc || thumb.src;
      img.alt = thumb.alt;
    }
  };

  items.forEach((item, i) =>
    item.addEventListener('click', () => {
      show(i);
      dialog?.showModal();
    })
  );

  document.querySelector('.lightbox__close')?.addEventListener('click', () => dialog?.close());
  document.querySelector('.lightbox__prev')?.addEventListener('click', () => show(index - 1));
  document.querySelector('.lightbox__next')?.addEventListener('click', () => show(index + 1));

  dialog?.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  dialog?.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
  });
</script>
```

- [ ] **Step 2: Verify**

Run: `npm run build && grep -c 'gallery-grid__item' dist/gallery/index.html`
Expected: build passes; grep prints a number ≥ 12.

- [ ] **Step 3: Manual lightbox check**

Run `npm run dev`, open `http://localhost:4321/gallery/`. Click an image → lightbox opens; arrow keys cycle; Escape and backdrop click close it. Stop the dev server.

- [ ] **Step 4: Commit**

```bash
git add src/pages/gallery.astro
git commit -m "feat: build gallery page with dialog lightbox"
```

---

### Task 13: Contact page (enquiry form) and 404

**Files:**
- Create: `src/components/EnquiryForm.astro`
- Create: `src/pages/contact.astro`
- Create: `src/pages/404.astro`

**Interfaces:**
- Consumes: `Base`, `Hero`, `site` from config, `hero-contact.jpg`.
- Produces: `EnquiryForm.astro` (no props — reads `site.formEndpoint`, `site.phone`, `site.email` itself).

- [ ] **Step 1: Create `src/components/EnquiryForm.astro`**

Behaviour (per spec): honeypot field; required-field validation; inline sending/success/failure states; on failure always show phone + mailto fallback; with an empty endpoint, log a console warning and show the failure fallback.

```astro
---
import { site } from '../config/site';
---

<form
  class="enquiry"
  method="POST"
  novalidate
  data-endpoint={site.formEndpoint}
  data-phone={site.phone}
  data-phone-href={site.phoneHref}
  data-email={site.email}
>
  <p class="enquiry__hp" aria-hidden="true">
    <label>
      Leave this field empty
      <input type="text" name="_gotcha" tabindex="-1" autocomplete="off" />
    </label>
  </p>
  <label>
    Name
    <input type="text" name="name" required autocomplete="name" />
  </label>
  <label>
    Email Address
    <input type="email" name="email" required autocomplete="email" />
  </label>
  <label>
    Enquiry
    <textarea name="message" rows="6" required></textarea>
  </label>
  <button class="btn" type="submit">Send</button>
  <p class="enquiry__status" role="status" aria-live="polite"></p>
</form>

<style>
  .enquiry { display: grid; gap: var(--space-s); }

  .enquiry__hp {
    position: absolute;
    left: -9999px;
  }

  .enquiry label {
    display: grid;
    gap: 0.4rem;
    font-weight: 700;
    font-size: 0.85rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .enquiry input,
  .enquiry textarea {
    font: inherit;
    font-weight: 300;
    padding: 0.8em;
    border: 1px solid var(--c-mountain);
    border-radius: var(--radius);
    background: var(--c-white);
    color: var(--c-lake);
  }

  .enquiry input:focus-visible,
  .enquiry textarea:focus-visible {
    outline: 2px solid var(--c-fell);
    outline-offset: 1px;
  }

  .enquiry .btn { justify-self: start; }

  .enquiry__status:not(:empty) {
    padding: var(--space-s);
    border-radius: var(--radius);
    background: var(--c-sky);
    margin: 0;
  }
</style>

<script>
  const form = document.querySelector<HTMLFormElement>('.enquiry');
  const status = form?.querySelector<HTMLElement>('.enquiry__status');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!status) return;

    const gotcha = form.elements.namedItem('_gotcha') as HTMLInputElement | null;
    if (gotcha?.value) return; // spam bot filled the honeypot — drop silently

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const { endpoint, phone, phoneHref, email } = form.dataset;

    const showFailure = () => {
      status.innerHTML = `Sorry, something went wrong sending your enquiry. Please call us on <a href="${phoneHref}">${phone}</a> or email <a href="mailto:${email}">${email}</a> and we'll be happy to help.`;
    };

    if (!endpoint) {
      console.warn('Enquiry form not yet connected: set site.formEndpoint in src/config/site.ts');
      showFailure();
      return;
    }

    status.textContent = 'Sending…';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      status.textContent = "Thank you — we'll get back to you as soon as possible.";
      form.reset();
    } catch {
      showFailure();
    }
  });
</script>
```

- [ ] **Step 2: Create `src/pages/contact.astro`** (prose verbatim from the brief's CONTACT section)

```astro
---
import Base from '../layouts/Base.astro';
import Hero from '../components/Hero.astro';
import EnquiryForm from '../components/EnquiryForm.astro';
import { site } from '../config/site';
import heroContact from '../assets/images/hero-contact.jpg';
---

<Base
  title="Contact | The Scafell Hotel"
  description="Whether you're planning a relaxing getaway, booking a table, organising an event or simply have a question, our team is here to help."
>
  <Hero
    image={heroContact}
    alt="The valley around The Scafell Hotel"
    title="We'd Love to Hear From You"
    short
  />

  <main>
    <section class="section container">
      <div class="contact-grid">
        <div class="reveal">
          <p>
            Whether you're planning a relaxing getaway, booking a table, organising an
            event or simply have a question, our team is here to help.
          </p>

          <h2>Contact Information</h2>
          <address>
            {site.address.line1}<br />
            {site.address.line2}<br />
            {site.address.village}<br />
            {site.address.town}<br />
            {site.address.postcode}<br />
            {site.address.country}
          </address>
          <p>
            <strong>Phone:</strong> <a href={site.phoneHref}>{site.phone}</a><br />
            <strong>Email:</strong> <a href={`mailto:${site.email}`}>{site.email}</a>
          </p>
          <p><a class="btn" href={site.directionsUrl}>Get directions</a></p>
        </div>

        <div class="reveal">
          <h2>Enquiry Form</h2>
          <p>
            Complete our enquiry form and a member of our team will get back to you as
            soon as possible.
          </p>
          <EnquiryForm />
          <p style="margin-top: var(--space-s);">
            We look forward to welcoming you to The Scafell Hotel.
          </p>
        </div>
      </div>
    </section>
  </main>
</Base>

<style>
  .contact-grid {
    display: grid;
    gap: clamp(var(--space-m), 5vw, var(--space-l));
  }

  @media (min-width: 50rem) {
    .contact-grid { grid-template-columns: 1fr 1.2fr; }
  }

  address {
    font-style: normal;
    margin-bottom: var(--space-s);
  }
</style>
```

- [ ] **Step 3: Create `src/pages/404.astro`**

```astro
---
import Base from '../layouts/Base.astro';
---

<Base
  title="Page Not Found | The Scafell Hotel"
  description="The page you were looking for could not be found."
  transparentHeader={false}
>
  <main class="section container" style="text-align: center; padding-top: 10rem;">
    <h1>Page Not Found</h1>
    <p>The path you've taken doesn't lead anywhere — but the Lakes are still waiting.</p>
    <a class="btn" href="/">Back to the Homepage</a>
  </main>
</Base>
```

- [ ] **Step 4: Verify**

Run: `npm run build && grep -c "We'd Love to Hear From You" dist/contact/index.html && grep -c 'Page Not Found' dist/404.html`
Expected: build passes; both greps ≥ 1.

- [ ] **Step 5: Manual form check**

Run `npm run dev`, open `http://localhost:4321/contact/`. Submit empty → native validation prompts. Fill all fields and submit → failure message with phone + email links appears (endpoint is empty) and the console shows the "not yet connected" warning. Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add src/components/EnquiryForm.astro src/pages/contact.astro src/pages/404.astro
git commit -m "feat: build contact page with enquiry form and 404 page"
```

---

### Task 14: Site-wide QA — link check, sitemap, Lighthouse

**Files:**
- Modify: `package.json` (add `check-links` script)

**Interfaces:**
- Consumes: the full built site.

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: `astro check` 0 errors; 9 pages in `dist/` (`ls dist` shows `index.html`, `404.html`, and directories `rooms`, `restaurant`, `private-events`, `offers`, `explore`, `gallery`, `contact`, plus `sitemap-index.xml` and `_astro/`).

- [ ] **Step 2: Add and run the link check**

Add to `package.json` scripts:

```json
"check-links": "npx --yes linkinator http://localhost:4321 --recurse --skip 'googleapis|google\\.com'"
```

Then run in two terminals (or background the first):

```bash
npm run preview &
sleep 2
npm run check-links
kill %1
```

Expected: linkinator reports all internal links OK (0 broken). External links to Google Maps are skipped. If any internal link 404s, fix the referencing page and re-run.

- [ ] **Step 3: Sitemap and JSON-LD spot checks**

```bash
grep -c '<loc>' "$(ls dist/sitemap-*.xml | tail -1)"
grep -l 'application/ld+json' dist/index.html
```

Expected: 8 `<loc>` entries (404 excluded); JSON-LD present.

- [ ] **Step 4: Manual Lighthouse pass**

Run `npm run preview`, open Chrome DevTools → Lighthouse on `http://localhost:4321/` (mobile). Target ≥ 95 on Performance, SEO, Accessibility, Best Practices. Record scores in the commit message. Common fixes if short: missing `alt`, insufficient contrast (Sky Blue text only on Lake Blue backgrounds — never on white), oversized images (check `widths` on `<Image>`).

- [ ] **Step 5: Reduced-motion check**

In Chrome DevTools → Rendering → Emulate `prefers-reduced-motion: reduce`, reload the homepage. Expected: no Ken Burns zoom, hero text visible immediately, sections visible without scroll animation.

- [ ] **Step 6: Commit**

```bash
git add package.json
git commit -m "chore: add link check script; QA pass (Lighthouse scores in body)"
```

---

## Post-launch swap points (not tasks — documentation for the maintainer)

All in `src/config/site.ts`: `bookingUrl` (booking engine), `formEndpoint` (form service), `menusUrl` (menus PDF/page), `facebookUrl` / `instagramUrl`. Real photography: replace files in `src/assets/images/` keeping the same filenames (or update imports in `src/content/*.ts` and page frontmatter). Deploy: any static host; build command `npm run build`, output directory `dist`.
