#!/usr/bin/env node
/**
 * Create draft documents via the Prismic Migration API.
 * Content is the verbatim copy from Client Docs/brief.md.
 * 3-second delay between POSTs to avoid rate limiting.
 */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'docs/project-config.json'), 'utf8'));
const { repositoryName, writeToken } = config.prismic;
const LANG = 'en-us'; // verified via GET https://scafellhotel.cdn.prismic.io/api/v2

const headers = {
  Authorization: `Bearer ${writeToken}`,
  repository: repositoryName,
  'Content-Type': 'application/json',
};

const rt = (...paragraphs) => paragraphs.map((text) => ({ type: 'paragraph', text, spans: [] }));
const h2 = (text) => [{ type: 'heading2', text, spans: [] }];
const slice = (slice_type, primary) => ({ slice_type, variation: 'default', primary, items: [] });

const hero = (heading, subheading = '', cta_label = '') =>
  slice('hero_slice', { heading, subheading, cta_label });
const richText = (...paragraphs) => slice('rich_text_slice', { body: rt(...paragraphs) });
const ctaBanner = (heading, button_label, button_link) =>
  slice('cta_banner_slice', { heading, button_label, button_link });
const feature = (eyebrow, heading, body, cta_label, cta_link, layout) =>
  slice('feature_slice', {
    eyebrow,
    heading: h2(heading),
    body: rt(...body),
    cta_label,
    cta_link,
    layout,
    image: {},
  });

const documents = [
  {
    title: 'Homepage',
    type: 'homepage',
    lang: LANG,
    data: {
      slices: [
        hero(
          'Welcome to The Scafell Hotel',
          'Nestled in the heart of the Lake District, The Scafell Hotel offers a timeless countryside escape where comfort, adventure and exceptional hospitality come together.',
          'Book your stay today',
        ),
        richText(
          "With 23 beautifully appointed bedrooms, a welcoming bar and restaurant, cosy spaces to unwind and some of England's most spectacular landscapes on the doorstep, The Scafell Hotel is the perfect base for exploring the Lakes.",
          "Whether you're seeking a romantic getaway, an active walking holiday, a family break or a special celebration, you'll discover warm hospitality, locally inspired dining and breathtaking scenery at every turn.",
        ),
        feature(
          'Rooms',
          'Rest & Recharge',
          [
            "After a day spent discovering the lakes, fells and hidden corners of the National Park, there's nothing quite like returning to a comfortable room where you can truly unwind. Thoughtfully designed and full of character, our accommodation offers the perfect balance of comfort, tranquillity and authentic Lake District charm.",
          ],
          'Discover Our Rooms',
          '/rooms/',
          'normal',
        ),
        feature(
          'Restaurant',
          'Dining Worth Staying For',
          [
            'Great food has always been at the heart of the guest experience at The Scafell Hotel. From leisurely breakfasts before a day of adventure to relaxed evenings spent enjoying good company, every meal is an opportunity to savour the flavours of the region in a welcoming and atmospheric setting.',
          ],
          'Explore Dining',
          '/restaurant/',
          'flipped',
        ),
        feature(
          'Explore',
          'Adventure on Your Doorstep',
          [
            "Few locations offer such immediate access to the natural beauty of the Lake District. Step outside and you'll find inspiring walking routes, stunning viewpoints, picturesque villages and unforgettable landscapes waiting to be explored. Whether you're seeking adventure or relaxation, the perfect day out begins here.",
          ],
          'Explore the Lake District',
          '/explore/',
          'normal',
        ),
        ctaBanner(
          'Experience the beauty of the Lake District from one of its most charming hotels.',
          'Book your stay today',
          '/contact/',
        ),
      ],
    },
  },
  {
    title: 'Rooms',
    type: 'rooms',
    lang: LANG,
    data: {
      slices: [
        hero('Relax in Comfort', '', 'Book your stay today'),
        richText(
          'Our 23 individually designed bedrooms combine classic comfort with modern conveniences, creating the perfect sanctuary after a day spent exploring the fells, lakes and valleys of the Lake District.',
          'Choose from cosy doubles, spacious superior rooms and family-friendly accommodation, each thoughtfully furnished to ensure a restful stay. Many rooms offer stunning views of the surrounding countryside, allowing you to wake up immersed in the natural beauty of the Lakes.',
        ),
        slice('list_slice', {
          heading: 'Room Features',
          items: [
            { item: 'Comfortable beds with quality linens' },
            { item: 'En-suite bathrooms' },
            { item: 'Complimentary Wi-Fi' },
            { item: 'Tea and coffee-making facilities' },
            { item: 'Flat-screen televisions' },
            { item: 'Beautiful countryside views in selected rooms' },
          ],
        }),
        slice('card_grid_slice', {
          heading: 'Our Rooms',
          intro: rt(
            "Whether you're visiting for a weekend escape or an extended holiday, you'll find everything you need for a memorable stay.",
          ),
          cards: [
            {
              title: 'Family',
              description: 'Spacious rooms with space for the whole family to relax.',
              image: {},
            },
            {
              title: 'Double',
              description: 'Cosy double rooms perfect for a countryside escape for two.',
              image: {},
            },
            {
              title: 'Twin',
              description: 'Comfortable twin rooms ideal for friends or walking companions.',
              image: {},
            },
            {
              title: 'Single',
              description: 'Restful single rooms for solo travellers exploring the Lakes.',
              image: {},
            },
          ],
        }),
        ctaBanner('Relax in comfort at The Scafell Hotel.', 'Book your stay today', '/contact/'),
      ],
    },
  },
  {
    title: 'Restaurant',
    type: 'restaurant',
    lang: LANG,
    data: {
      slices: [
        hero('A Taste of the Lake District', '', 'View Menus'),
        feature(
          'Restaurant',
          'Dining at The Scafell Hotel',
          [
            'Dining at The Scafell Hotel is an experience to savour. Our restaurant celebrates the finest local ingredients, carefully crafted into seasonal dishes inspired by the surrounding landscape.',
            'Start your day with a hearty Lake District breakfast before heading out to explore, then return in the evening to enjoy expertly prepared cuisine alongside a carefully selected range of wines, local ales and spirits.',
          ],
          '',
          '',
          'normal',
        ),
        richText(
          'Fresh. Seasonal. Local.',
          'From relaxed lunches to memorable evening meals, our restaurant offers warm hospitality and exceptional flavours in a welcoming setting.',
        ),
        ctaBanner('Reserve your table during your stay', 'Book Now', '/contact/'),
      ],
    },
  },
  {
    title: 'Private Events',
    type: 'private_events',
    lang: LANG,
    data: {
      slices: [
        hero('Celebrate in the Heart of the Lakes'),
        richText(
          'From intimate family gatherings to milestone celebrations and corporate retreats, The Scafell Hotel provides a beautiful setting for memorable events.',
          "Our experienced team will work closely with you to create a bespoke experience, whether you're planning a birthday celebration, anniversary, private dining event, business meeting or special occasion.",
        ),
        slice('list_slice', {
          heading: 'Why Choose The Scafell Hotel?',
          items: [
            { item: 'Stunning Lake District location' },
            { item: 'Flexible event spaces' },
            { item: 'Bespoke catering options' },
            { item: 'Comfortable accommodation for guests' },
            { item: 'Dedicated event support' },
          ],
        }),
        ctaBanner(
          'Let us help bring your event to life.',
          'Contact our team to discuss your requirements',
          '/contact/',
        ),
      ],
    },
  },
  {
    title: 'Offers',
    type: 'offers',
    lang: LANG,
    data: {
      slices: [
        hero('Exclusive Offers at The Scafell Hotel'),
        richText(
          "Make your Lake District escape even more memorable with our latest special offers and seasonal packages. Whether you're planning a spontaneous weekend away, a walking holiday in the fells or a longer countryside retreat, our carefully curated offers provide the perfect opportunity to experience The Scafell Hotel for less.",
          "From accommodation packages and dining experiences to seasonal breaks and exclusive savings, there's always a reason to return to the Lakes.",
        ),
        richText(
          'Why Book Direct?',
          "When you book directly with The Scafell Hotel, you'll enjoy access to our best available rates, exclusive offers and the confidence of booking with our team.",
        ),
        ctaBanner(
          "Surrounded by some of the Lake District's most spectacular scenery, there's never been a better time to discover everything The Scafell Hotel has to offer.",
          'Book your stay today',
          '/contact/',
        ),
      ],
    },
  },
  {
    title: 'Explore',
    type: 'explore',
    lang: LANG,
    data: {
      slices: [
        hero('Discover the Lake District'),
        richText(
          "The Scafell Hotel sits at the gateway to some of the Lake District's most iconic landscapes and outdoor adventures.",
          'From gentle lakeside walks to challenging mountain hikes, there is something for every visitor to enjoy.',
        ),
        slice('card_grid_slice', {
          heading: 'Nearby Highlights',
          intro: rt(
            'Explore charming villages, cruise across tranquil waters, discover local history or simply take in the spectacular scenery that has inspired generations of visitors.',
          ),
          cards: [
            {
              title: 'Scafell Pike',
              description: "England's highest mountain, a rewarding climb for keen walkers.",
              image: {},
            },
            {
              title: 'Borrowdale Valley',
              description:
                "One of the Lake District's most beautiful valleys, right on the doorstep.",
              image: {},
            },
            {
              title: 'Derwentwater',
              description: 'A tranquil lake perfect for cruises, lakeside walks and picnics.',
              image: {},
            },
            {
              title: 'Keswick',
              description: 'A charming market town full of shops, cafes and local history.',
              image: {},
            },
            {
              title: 'Catbells',
              description: 'A famous fell walk with sweeping views over Derwentwater.',
              image: {},
            },
            {
              title: 'Honister Pass',
              description: 'A dramatic mountain pass home to a historic working slate mine.',
              image: {},
            },
          ],
        }),
        ctaBanner('Your Lake District adventure starts here.', 'Book your stay today', '/contact/'),
      ],
    },
  },
  {
    title: 'Gallery',
    type: 'gallery',
    lang: LANG,
    data: {
      slices: [
        hero('Discover The Scafell Hotel'),
        richText(
          'Browse our gallery and experience the charm of The Scafell Hotel before you arrive.',
          'Explore our comfortable bedrooms, inviting restaurant, beautiful surroundings and unforgettable Lake District views.',
          'Every image tells part of the story of your next escape.',
        ),
      ],
    },
  },
  {
    title: 'Contact',
    type: 'contact',
    lang: LANG,
    data: {
      slices: [
        hero("We'd Love to Hear From You"),
        richText(
          "Whether you're planning a relaxing getaway, booking a table, organising an event or simply have a question, our team is here to help.",
          'The Scafell Hotel, Lake District National Park, Rosthwaite, Keswick, CA12 5XB, United Kingdom',
          'Phone: +44 17687 77208',
          'Email: info@scafellhotel.co.uk',
          'Complete our enquiry form and a member of our team will get back to you as soon as possible.',
          'We look forward to welcoming you to The Scafell Hotel.',
        ),
      ],
    },
  },
  // Offer documents (repeatable type)
  ...[
    [
      'seasonal-getaway-packages',
      'Seasonal getaway packages',
      'Enjoy specially priced breaks that make the most of the Lake District in every season.',
    ],
    [
      'midweek-stay-offers',
      'Midweek stay offers',
      'Escape the crowds with great-value midweek stays in the heart of Borrowdale.',
    ],
    [
      'walking-and-adventure-breaks',
      'Walking and adventure breaks',
      'Breaks designed for walkers and adventurers, with hearty breakfasts to set you up for the fells.',
    ],
    [
      'dining-experiences',
      'Dining experiences',
      'Combine your stay with memorable meals in our restaurant celebrating the finest local produce.',
    ],
    [
      'extended-stay-savings',
      'Extended stay savings',
      'Stay longer and save with reduced rates on extended countryside retreats.',
    ],
    [
      'special-occasion-packages',
      'Special occasion packages',
      'Celebrate birthdays, anniversaries and milestones with a bespoke Lakeland package.',
    ],
  ].map(([uid, name, description]) => ({
    title: name,
    type: 'offer',
    uid,
    lang: LANG,
    data: { name, description },
  })),
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const [i, doc] of documents.entries()) {
  if (i > 0) await sleep(3000);
  const res = await fetch('https://migration.prismic.io/documents', {
    method: 'POST',
    headers,
    body: JSON.stringify(doc),
  });
  const body = await res.text();
  if (res.ok) {
    const id = JSON.parse(body).id;
    console.log(`${doc.type} "${doc.title}": created ${id}`);
  } else {
    console.error(`${doc.type} "${doc.title}": FAILED (${res.status}) ${body}`);
    process.exitCode = 1;
  }
}
