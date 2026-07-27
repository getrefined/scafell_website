#!/usr/bin/env node
/**
 * Make the v2 header float: fixed to the top of the viewport, transparent
 * over the hero, condensing to a solid bar once the page is scrolled.
 *
 * The header is already `position: absolute` and out of the document flow,
 * so switching it to fixed shifts nothing below it.
 *
 * The scrolled state is a class on <html>, not on the header itself:
 * support.js re-renders the <x-dc> block through React, which would wipe a
 * class set on any element inside it. <html> sits outside the React root.
 *
 * Idempotent — safe to re-run.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = new URL('../public/v2/', import.meta.url).pathname;
const PAGES = [
  'index.html',
  'rooms.html',
  'restaurant.html',
  'private-events.html',
  'offers.html',
  'explore.html',
  'gallery.html',
  'contact.html',
];

const CSS = `/* Floating header */
header {
  position: fixed !important;
  transition: background-color 220ms ease, padding 220ms ease, box-shadow 220ms ease;
}
header img[alt="The Scafell Hotel"] { transition: width 220ms ease; }
html.v2-scrolled header {
  padding: 6px 0 !important;
  background: rgba(45,53,64,0.94);
  -webkit-backdrop-filter: saturate(140%) blur(10px);
  backdrop-filter: saturate(140%) blur(10px);
  box-shadow: 0 6px 24px rgba(20,26,32,0.28);
}
/* The logo is near-square (153x150), so its width drives the bar's height.
   64px keeps the condensed header around 75px — the Book Now button then
   becomes the tallest element in it. */
html.v2-scrolled header img[alt="The Scafell Hotel"] { width: 64px !important; }
@media (prefers-reduced-motion: reduce) {
  header, header img[alt="The Scafell Hotel"] { transition: none; }
}
`;

const SCRIPT = `  <script>
    (function () {
      // Flag lives on <html> so the React re-render of <x-dc> can't clear it.
      var root = document.documentElement;
      var ticking = false;

      function sync() {
        root.classList.toggle('v2-scrolled', window.scrollY > 60);
        ticking = false;
      }

      window.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(sync);
      }, { passive: true });

      sync();
    })();
  </script>
`;

let touched = 0;
for (const page of PAGES) {
  const file = path.join(DIR, page);
  let html = fs.readFileSync(file, 'utf8');

  if (html.includes('v2-scrolled')) {
    console.log(`skipped ${page} (floating header already present)`);
    continue;
  }

  const styleEnd = html.indexOf('</style>', html.indexOf('<style id="v2-responsive">'));
  if (styleEnd === -1) throw new Error(`no responsive style block in ${page}`);
  html = html.slice(0, styleEnd) + CSS + html.slice(styleEnd);

  html = html.replace('</body>', SCRIPT + '</body>');

  fs.writeFileSync(file, html);
  console.log(`floating header added to ${page}`);
  touched++;
}
console.log(`\n${touched} page(s) updated`);
