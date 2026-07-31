#!/usr/bin/env node
/**
 * Rooms page amends:
 *   1. Note dog-friendly and accessible rooms in the intro paragraph.
 *   2. Add a Self-Catering row after Single, using the client's kitchenette
 *      photo from `Client Docs/`.
 *
 * The row continues the alternating band pattern — Single is off-white with
 * the image on the right, so this one is white with the image on the left.
 *
 * The image is cover-cropped to the 3:2 room slot but never upscaled past its
 * 940x788 source, matching v2-client-photos.mjs.
 *
 * Idempotent — safe to re-run.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = new URL('../', import.meta.url).pathname;
const FILE = path.join(ROOT, 'public/v2/rooms.html');
const SOURCE = path.join(ROOT, 'Client Docs/Self catering.jpg');
const TARGET = path.join(ROOT, 'public/v2/assets/v2b-room-self-catering.jpg');

const SLOT = { w: 1200, h: 800 };

const PURPLE = '#7c506e';
const PILL = `font-size: 13px; font-weight: 400; letter-spacing: 0.04em; border: 1px solid rgba(124,80,110,0.35); color: ${PURPLE}; border-radius: 999px; padding: 4px 14px;`;

const FEATURES = [
  'Fully equipped kitchen',
  'Comfortable living and dining area',
  'En-suite bathroom',
  'Flat-screen TV',
];

const SECTION = `
    <!-- Self-Catering — white band, image left -->
    <section data-screen-label="Room - Self-Catering" style="background: #ffffff;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; align-items: stretch;">
        <img src="assets/v2b-room-self-catering.jpg" alt="The fully equipped kitchen in the self-catering accommodation at The Scafell Hotel" style="width: 100%; height: 100%; min-height: 440px; object-fit: cover;">
        <div style="display: grid; align-content: center; padding: 56px clamp(32px, 6vw, 96px);">
          <span style="display: block; font-size: 12.8px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: ${PURPLE}; margin-bottom: 12px;">Sleeps 4</span>
          <h2 style="font-family: 'Prata', Georgia, serif; font-weight: 400; line-height: 1.15; margin: 0 0 16px; font-size: 41.6px;">Self-Catering</h2>
          <p style="margin: 0;">Enjoy the freedom to explore the Lake District at your own pace from the comfort of our self-catering accommodation. With a fully equipped kitchen, comfortable living space, and everything you need for a relaxing stay, it's the perfect choice for families, couples or longer breaks.</p>
          <ul style="margin: 20px 0 0; padding: 0; list-style: none; display: flex; flex-wrap: wrap; gap: 8px;">
${FEATURES.map((f) => `            <li style="${PILL}">${f}</li>`).join('\n')}
          </ul>
          <div style="margin-top: 24px;"><a href="contact.html" style="display: inline-block; font-weight: 700; font-size: 13.6px; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; color: #ffffff; background: #54728c; border: 1px solid #54728c; border-radius: 4px; padding: 12px 27px;" style-hover="background: #2d3540; border-color: #2d3540;">Book Self-Catering →</a></div>
        </div>
      </div>
    </section>
`;

// --- image ---------------------------------------------------------------
if (fs.existsSync(TARGET)) {
  console.log('skipped image (v2b-room-self-catering.jpg already present)');
} else {
  const meta = await sharp(SOURCE).metadata();
  const scale = Math.min(1, meta.width / SLOT.w, meta.height / SLOT.h);
  const w = Math.round(SLOT.w * scale);
  const h = Math.round(SLOT.h * scale);
  await sharp(SOURCE)
    .resize(w, h, { fit: 'cover', position: 'centre' })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(TARGET);
  console.log(`v2b-room-self-catering.jpg written at ${w}x${h}`);
}

// --- markup --------------------------------------------------------------
let html = fs.readFileSync(FILE, 'utf8');
let changed = false;

const INTRO_OLD =
  'valleys of the Lake District.</p>';
const INTRO_NEW =
  'valleys of the Lake District. We have a limited number of dog friendly rooms and disabled rooms upon request.</p>';

if (html.includes(INTRO_NEW)) {
  console.log('skipped intro (dog friendly / disabled rooms note already present)');
} else if (html.includes(INTRO_OLD)) {
  html = html.replace(INTRO_OLD, INTRO_NEW);
  changed = true;
  console.log('intro paragraph updated');
} else {
  throw new Error('intro paragraph not found in rooms.html');
}

if (html.includes('data-screen-label="Room - Self-Catering"')) {
  console.log('skipped section (Self-Catering already present)');
} else {
  const anchor = '\n    <section data-screen-label="CTA Banner"';
  if (!html.includes(anchor)) throw new Error('no CTA banner section in rooms.html');
  html = html.replace(anchor, SECTION + anchor);
  changed = true;
  console.log('Self-Catering section added');
}

if (changed) fs.writeFileSync(FILE, html);
