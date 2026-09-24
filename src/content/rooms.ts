import type { ImageMetadata } from 'astro';
import family from '../assets/images/v2b-room-family.jpg';
import double from '../assets/images/v2b-room-double.jpg';
import twin from '../assets/images/v2b-room-twin.jpg';
import single from '../assets/images/v2b-room-single.jpg';
import selfCatering from '../assets/images/v2b-room-self-catering.jpg';

export interface Room {
  name: string;
  /** Small uppercase label above the heading, e.g. "Sleeps 2 · Double bed". */
  eyebrow: string;
  sleeps: number;
  description: string;
  /** Short feature pills shown under the description. */
  features: string[];
  image: ImageMetadata;
  alt: string;
  /** Booking button label; defaults to "Book This Room →". */
  ctaLabel?: string;
}

export const rooms: Room[] = [
  {
    name: 'Family',
    eyebrow: 'Sleeps 4',
    sleeps: 4,
    description:
      'Spacious, flexible rooms with space for everyone — the perfect base for a Lake District adventure together. Generous layouts give families room to spread out, with flexible bedding arrangements to suit children of all ages.',
    features: ['Flexible bedding', 'En-suite bathroom', 'Tea & coffee facilities'],
    image: family,
    alt: 'A spacious family bedroom at The Scafell Hotel',
  },
  {
    name: 'Double',
    eyebrow: 'Sleeps 2 · Double bed',
    sleeps: 2,
    description:
      'Cosy and characterful doubles, ideal for a romantic escape or a restful night after a day on the fells. Each double is individually furnished, pairing classic Lakeland character with quality linens and modern comforts.',
    features: ['Quality linens', 'En-suite bathroom', 'Countryside views*'],
    image: double,
    alt: 'A cosy double bedroom at The Scafell Hotel',
  },
  {
    name: 'Twin',
    eyebrow: 'Sleeps 2 · Twin beds',
    sleeps: 2,
    description:
      "Comfortable twin rooms, well suited to walking companions and friends exploring the Lakes together. Two full-size beds, plenty of storage for boots and kit, and everything you need to recharge for the next day's route.",
    features: ['Two full-size beds', 'En-suite bathroom', 'Complimentary Wi-Fi'],
    image: twin,
    alt: 'A comfortable twin bedroom at The Scafell Hotel',
  },
  {
    name: 'Single',
    eyebrow: 'Sleeps 1 · Single bed',
    sleeps: 1,
    description:
      "Snug, thoughtfully furnished single rooms for the solo traveller discovering Borrowdale. Everything within reach, nothing you don't need — an ideal base for solo walkers and quiet escapes.",
    features: ['Thoughtfully furnished', 'En-suite bathroom', 'Flat-screen TV'],
    image: single,
    alt: 'A snug single bedroom at The Scafell Hotel',
  },
  {
    name: 'Self-Catering',
    eyebrow: 'Sleeps 4',
    sleeps: 4,
    description:
      "Enjoy the freedom to explore the Lake District at your own pace from the comfort of our self-catering accommodation. With a fully equipped kitchen, comfortable living space, and everything you need for a relaxing stay, it's the perfect choice for families, couples or longer breaks.",
    features: [
      'Fully equipped kitchen',
      'Comfortable living and dining area',
      'En-suite bathroom',
      'Flat-screen TV',
    ],
    image: selfCatering,
    alt: 'The fully equipped kitchen in the self-catering accommodation at The Scafell Hotel',
    ctaLabel: 'Book Self-Catering →',
  },
];
