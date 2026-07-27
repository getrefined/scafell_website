#!/usr/bin/env node
/**
 * Add the booking bar to the v2 homepage and rooms page.
 *
 * A white card straddling the bottom edge of the hero: arrival, departure,
 * adults, children and a Check Availability button. The booking provider is
 * still to be confirmed, so submitting renders a placeholder confirmation
 * instead of navigating. See `bookingUrl()` in the injected script — that is
 * the single swap point once a provider is chosen.
 *
 * Idempotent — safe to re-run.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = new URL('../public/v2/', import.meta.url).pathname;
const PAGES = ['index.html', 'rooms.html'];

const GREEN = '#8a8c46';
const GREEN_DARK = '#6f7136';
const INK = '#2d3540';

const label = (forId, text) =>
  `<label for="${forId}" style="display: block; font-size: 12.8px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${GREEN}; margin-bottom: 8px;">${text}</label>`;

const FIELD = `width: 100%; box-sizing: border-box; font-family: 'Manrope', system-ui, sans-serif; font-size: 15.2px; color: ${INK}; background: #ffffff; border: 1px solid rgba(45,53,64,0.2); border-radius: 4px; padding: 12px 14px;`;

const options = (from, to) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i)
    .map((n) => `<option value="${n}"${n === from ? ' selected' : ''}>${n}</option>`)
    .join('');

const BAR = `
  <!-- Booking bar: overlaps the hero, sits above the following section -->
  <div id="v2-book-wrap" style="position: relative; z-index: 5; margin-top: -56px;">
    <div style="max-width: 1152px; margin: 0 auto; padding: 0 32px;">
      <div style="background: #ffffff; border-radius: 4px; box-shadow: 0 10px 30px rgba(45,53,64,0.15); padding: 24px 28px;">
        <!-- novalidate: a date typed below its min would otherwise be caught by
             native validation, which blocks the submit event and reports via a
             browser tooltip instead of the card's own status line. -->
        <form id="v2-book-form" novalidate style="display: grid; grid-template-columns: 1fr 1fr 0.7fr 0.7fr auto; gap: 20px; align-items: end;">
          <div>
            ${label('v2-book-arrive', 'Arrive')}
            <input id="v2-book-arrive" name="arrive" type="date" style="${FIELD}">
          </div>
          <div>
            ${label('v2-book-depart', 'Depart')}
            <input id="v2-book-depart" name="depart" type="date" style="${FIELD}">
          </div>
          <div>
            ${label('v2-book-adults', 'Adults')}
            <select id="v2-book-adults" name="adults" style="${FIELD}">${options(1, 6)}</select>
          </div>
          <div>
            ${label('v2-book-children', 'Children')}
            <select id="v2-book-children" name="children" style="${FIELD}">${options(0, 4)}</select>
          </div>
          <div>
            <button type="submit" style="display: block; width: 100%; font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 13.6px; letter-spacing: 0.14em; text-transform: uppercase; color: #ffffff; background: ${GREEN}; border: 1px solid ${GREEN}; border-radius: 4px; padding: 13px 27px; cursor: pointer;" style-hover="background: ${GREEN_DARK}; border-color: ${GREEN_DARK};">Check Availability</button>
          </div>
        </form>
        <p id="v2-book-status" role="status" style="margin: 16px 0 0; font-size: 14.4px; line-height: 1.6; color: ${INK}; display: none;"></p>
      </div>
    </div>
  </div>
`;

const CSS = `/* Booking bar */
@media (max-width: 1120px) {
  #v2-book-form { grid-template-columns: repeat(4, 1fr) !important; }
  #v2-book-form > *:last-child { grid-column: 1 / -1; }
}
@media (max-width: 820px) {
  #v2-book-wrap { margin-top: 24px !important; }
  #v2-book-form { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
  #v2-book-form > *:last-child { grid-column: 1 / -1; }
}
`;

const SCRIPT = `  <script>
    (function () {
      // support.js treats the <x-dc> block as a template and re-renders it
      // through React, which throws away listeners bound to the original
      // nodes. Everything below is delegated from document so it survives
      // that re-render, and elements are looked up when an event fires
      // rather than cached at load.
      function el(id) { return document.getElementById(id); }
      function today() { return new Date().toISOString().slice(0, 10); }

      // No arrivals in the past, and no departure before the arrival.
      document.addEventListener('focusin', function (event) {
        var target = event.target;
        if (target.id !== 'v2-book-arrive' && target.id !== 'v2-book-depart') return;
        var arrive = el('v2-book-arrive');
        el('v2-book-arrive').min = today();
        el('v2-book-depart').min = arrive.value || today();
      });

      document.addEventListener('change', function (event) {
        if (event.target.id !== 'v2-book-arrive') return;
        var arrive = el('v2-book-arrive');
        var depart = el('v2-book-depart');
        depart.min = arrive.value || today();
        if (depart.value && depart.value <= arrive.value) depart.value = '';
      });

      // ---------------------------------------------------------------
      // SWAP POINT: the booking provider is still to be confirmed.
      // Once chosen, build and return their search URL here — the submit
      // handler will send the guest straight to it. Return null to keep
      // showing the placeholder confirmation below the card.
      // ---------------------------------------------------------------
      function bookingUrl(details) {
        return null;
        // e.g. return 'https://book.example.com/search'
        //   + '?checkin=' + details.arrive
        //   + '&checkout=' + details.depart
        //   + '&adults=' + details.adults
        //   + '&children=' + details.children;
      }

      function longDate(value) {
        return new Date(value + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
      }

      function plural(count, word) {
        return count + ' ' + word + (count === 1 ? '' : 's');
      }

      document.addEventListener('submit', function (event) {
        if (!event.target || event.target.id !== 'v2-book-form') return;
        event.preventDefault();

        var arrive = el('v2-book-arrive');
        var depart = el('v2-book-depart');
        var status = el('v2-book-status');
        status.style.display = 'block';

        var details = {
          arrive: arrive.value,
          depart: depart.value,
          adults: Number(el('v2-book-adults').value),
          children: Number(el('v2-book-children').value)
        };

        if (!details.arrive || !details.depart) {
          status.textContent = 'Please choose your arrival and departure dates.';
          return;
        }

        var nights = Math.round((new Date(details.depart) - new Date(details.arrive)) / 86400000);
        if (nights < 1) {
          status.textContent = 'Your departure date needs to be after your arrival date.';
          return;
        }

        var url = bookingUrl(details);
        if (url) {
          window.location.href = url;
          return;
        }

        var guests = plural(details.adults, 'adult');
        if (details.children > 0) guests += ' \\u00b7 ' + plural(details.children, 'child').replace('childs', 'children');

        status.textContent = plural(nights, 'night') + ', ' + longDate(details.arrive) + '\\u2013'
          + longDate(details.depart) + ', ' + guests
          + ' \\u2014 online booking is being connected. Please call +44 17687 77208 or use our enquiry form.';
      });
    })();
  </script>
`;

let touched = 0;
for (const page of PAGES) {
  const file = path.join(DIR, page);
  let html = fs.readFileSync(file, 'utf8');

  if (html.includes('id="v2-book-form"')) {
    console.log(`skipped ${page} (booking bar already present)`);
    continue;
  }

  // Insert the bar immediately after the hero section closes.
  const heroStart = html.indexOf('data-screen-label="Hero"');
  if (heroStart === -1) throw new Error(`no hero section in ${page}`);
  const heroEnd = html.indexOf('</section>', heroStart);
  if (heroEnd === -1) throw new Error(`unterminated hero section in ${page}`);
  const after = heroEnd + '</section>'.length;
  html = html.slice(0, after) + '\n' + BAR + html.slice(after);

  // Mobile rules go at the end of the existing responsive block.
  const styleEnd = html.indexOf('</style>', html.indexOf('<style id="v2-responsive">'));
  if (styleEnd === -1) throw new Error(`no responsive style block in ${page}`);
  html = html.slice(0, styleEnd) + CSS + html.slice(styleEnd);

  html = html.replace('</body>', SCRIPT + '</body>');

  fs.writeFileSync(file, html);
  console.log(`added booking bar to ${page}`);
  touched++;
}
console.log(`\n${touched} page(s) updated`);
