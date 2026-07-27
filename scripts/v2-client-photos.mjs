#!/usr/bin/env node
/**
 * Replace the v2 mockup placeholder photography with the client-supplied images.
 *
 * Source: "Scafell Hotel WEB IMAGES" on the STREAMTIME client volume.
 * Images are cover-cropped to each slot's aspect ratio and never upscaled past
 * their native resolution, so a small source simply yields a smaller file.
 *
 * Re-runnable: it always regenerates every target from the original source.
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const CLIENT = '/Volumes/A-ZClients/STREAMTIME/The Scafell Hotel';
const WEB = `${CLIENT}/Website/Scafell Hotel WEB IMAGES`;
const OUT = new URL('../public/v2/assets/', import.meta.url).pathname;

// Slot shapes. Heroes are full-bleed 16:9; cards are 3:2 apart from the
// restaurant showcase, which is a slightly taller 9:7.
const HERO = { w: 1920, h: 1080 };
// The client's five supplied banners are 1584x396. Cropping them to 16:9 would
// throw away most of the frame, so they pass through at native size and let the
// hero's `object-fit: cover` do the cropping. They will look soft until
// full-size versions are purchased.
const BANNER = 'passthrough';
const CARD = { w: 1200, h: 800 };
const DINING = { w: 900, h: 700 };
const TILE = { w: 900, h: 600 };

// target basename -> [source file, slot shape]
// Several targets share a source: the original design set (hero-*.jpg,
// feature-*.jpg) is still referenced by gallery.html, explore.html and
// contact.html, so it gets rebuilt alongside the v2b-* set.
const MAP = {
  // --- page heroes: the client's banner artwork where one was supplied -----
  'v2b-hero-rooms': ['Rooms/Bedroom banner.jpg', BANNER],
  'v2b-hero-restaurant': ['Restaurant /Restaurant banner.jpg', BANNER],
  'v2b-hero-events': ['Events/Events Banner.jpg', BANNER],
  'v2b-hero-offers': ['Offers/Offers banner.jpg', BANNER],
  'v2b-hero-explore': ['Explore/Explore banner.jpg', BANNER],
  // No banner supplied for home, gallery or contact.
  'v2b-hero-home': ['Gallery/gsllery 10.jpg', HERO],
  'hero-gallery': ['Gallery/gallery 7.jpg', HERO],
  'hero-contact': ['Gallery/gallery1.jpeg', HERO],

  // --- legacy hero-*.jpg: now only feed the gallery and explore grids, so
  // they keep full-resolution photography rather than the banners ----------
  'hero-home': ['Gallery/gsllery 10.jpg', HERO],
  'hero-rooms': ['Homepage/rest.jpeg', HERO],
  'hero-events': ['Events/Celebration.jpeg', HERO],
  'hero-offers': ['Gallery/gallery4.jpeg', HERO],
  'hero-explore': [`${CLIENT}/High Res Images/shutterstock_2602231543.jpg`, HERO],

  // --- homepage feature cards --------------------------------------------
  // Twin rather than Double, so the gallery grid doesn't show the same
  // pillow shot twice alongside the Double room card.
  'v2b-feature-rooms': ['Rooms/Twin.jpeg', CARD],
  'feature-rooms': ['Rooms/Twin.jpeg', CARD],
  'v2b-feature-dining': ['Restaurant /Food 1.jpeg', CARD],
  'feature-dining': ['Restaurant /Food 1.jpeg', CARD],
  'v2b-feature-explore': ['Gallery/gallery 2.jpeg', CARD],
  'feature-explore': ['Gallery/gallery 2.jpeg', CARD],
  'dining-detail': ['Restaurant /food6.jpeg', CARD],

  // --- room cards ---------------------------------------------------------
  'v2b-room-family': ['Rooms/Family.jpeg', CARD],
  'room-family': ['Rooms/Family.jpeg', CARD],
  'v2b-room-double': ['Rooms/Double.jpeg', CARD],
  'room-double': ['Rooms/Double.jpeg', CARD],
  'v2b-room-twin': ['Rooms/Twin.jpeg', CARD],
  'v2b-room-single': ['Rooms/Single.jpeg', CARD],

  // --- restaurant showcase ------------------------------------------------
  'v2b-dining-1': ['Restaurant /Food 1.jpeg', DINING],
  'v2b-dining-2': ['Restaurant /food3.jpeg', DINING],
  'v2b-dining-3': ['Events/Privte dining.jpeg', DINING],
  'v2b-dining-4': ['Restaurant /food 4.jpeg', DINING],
  'v2b-dining-5': ['Restaurant /Food5.jpeg', DINING],

  // --- events -------------------------------------------------------------
  'v2b-event-1': ['Restaurant /food 2.jpeg', TILE],
  'v2b-event-2': ['Events/Privte dining.jpeg', TILE],
  'v2b-event-3': ['Events/Corporate Dining.jpeg', TILE],

  // --- offers (no offer photography supplied; drawn from the wider set) ----
  'v2b-offer-1': ['Gallery/gallery 7.jpg', TILE],
  'v2b-offer-2': ['Rooms/Single.jpeg', TILE],
  'v2b-offer-3': ['Gallery/gallery 8.jpg', TILE],
  'v2b-offer-4': ['Restaurant /Food5.jpeg', TILE],
  'v2b-offer-5': ['Rooms/Twin.jpeg', TILE],
  'v2b-offer-6': ['Events/Celebration.jpeg', TILE],
};

const resolve = (src) => (src.startsWith('/') ? src : path.join(WEB, src));

let written = 0;
for (const [name, [src, slot]] of Object.entries(MAP)) {
  const from = resolve(src);
  if (!fs.existsSync(from)) throw new Error(`missing source: ${from}`);

  const meta = await sharp(from).metadata();
  let w = meta.width;
  let h = meta.height;
  const pipeline = sharp(from);

  if (slot !== BANNER) {
    // Fit the slot without ever enlarging the source.
    const scale = Math.min(1, meta.width / slot.w, meta.height / slot.h);
    w = Math.round(slot.w * scale);
    h = Math.round(slot.h * scale);
    pipeline.resize(w, h, { fit: 'cover', position: 'centre' });
  }

  await pipeline
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(path.join(OUT, `${name}.jpg`));

  console.log(`${name}.jpg  ${w}x${h}  <- ${src}`);
  written++;
}
console.log(`\n${written} images written to public/v2/assets/`);
