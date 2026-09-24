# The Scafell Hotel website

Astro 7 static site for a 23-room hotel in Rosthwaite, Borrowdale. Deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

## Which site is which (read this first)

| | Main site (the real one) | v2 mockups (design showcase only) |
|---|---|---|
| Source | `src/pages/*.astro` + components in `src/components/` | Static HTML in `public/v2/*.html` (Astro copies `public/` straight into `dist/`) |
| Live URL | https://getrefined.github.io/scafell_website/ | https://getrefined.github.io/scafell_website/v2/index.html |
| Content | Astro pages with hardcoded fallback copy, optionally overridden by Prismic slices | Hardcoded HTML, edited by the `scripts/v2-*.mjs` one-off scripts |
| Images | `src/assets/images/` (client photography, same filenames as v2) | `public/v2/assets/` (client photography, `v2b-*` files) |

**All client amends go on the main site** (`src/`), even when the client's email links to a `/v2/` URL. The v2 folder was a whitespace-reduction design concept shown to the client; it is not the product. Do not add pages or copy there unless explicitly asked.

**History:** the client amends from July to September 2026 (client photography, riverside bar copy, self-catering section, table reservation card, booking bar, floating header, green Book Now, purple banners, nav changes) were first applied only to `public/v2/` and then ported to the main Astro site on 2026-09-24. From now on apply every amend to both: the main site is the product, v2 is what the client reviews in mockup form. If they disagree, `public/v2/*.html` holds the copy the client last approved.

**Booking engine:** not yet chosen. `bookingHref` in `src/config/site.ts` sends Book Now to the Contact page, and `bookingSearchUrl()` in the same file is the swap point for the booking bar (`src/components/BookingBar.astro`).

## Prismic

- Repo `scafellhotel`. Client in `src/lib/prismicio.ts`; every page calls `getPageSlices('<type>')` and falls back to hardcoded props when the document is missing, so the build never depends on Prismic.
- Custom types live in `customtypes/<type>/index.json` (one single-type document per page). Shared slice models are in `src/slices/*/model.json`. Push both with `node scripts/push-to-prismic.mjs` (needs `docs/project-config.json`, gitignored).
- **As of Sept 2026 the Prismic repo has zero published documents**, so the live site renders only the hardcoded fallbacks. The 14 draft documents created by `scripts/create-documents.mjs` have never been published and still carry the original brief copy, not the later amends. New pages need a new custom type here plus a page in `src/pages/` with fallback content. The Migration API rejects GET/PUT with this token, so drafts can only be edited in the Prismic dashboard.

## Conventions

- New page: copy `src/pages/explore.astro` as the template. Use `Base`, `Hero` (`short` for inner pages), `RichTextSection`, `FeatureSection`, `CardGrid`, `CtaBanner`. Import images from `src/assets/images/` so Astro optimises them.
- Internal links go through `withBase()` from `src/config/site.ts` (site is served under `/scafell_website/`). Header nav lives in `src/components/Header.astro`, footer nav in `src/components/Footer.astro`.
- Contact details, booking URL, socials and menu link are in `src/config/site.ts`. Empty strings hide the related buttons.
- `npm run build` runs `astro check` first, so type errors fail the build.
- Client-supplied material lives in `Client Docs/` (brief, logo suite, amends doc) and `docs/AMENDS/` (later emails and their extracted attachments).

## Infra

- Cloudflare Worker `scafell-prismic-webhook` handles the Prismic publish webhook (`/webhook?secret=`) and the contact form (`/contact` → Mailgun). Source in `scripts/cloudflare-worker.js`. Redeploys must keep secret bindings.
- Pushing workflow files needs the `gh` credential helper, not the stored token: `git -c credential.helper= -c credential.helper='!gh auth git-credential' push`.
