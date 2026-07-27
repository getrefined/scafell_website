#!/usr/bin/env node
/**
 * Add a table reservation card to the v2 restaurant page.
 *
 * Mirrors the room booking bar on the homepage and rooms page so all three
 * widgets read as one system: a white card straddling the bottom of the hero.
 *
 * The reservation system is still to be confirmed, so submitting validates
 * and renders a confirmation line rather than navigating. See
 * `reservationUrl()` in the injected script — the single swap point.
 *
 * SERVICE TIMES ARE A PLACEHOLDER. Lunch 12:00-14:30 and dinner 18:00-21:00
 * are a conventional pattern, not the client's actual hours. Confirm and
 * update SITTINGS below.
 *
 * Idempotent — safe to re-run.
 */
import fs from 'node:fs';
import path from 'node:path';

const DIR = new URL('../public/v2/', import.meta.url).pathname;
const PAGE = 'restaurant.html';

const GREEN = '#8a8c46';
const GREEN_DARK = '#6f7136';
const INK = '#2d3540';

// Grouped so the label makes 12:00 vs 6:00 unambiguous without am/pm.
const SITTINGS = [
  { name: 'Lunch', times: ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30'] },
  { name: 'Dinner', times: ['18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'] },
];

const clockLabel = (value) => {
  const [h, m] = value.split(':').map(Number);
  return (h > 12 ? h - 12 : h) + ':' + String(m).padStart(2, '0');
};

const timeOptions = SITTINGS.map(
  (sitting) =>
    `<optgroup label="${sitting.name}">` +
    sitting.times.map((t) => `<option value="${t}">${clockLabel(t)}</option>`).join('') +
    '</optgroup>'
).join('');

const guestOptions = Array.from({ length: 10 }, (_, i) => i + 1)
  .map((n) => `<option value="${n}"${n === 2 ? ' selected' : ''}>${n}</option>`)
  .join('');

const label = (forId, text) =>
  `<label for="${forId}" style="display: block; font-size: 12.8px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; color: ${GREEN}; margin-bottom: 8px;">${text}</label>`;

const FIELD = `width: 100%; box-sizing: border-box; font-family: 'Manrope', system-ui, sans-serif; font-size: 15.2px; color: ${INK}; background: #ffffff; border: 1px solid rgba(45,53,64,0.2); border-radius: 4px; padding: 12px 14px;`;

const CARD = `
  <!-- Table reservation: overlaps the hero, matches the room booking bar -->
  <div id="v2-table-wrap" style="position: relative; z-index: 5; margin-top: -56px;">
    <div style="max-width: 1152px; margin: 0 auto; padding: 0 32px;">
      <div style="background: #ffffff; border-radius: 4px; box-shadow: 0 10px 30px rgba(45,53,64,0.15); padding: 24px 28px;">
        <!-- novalidate: native validation would block the submit event and
             report via a browser tooltip instead of the card's status line. -->
        <form id="v2-table-form" novalidate style="display: grid; grid-template-columns: 1fr 1fr 0.7fr auto; gap: 20px; align-items: end;">
          <div>
            ${label('v2-table-date', 'Date')}
            <input id="v2-table-date" name="date" type="date" style="${FIELD}">
          </div>
          <div>
            ${label('v2-table-time', 'Time')}
            <select id="v2-table-time" name="time" style="${FIELD}"><option value="">Select a time</option>${timeOptions}</select>
          </div>
          <div>
            ${label('v2-table-guests', 'Guests')}
            <select id="v2-table-guests" name="guests" style="${FIELD}">${guestOptions}</select>
          </div>
          <div>
            <button type="submit" style="display: block; width: 100%; font-family: 'Manrope', system-ui, sans-serif; font-weight: 700; font-size: 13.6px; letter-spacing: 0.14em; text-transform: uppercase; color: #ffffff; background: ${GREEN}; border: 1px solid ${GREEN}; border-radius: 4px; padding: 13px 27px; cursor: pointer;" style-hover="background: ${GREEN_DARK}; border-color: ${GREEN_DARK};">Reserve a Table</button>
          </div>
        </form>
        <p id="v2-table-status" role="status" style="margin: 16px 0 0; font-size: 14.4px; line-height: 1.6; color: ${INK}; display: none;"></p>
      </div>
    </div>
  </div>
`;

const CSS = `/* Table reservation card */
@media (max-width: 1120px) {
  #v2-table-form { grid-template-columns: repeat(3, 1fr) !important; }
  #v2-table-form > *:last-child { grid-column: 1 / -1; }
}
@media (max-width: 820px) {
  #v2-table-wrap { margin-top: 24px !important; }
  #v2-table-form { grid-template-columns: repeat(2, 1fr) !important; gap: 14px !important; }
  #v2-table-form > *:last-child { grid-column: 1 / -1; }
}
`;

const SCRIPT = `  <script>
    (function () {
      // Delegated from document: support.js re-renders the <x-dc> block
      // through React, discarding listeners bound to the original nodes.
      function el(id) { return document.getElementById(id); }
      function today() { return new Date().toISOString().slice(0, 10); }

      document.addEventListener('focusin', function (event) {
        if (event.target.id !== 'v2-table-date') return;
        el('v2-table-date').min = today();
      });

      // ---------------------------------------------------------------
      // SWAP POINT: the reservation system is still to be confirmed.
      // Once chosen, build and return their booking URL here. Return null
      // to keep showing the placeholder confirmation below the card.
      // ---------------------------------------------------------------
      function reservationUrl(details) {
        return null;
        // e.g. return 'https://reserve.example.com/book'
        //   + '?date=' + details.date
        //   + '&time=' + details.time
        //   + '&covers=' + details.guests;
      }

      function longDate(value) {
        return new Date(value + 'T00:00:00').toLocaleDateString('en-GB', {
          weekday: 'long', day: 'numeric', month: 'long'
        });
      }

      function clockTime(value) {
        var parts = value.split(':');
        var hour = Number(parts[0]);
        var suffix = hour < 12 ? 'am' : 'pm';
        return (hour > 12 ? hour - 12 : hour) + ':' + parts[1] + suffix;
      }

      document.addEventListener('submit', function (event) {
        if (!event.target || event.target.id !== 'v2-table-form') return;
        event.preventDefault();

        var status = el('v2-table-status');
        status.style.display = 'block';

        var details = {
          date: el('v2-table-date').value,
          time: el('v2-table-time').value,
          guests: Number(el('v2-table-guests').value)
        };

        if (!details.date) {
          status.textContent = 'Please choose a date for your table.';
          return;
        }
        if (details.date < today()) {
          status.textContent = 'Please choose a date from today onwards.';
          return;
        }
        if (!details.time) {
          status.textContent = 'Please choose a time for your table.';
          return;
        }

        var url = reservationUrl(details);
        if (url) {
          window.location.href = url;
          return;
        }

        status.textContent = 'Table for ' + details.guests + ', ' + longDate(details.date)
          + ' at ' + clockTime(details.time)
          + ' \\u2014 online reservations are being connected. Please call +44 17687 77208 to confirm your table.';
      });
    })();
  </script>
`;

const file = path.join(DIR, PAGE);
let html = fs.readFileSync(file, 'utf8');

if (html.includes('id="v2-table-form"')) {
  console.log(`skipped ${PAGE} (table booking already present)`);
} else {
  const heroStart = html.indexOf('data-screen-label="Hero"');
  if (heroStart === -1) throw new Error(`no hero section in ${PAGE}`);
  const after = html.indexOf('</section>', heroStart) + '</section>'.length;
  html = html.slice(0, after) + '\n' + CARD + html.slice(after);

  const styleEnd = html.indexOf('</style>', html.indexOf('<style id="v2-responsive">'));
  if (styleEnd === -1) throw new Error(`no responsive style block in ${PAGE}`);
  html = html.slice(0, styleEnd) + CSS + html.slice(styleEnd);

  html = html.replace('</body>', SCRIPT + '</body>');

  fs.writeFileSync(file, html);
  console.log(`table booking added to ${PAGE}`);
}
