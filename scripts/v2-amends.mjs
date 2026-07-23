/**
 * Applies the client's "Website Amends" feedback to the public/v2 mockups.
 * Idempotent: each transform is a no-op if its target is already changed.
 * current.html is left untouched as the "before" reference.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = 'public/v2';
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

const GREEN = '#8a8c46';
const GREEN_DARK = '#6f7136';
const PURPLE = '#7c506e';

const BTN = (href, label) =>
  `<a href="${href}" style="display: inline-block; font-weight: 700; font-size: 13.6px; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; color: #ffffff; background: #54728c; border: 1px solid #54728c; border-radius: 4px; padding: 12px 27px;" style-hover="background: #2d3540; border-color: #2d3540;">${label}</a>`;

const FLOAT_BTN = `<a href="contact.html" id="v2-float-book" style="position: fixed; right: 20px; bottom: 25%; z-index: 300; display: inline-block; font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 13px; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; color: #ffffff; background: ${GREEN}; border: 1px solid ${GREEN}; border-radius: 999px; padding: 14px 28px; box-shadow: 0 8px 24px rgba(45,53,64,0.35);" style-hover="background: ${GREEN_DARK}; border-color: ${GREEN_DARK};">Book Now</a>`;

function must(html, changed, file, what) {
  if (!changed) throw new Error(`${file}: transform failed — ${what}`);
  return html;
}

function sub(html, pattern, replacement, file, what, { optional = false } = {}) {
  const next = html.replace(pattern, replacement);
  if (next === html && !optional) throw new Error(`${file}: no match — ${what}`);
  return next;
}

for (const f of PAGES) {
  const p = path.join(DIR, f);
  let html = fs.readFileSync(p, 'utf8');
  const original = html;

  /* ── Global chrome ──────────────────────────────────────────── */

  // 1. Top nav: drop Home + Contact, rename Private Events → Events
  html = sub(html, /\s*<li><a href="index\.html"[^>]*(?:\s+style-hover="[^"]*")?>Home<\/a><\/li>/, '', f, 'remove Home nav item', { optional: true });
  html = sub(html, /\s*<li><a href="contact\.html"[^>]*(?:\s+style-hover="[^"]*")?>Contact<\/a><\/li>/, '', f, 'remove Contact nav item', { optional: true });
  html = html.replaceAll('>Private Events</a>', '>Events</a>');

  // 2. Footer nav: drop Homepage
  html = sub(html, /\s*<li><a href="index\.html"[^>]*(?:\s+style-hover="[^"]*")?>Homepage<\/a><\/li>/, '', f, 'remove Homepage footer item', { optional: true });

  // 3. Book Now buttons → Fell Green (header solid-blue + footer outline variants)
  html = html.replace(
    /(<a href="contact\.html"[^>]*)background: #54728c; border: 1px solid #54728c;([^>]*style-hover=")background: #2d3540; border-color: #2d3540;("[^>]*>Book Now<\/a>)/g,
    `$1background: ${GREEN}; border: 1px solid ${GREEN};$2background: ${GREEN_DARK}; border-color: ${GREEN_DARK};$3`
  );
  html = html.replace(
    /(<a href="contact\.html"[^>]*)background: transparent; border: 1px solid #ffffff;([^>]*style-hover=")background: #ffffff; color: #2d3540;("[^>]*>Book Now<\/a>)/g,
    `$1background: ${GREEN}; border: 1px solid ${GREEN};$2background: ${GREEN_DARK}; border-color: ${GREEN_DARK};$3`
  );

  // 4. Footer col 1: SH icon instead of wordmark, socials under it; address → col 3
  html = sub(
    html,
    /<img src="assets\/logo-white\.svg" alt="The Scafell Hotel" style="width: 140px; height: auto; display: block;">\s*<p style="font-size: 14\.4px; opacity: 0\.85; margin: 16px 0;">The Scafell Hotel<br>Lake District National Park<br>Rosthwaite, Keswick<br>CA12 5XB, United Kingdom<\/p>/,
    `<img src="assets/icon-fell-green.svg" alt="The Scafell Hotel" style="width: 84px; height: auto; display: block;">
        <p style="margin: 20px 0 0; font-size: 14.4px; display: flex; gap: 16px;"><a href="#" style="color: #bdd9f2; text-decoration: none;" style-hover="text-decoration: underline;">Facebook</a><a href="#" style="color: #bdd9f2; text-decoration: none;" style-hover="text-decoration: underline;">Instagram</a></p>`,
    f, 'footer col1 icon + socials', { optional: true }
  );
  html = sub(
    html,
    /<p style="margin: 0 0 16px;"><a href="tel:\+441768777208"/,
    `<p style="font-size: 14.4px; opacity: 0.85; margin: 0 0 16px;">The Scafell Hotel<br>Lake District National Park<br>Rosthwaite, Keswick<br>CA12 5XB, United Kingdom</p>
        <p style="margin: 0 0 16px;"><a href="tel:+441768777208"`,
    f, 'address into footer col3', { optional: true }
  );

  // 5. Floating Book Now pill
  if (!html.includes('id="v2-float-book"')) {
    html = sub(html, /<\/body>/, `${FLOAT_BTN}\n</body>`, f, 'floating Book Now');
  }

  // 6. CTA bands: dark blue → Gorse Purple so they contrast with the footer
  html = html.replace(
    /(data-screen-label="(?:CTA Banner|Why Book Direct)" style="background: )#2d3540(; color: #ffffff; text-align: center; padding: 80px 0;")/g,
    `$1${PURPLE}$2`
  );
  // outline buttons inside purple bands: hover text colour must match the band
  html = html.replace(
    /(background: transparent; border: 1px solid #ffffff;[^>]*style-hover="background: #ffffff; color: )#2d3540(;")/g,
    `$1${PURPLE}$2`
  );

  /* ── Page-specific amends ───────────────────────────────────── */

  if (f === 'index.html') {
    html = sub(html, 'assets/hero-home.jpg', 'assets/v2b-hero-home.jpg', f, 'home hero image', { optional: true });
    html = sub(html, 'assets/feature-rooms.jpg', 'assets/v2b-feature-rooms.jpg', f, 'feature rooms image', { optional: true });
    html = sub(html, 'assets/feature-dining.jpg', 'assets/v2b-feature-dining.jpg', f, 'feature dining image', { optional: true });
    html = sub(html, 'assets/feature-explore.jpg', 'assets/v2b-feature-explore.jpg', f, 'feature explore image', { optional: true });
  }

  if (f === 'rooms.html') {
    html = sub(html, 'assets/hero-rooms.jpg', 'assets/v2b-hero-rooms.jpg', f, 'rooms hero image', { optional: true });
    html = sub(html, 'assets/room-family.jpg', 'assets/v2b-room-family.jpg', f, 'family room image', { optional: true });
    html = sub(html, 'assets/room-double.jpg', 'assets/v2b-room-double.jpg', f, 'double room image', { optional: true });
    html = sub(html, 'assets/room-twin.jpg', 'assets/v2b-room-twin.jpg', f, 'twin room image', { optional: true });
    html = sub(html, 'assets/room-single.jpg', 'assets/v2b-room-single.jpg', f, 'single room image', { optional: true });
    // Title on the first white space
    if (!html.includes('Our Elegant Rooms and Suites')) {
      html = sub(
        html,
        /(data-screen-label="Intro"[^>]*>\s*<div style="max-width: 1152px; margin: 0 auto; padding: 0 32px;[^"]*">)/,
        `$1
        <h2 style="font-family: 'Prata', Georgia, serif; font-weight: 400; line-height: 1.15; margin: 0 0 32px; font-size: 41.6px; text-align: center; color: #2d3540;">Our Elegant Rooms and Suites</h2>`,
        f, 'rooms intro title'
      );
    }
  }

  if (f === 'restaurant.html') {
    html = sub(html, 'assets/hero-restaurant.jpg', 'assets/v2b-hero-restaurant.jpg', f, 'restaurant hero image', { optional: true });
    // Top layout: lose the second image; centre the intro text full-width
    html = sub(
      html,
      /<div style="display: grid; grid-template-columns: 1fr 1fr; align-items: stretch;">\s*<img src="assets\/dining-detail\.jpg"[^>]*>\s*<div style="display: grid; align-content: center; padding: 56px clamp\(32px, 6vw, 96px\);">/,
      `<div style="max-width: 736px; margin: 0 auto; padding: 80px 32px; text-align: center;">
        <div>`,
      f, 'restaurant top layout', { optional: true }
    );
    // Fill the five showcase slots with photos
    let slot = 0;
    html = html.replace(/<image-slot([^>]*)><\/image-slot>/g, (m, attrs) => {
      slot++;
      const label = (attrs.match(/placeholder="([^"]*)"/) || [])[1] || 'Restaurant photography';
      return `<img src="assets/v2b-dining-${slot}.jpg" alt="${label}" style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 4px;">`;
    });
    // Bottom "Reserve" banner → purple so it contrasts with the footer
    html = sub(
      html,
      /(data-screen-label="Reserve" style=")padding: 64px 0; text-align: center;"/,
      `$1background: ${PURPLE}; color: #ffffff; padding: 64px 0; text-align: center;"`,
      f, 'reserve banner colour', { optional: true }
    );
    html = sub(html, /Call us on <a href="tel:\+441768777208" style="color: #54728c;">/, 'Call us on <a href="tel:+441768777208" style="color: #ffffff; font-weight: 700;">', f, 'reserve tel colour', { optional: true });
  }

  if (f === 'private-events.html') {
    html = sub(html, 'assets/hero-events.jpg', 'assets/v2b-hero-events.jpg', f, 'events hero image', { optional: true });
    html = sub(html, '>Celebrate in the Heart of the Lakes<', '>Celebrate in the Lakes<', f, 'events hero title', { optional: true });
    if (!html.includes('Celebrating Special Moments')) {
      html = sub(
        html,
        /(data-screen-label="Intro"[^>]*>\s*<div style="max-width: 1152px; margin: 0 auto; padding: 0 32px;[^"]*">)/,
        `$1
        <h2 style="font-family: 'Prata', Georgia, serif; font-weight: 400; line-height: 1.15; margin: 0 0 32px; font-size: 41.6px; text-align: center; color: #2d3540;">Celebrating Special Moments</h2>`,
        f, 'events intro title'
      );
    }
    // Occasion cards: real photos instead of empty slots
    let slot = 0;
    html = html.replace(/<image-slot([^>]*)><\/image-slot>/g, (m, attrs) => {
      slot++;
      const label = (attrs.match(/placeholder="([^"]*)"/) || [])[1] || 'Event photography';
      return `<img src="assets/v2b-event-${slot}.jpg" alt="${label}" style="width: 100%; height: 100%; object-fit: cover; display: block; border-radius: 4px;">`;
    });
  }

  if (f === 'offers.html') {
    html = sub(html, '>Exclusive Offers at The Scafell Hotel<', '>Exclusive Offers<', f, 'offers hero title', { optional: true });
    if (!html.includes('Explore our range of offers')) {
      html = sub(
        html,
        /(data-screen-label="Current Offers"[^>]*>\s*<div style="max-width: 1152px; margin: 0 auto; padding: 0 32px;[^"]*">)/,
        `$1
        <h2 style="font-family: 'Prata', Georgia, serif; font-weight: 400; line-height: 1.15; margin: 0 0 32px; font-size: 41.6px; text-align: center; color: #2d3540;">Explore our range of offers</h2>`,
        f, 'offers intro title'
      );
    }
    // Offer cards: add an image on top (like the explore page) and a book CTA below
    let card = 0;
    html = html.replace(
      /<article style="background: #ffffff; border-top: 3px solid #8a8c46; border-radius: 4px; padding: 32px; box-shadow: 0 10px 30px rgba\(45,53,64,0\.08\);">\s*(<h3[^>]*>([^<]+)<\/h3>)\s*(<p[^>]*>[^<]*<\/p>)\s*<\/article>/g,
      (m, h3, title, body) => {
        card++;
        return `<article style="background: #ffffff; border-top: 3px solid #8a8c46; border-radius: 4px; overflow: hidden; box-shadow: 0 10px 30px rgba(45,53,64,0.08);">
            <img src="assets/v2b-offer-${card}.jpg" alt="${title.trim()}" style="aspect-ratio: 3 / 2; object-fit: cover; width: 100%; display: block;">
            <div style="padding: 32px;">
              ${h3}
              ${body}
              <div style="margin-top: 24px;">${BTN('contact.html', 'Book This Offer →')}</div>
            </div>
          </article>`;
      }
    );
  }

  if (f === 'gallery.html') {
    html = sub(html, '>Discover The Scafell Hotel<', '>Discover<', f, 'gallery hero title', { optional: true });
  }

  if (f === 'contact.html') {
    html = sub(html, ">We'd Love to Hear From You<", '>Here to help<', f, 'contact hero title', { optional: true });
  }

  if (html !== original) {
    fs.writeFileSync(p, html);
    console.log(`ok   ${f}`);
  } else {
    console.log(`skip ${f} (no changes)`);
  }
}
console.log('done');
