#!/usr/bin/env node
/**
 * Add the Riverside Bar copy to the v2 restaurant page.
 *
 * Sits after the photo showcase and before the green band, so the page reads
 * dining -> food -> bar -> reserve. Uses the same left-aligned heading and
 * 736px measure as the "Dining Worth Staying For" section above it.
 *
 * Text-only: there is no bar photograph in the client set yet.
 *
 * Idempotent — safe to re-run.
 */
import fs from 'node:fs';
import path from 'node:path';

const FILE = path.join(new URL('../public/v2/', import.meta.url).pathname, 'restaurant.html');

const SECTION = `
    <!-- Riverside Bar -->
    <section data-screen-label="Riverside Bar" style="padding: 64px 0;">
      <div style="max-width: 1152px; margin: 0 auto; padding: 0 32px;">
        <h2 style="font-family: 'Prata', Georgia, serif; font-weight: 400; line-height: 1.15; margin: 0 0 32px; font-size: 41.6px; color: #2d3540;">Relax Beside the River</h2>
        <div style="max-width: 736px;">
          <p style="margin: 0 0 16px;">Whether you're meeting friends for a relaxed catch-up, enjoying pre-dinner drinks or unwinding after a day exploring the fells, the Riverside Bar offers the perfect setting.</p>
          <p style="margin: 0;">Overlooking the river, it's a welcoming space to enjoy a carefully selected range of wines, local ales, premium spirits and expertly crafted drinks. Pair your favourite tipple with a light bite, settle into comfortable surroundings and take in the peaceful atmosphere, whatever the occasion.</p>
        </div>
      </div>
    </section>
`;

let html = fs.readFileSync(FILE, 'utf8');

if (html.includes('data-screen-label="Riverside Bar"')) {
  console.log('skipped restaurant.html (Riverside Bar already present)');
} else {
  const anchor = '\n    <!-- Green band -->';
  if (!html.includes(anchor)) throw new Error('no green band section in restaurant.html');
  html = html.replace(anchor, SECTION + anchor);
  fs.writeFileSync(FILE, html);
  console.log('Riverside Bar section added to restaurant.html');
}
