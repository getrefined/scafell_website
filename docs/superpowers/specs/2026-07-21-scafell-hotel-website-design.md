# The Scafell Hotel Website — Design Spec

**Date:** 2026-07-21
**Status:** Approved

## Overview

A static marketing website for The Scafell Hotel, a 23-room hotel in Rosthwaite, Borrowdale, in the Lake District. Photo-led and elegant, benchmarked against biarritzhotel.co.uk and stbreladesbayhotel.com: full-screen heroes, tasteful animation, that calibre of polish. All page copy comes from `Client Docs/brief.md`; brand assets (logos, colours, typefaces) come from the client's logo suite and brand basics PDF.

## Decisions made during brainstorming

- **Stack:** Astro 5, fully static output. Host decided at deploy time (Cloudflare Pages / Netlify / Vercel — no code impact).
- **Booking:** no booking engine chosen yet. Booking URL is a single config value; while unset, BOOK NOW buttons point to the Contact page (never a dead `#` link).
- **Enquiry form:** posts to a configurable form-service endpoint (Formspree/Web3Forms style). Endpoint is a config value, placeholder for now.
- **Imagery:** client photos arrive later. Build with Unsplash-licensed Lake District/Borrowdale stand-ins. Every image path is referenced from the data layer so the swap is data-only.
- **Styling:** hand-rolled CSS with custom properties (no Tailwind). Design tokens in one file.
- **Animation:** CSS-first with a tiny IntersectionObserver script — no GSAP or animation libraries.

## Brand

- **Headings:** Prata Regular. **Body:** Manrope Light/Regular/Bold. Both self-hosted via `@fontsource`.
- **Palette:** Lake Blue `#2D3540` (footer, dark sections, body text), Mountain Blue `#54728C` (links, primary buttons), Sky Blue `#BDD9F2` (tints, subtle backgrounds), Fell Green `#8A8C46` and Gorse Purple `#7C506E` (accents: eyebrows, hover states, flourishes).
- **Logos:** main colour logo on light backgrounds, white logo over heroes/dark sections, SH monogram as favicon. SVG/PNG assets copied from `Client Docs/LOGO SUITE/`.
- Warm off-white page background rather than stark white.

## Architecture & project structure

```
src/
  config/site.ts        # booking URL, form endpoint, phone, email, address, socials
  content/              # rooms.ts, offers.ts, explore.ts (typed data)
  layouts/Base.astro    # <head>, fonts, header, footer
  components/           # Header, Footer, Hero, SectionReveal, RoomCard, OfferCard,
                        # GalleryGrid, EnquiryForm, CtaBanner...
  pages/                # index, rooms, restaurant, private-events, offers,
                        # explore, gallery, contact + 404
  styles/               # tokens.css (brand vars), global.css
public/
  images/               # hero + gallery placeholders, logo SVGs
```

- **Content layer:** all copy in typed data files under `src/content/` and structured page data — no copy buried in components. Rooms, offers, and explore highlights are typed collections.
- **Site config:** `src/config/site.ts` holds every external/placeholder value: booking URL, form endpoint, menus link, phone (+44 17687 77208), email (info@scafellhotel.co.uk), address (Rosthwaite, Keswick CA12 5XB), Facebook/Instagram URLs.
- **Images:** Astro `<Image>`/`<Picture>` for responsive sizes and modern formats.
- **Header:** transparent over heroes, transitions to solid Lake Blue on scroll. BOOK NOW button always visible (top right and in mobile menu).
- **SEO:** per-page titles/descriptions, OpenGraph tags, `@astrojs/sitemap`, LocalBusiness/Hotel JSON-LD with address and phone.

## Pages

All copy verbatim from the brief. Every page opens with a full-screen (or shorter, where noted) photo hero: white logo/text over a dark gradient scrim.

- **Homepage** — full-screen hero ("Welcome to The Scafell Hotel", BOOK NOW CTA), three alternating image/text feature sections linking to Rooms, Restaurant, and Explore, closing CTA banner.
- **Rooms** — hero, intro copy, room features list, cards for the four room types (Family, Double, Twin, Single). No per-room detail pages (no content for them; easy to add later).
- **Restaurant** — hero, copy, "Fresh. Seasonal. Local." statement band, VIEW MENUS button (config link), reserve-a-table note with phone number.
- **Private Events** — hero, copy, "Why Choose The Scafell Hotel?" feature grid, contact CTA.
- **Offers** — hero, copy, six offer-type cards from `offers.ts`, "Why Book Direct" band, booking CTA.
- **Explore** — hero, copy, six nearby-highlight image cards (Scafell Pike, Borrowdale Valley, Derwentwater, Keswick, Catbells, Honister Pass).
- **Gallery** — hero, responsive masonry-style grid, vanilla-JS lightbox with keyboard/escape support.
- **Contact** — shorter hero, contact details and enquiry form side by side, address block, "Get directions" link to Google Maps. No embedded map.
- **404** — small branded page linking home.

## Animation & interaction

All gated behind `prefers-reduced-motion`:

- **Heroes:** slow Ken Burns zoom; staged fade-up of heading → subcopy → CTA on load.
- **Scroll reveals:** shared `SectionReveal` wrapper using a ~1 KB IntersectionObserver script; sections fade/translate up on entry, staggered on card grids.
- **Micro-interactions:** button hover fills, image hover scale on cards, smooth header transparent→solid transition.

## Enquiry form behaviour

- Client-side required-field validation and a honeypot field for spam.
- Inline states: sending, success ("we'll get back to you soon"), failure.
- On failure, show the phone number and a `mailto:` link — no enquiry is ever dead-ended.
- While the endpoint is a placeholder, the form renders normally; submitting logs a "form not yet connected" console warning and shows the failure fallback.

## Error handling

- Unset booking URL → BOOK NOW buttons link to the Contact page.
- Custom 404 page.

## Testing & quality

- `astro build` + `astro check` (TypeScript) as the CI gate.
- Link-check pass over built output for broken internal links.
- Manual Lighthouse check targeting 95+ on performance, SEO, and accessibility.
- No unit-test framework — no logic warrants it; the typed content layer is the safety net.

## Out of scope (for now)

- Booking engine integration (config swap when chosen).
- Real photography (data-only swap when supplied).
- Per-room detail pages, embedded map, CMS.