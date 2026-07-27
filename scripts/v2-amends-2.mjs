#!/usr/bin/env node
/**
 * Second round of client amends on the v2 mockups.
 *
 *  1. Section titles left-aligned everywhere (three were centred).
 *  2. Restaurant intro restructured to match Rooms / Events / Offers.
 *  3. Footer: Instagram sits under Facebook rather than beside it.
 *  4. Footer: phone and email larger and bolder.
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

// 1. The only centred section titles are the three added in the first amends
// pass; every other heading on the site is left-aligned.
const centreTitle = /(font-size: 41\.6px; )text-align: center; (color: #2d3540;)/g;

// 2. The restaurant intro was a narrow centred column with an eyebrow label and
// no title, unlike every other page's intro. Rebuild it on the shared pattern:
// full-width container, left-aligned Prata title, body copy capped at 736px.
const DINING_OLD = `    <section data-screen-label="Dining" style="background: #ffffff;">
      <div style="max-width: 736px; margin: 0 auto; padding: 80px 32px; text-align: center;">
        <div>
          <span style="display: block; font-size: 12.8px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: #8a8c46; margin-bottom: 16px;">Dining</span>`;

const DINING_NEW = `    <section data-screen-label="Dining" style="padding: 64px 0;">
      <div style="max-width: 1152px; margin: 0 auto; padding: 0 32px;">
        <h2 style="font-family: 'Prata', Georgia, serif; font-weight: 400; line-height: 1.15; margin: 0 0 32px; font-size: 41.6px; color: #2d3540;">Dining Worth Staying For</h2>
        <div style="max-width: 736px;">`;

// 3. Footer socials: stack instead of sitting on one line.
const SOCIAL_OLD = 'margin: 20px 0 0; font-size: 14.4px; display: flex; gap: 16px;';
const SOCIAL_NEW = 'margin: 20px 0 0; font-size: 14.4px; display: grid; gap: 8px; justify-items: start;';

// 4. Footer phone and email: up from the inherited 14.4px body size, and bold.
const CONTACT_OLD = '<p style="margin: 0 0 16px;"><a href="tel:+441768777208"';
const CONTACT_NEW =
  '<p style="margin: 0 0 16px; font-size: 17.6px; font-weight: 700; line-height: 1.6;"><a href="tel:+441768777208"';

let touched = 0;
for (const page of PAGES) {
  const file = path.join(DIR, page);
  const before = fs.readFileSync(file, 'utf8');
  let html = before;

  html = html.replace(centreTitle, '$1$2');
  html = html.replace(DINING_OLD, DINING_NEW);
  html = html.replaceAll(SOCIAL_OLD, SOCIAL_NEW);
  html = html.replaceAll(CONTACT_OLD, CONTACT_NEW);

  if (html !== before) {
    fs.writeFileSync(file, html);
    console.log(`updated ${page}`);
    touched++;
  } else {
    console.log(`unchanged ${page}`);
  }
}
console.log(`\n${touched} page(s) updated`);
