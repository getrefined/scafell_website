import type { ImageMetadata } from 'astro';
import family from '../assets/images/room-family.jpg';
import double from '../assets/images/room-double.jpg';
import twin from '../assets/images/room-twin.jpg';
import single from '../assets/images/room-single.jpg';

export interface Room {
  name: string;
  description: string;
  image: ImageMetadata;
  alt: string;
}

export const rooms: Room[] = [
  {
    name: 'Family',
    description:
      'Spacious, flexible rooms with space for everyone — the perfect base for a Lake District adventure together.',
    image: family,
    alt: 'A spacious family bedroom at The Scafell Hotel',
  },
  {
    name: 'Double',
    description:
      'Cosy and characterful doubles, ideal for a romantic escape or a restful night after a day on the fells.',
    image: double,
    alt: 'A cosy double bedroom at The Scafell Hotel',
  },
  {
    name: 'Twin',
    description:
      'Comfortable twin rooms, well suited to walking companions and friends exploring the Lakes together.',
    image: twin,
    alt: 'A comfortable twin bedroom at The Scafell Hotel',
  },
  {
    name: 'Single',
    description:
      'Snug, thoughtfully furnished single rooms for the solo traveller discovering Borrowdale.',
    image: single,
    alt: 'A snug single bedroom at The Scafell Hotel',
  },
];
