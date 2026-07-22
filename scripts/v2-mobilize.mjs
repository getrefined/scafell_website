/**
 * Injects mobile-responsive overrides into the public/v2 design mockups.
 * The mockups use inline pixel styles, so overrides rely on !important
 * (stylesheet !important beats inline styles) inside media queries —
 * desktop rendering is untouched. Re-runnable: skips already-treated files.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'public/v2';

const CSS = `
<style id="v2-responsive">
/* ── v2 mobile overrides (desktop unchanged) ─────────────────── */
@media (max-width: 1120px) {
  [style*="width: 1152px"] { width: auto !important; max-width: 100%; }
}
/* Collapse header nav into a hamburger dropdown */
@media (max-width: 1100px) {
  header > div { position: relative; }
  header nav { display: none !important; }
  header .v2-burger { display: grid !important; }
  header > div > a[style*="background: #54728c"] { margin-left: auto !important; }
  #v2nav:checked ~ nav {
    display: block !important;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin: 0 !important;
    background: #2d3540;
    padding: 20px 24px;
  }
  #v2nav:checked ~ nav ul {
    flex-direction: column !important;
    gap: 14px !important;
  }
}
/* Tablet: 3/4-column grids → 2 columns */
@media (min-width: 821px) and (max-width: 1120px) {
  [style*="grid-template-columns: repeat(3"],
  [style*="grid-template-columns: repeat(4"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
}
/* Phone: stack layouts, fluid type, tighter gutters */
@media (max-width: 820px) {
  [style*="grid-template-columns"] { grid-template-columns: 1fr !important; }
  [style*="grid-template-columns: repeat(3, minmax"],
  [style*="grid-template-columns: repeat(4, minmax"] {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  [style*="width: 704px"], [style*="width: 736px"] { width: auto !important; max-width: 100%; }
  [style*="max-width: 1152px"] { padding-left: 20px !important; padding-right: 20px !important; }
  h1 { font-size: clamp(2rem, 9vw, 3.4rem) !important; }
  h2 { font-size: clamp(1.45rem, 6.5vw, 2.2rem) !important; }
  h3 { font-size: clamp(1.15rem, 5vw, 1.45rem) !important; }
  img { max-width: 100%; }
}
@media (max-width: 480px) {
  [style*="grid-template-columns: repeat(3, minmax"],
  [style*="grid-template-columns: repeat(4, minmax"] {
    grid-template-columns: 1fr !important;
  }
}
</style>
`;

const BURGER = `<input type="checkbox" id="v2nav" style="display: none;"><label for="v2nav" class="v2-burger" aria-label="Menu" style="display: none; gap: 5px; cursor: pointer; padding: 10px; order: 5;"><span style="display: block; width: 24px; height: 2px; background: #ffffff;"></span><span style="display: block; width: 24px; height: 2px; background: #ffffff;"></span><span style="display: block; width: 24px; height: 2px; background: #ffffff;"></span></label>`;

let changed = 0;
for (const f of fs.readdirSync(DIR).filter((f) => f.endsWith('.html'))) {
  const p = path.join(DIR, f);
  let html = fs.readFileSync(p, 'utf8');
  if (html.includes('id="v2-responsive"')) {
    console.log(`skip ${f} (already treated)`);
    continue;
  }
  if (!html.includes('</helmet>')) throw new Error(`${f}: no </helmet> tag`);
  html = html.replace('</helmet>', `${CSS}</helmet>`);

  // Insert checkbox+burger between the logo link and <nav> (sibling order
  // matters for the #v2nav:checked ~ nav selector)
  const before = html;
  html = html.replace(/(logo-white\.svg[^>]*><\/a>)/, `$1${BURGER}`);
  if (html === before) throw new Error(`${f}: logo anchor not found`);

  fs.writeFileSync(p, html);
  changed++;
  console.log(`ok   ${f}`);
}
console.log(`${changed} file(s) updated`);
