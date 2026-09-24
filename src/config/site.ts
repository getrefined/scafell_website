/** Base-path helper — GitHub Pages serves the site under /scafell_website/. */
export const withBase = (path: string): string =>
  import.meta.env.BASE_URL.replace(/\/$/, '') + path;

export const site = {
  name: 'The Scafell Hotel',
  tagline: 'Lake District',
  url: 'https://getrefined.github.io/scafell_website/',

  // ── Placeholders: set these when known ──────────────────────────
  bookingUrl: '', // external booking engine URL; '' → BOOK NOW links to the Contact page
  formEndpoint: 'https://scafell-prismic-webhook.digital-f33.workers.dev/contact',
  menusUrl: '', // link/PDF for VIEW MENUS; '' → hide the button
  facebookUrl: '', // '' → hide link
  instagramUrl: '', // '' → hide link
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
export const bookingHref: string = site.bookingUrl || withBase('/contact/');

/** Shape of a booking-bar search (see BookingBar.astro). */
export interface BookingSearch {
  arrive: string; // YYYY-MM-DD
  depart: string; // YYYY-MM-DD
  adults: number;
  children: number;
}

/**
 * SWAP POINT: the booking provider is still to be confirmed. Once chosen, build and
 * return their search URL here and the booking bar will send guests straight to it.
 * Returning null keeps the placeholder confirmation message.
 */
export function bookingSearchUrl(_details: BookingSearch): string | null {
  return null;
  // e.g. return `https://book.example.com/search?checkin=${_details.arrive}&checkout=${_details.depart}&adults=${_details.adults}&children=${_details.children}`;
}
