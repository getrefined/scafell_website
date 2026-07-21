import type { ImageMetadata } from 'astro';
import heroExplore from '../assets/images/hero-explore.jpg';
import featureExplore from '../assets/images/feature-explore.jpg';
import heroHome from '../assets/images/hero-home.jpg';
import heroRooms from '../assets/images/hero-rooms.jpg';
import heroGallery from '../assets/images/hero-gallery.jpg';
import heroContact from '../assets/images/hero-contact.jpg';

export interface Highlight {
  name: string;
  description: string;
  image: ImageMetadata;
  alt: string;
}

export const highlights: Highlight[] = [
  {
    name: 'Scafell Pike',
    description: "England's highest mountain, rising just beyond the valley.",
    image: heroExplore,
    alt: 'Mountain scenery near Scafell Pike',
  },
  {
    name: 'Borrowdale Valley',
    description: 'One of the most beautiful valleys in the Lake District, right outside the door.',
    image: featureExplore,
    alt: 'The Borrowdale Valley',
  },
  {
    name: 'Derwentwater',
    description: 'Tranquil waters, island views and lakeside walks a short drive away.',
    image: heroHome,
    alt: 'Derwentwater lake',
  },
  {
    name: 'Keswick',
    description: 'A charming market town full of independent shops, cafés and local history.',
    image: heroRooms,
    alt: 'The market town of Keswick',
  },
  {
    name: 'Catbells',
    description: 'A famously rewarding fell walk with spectacular views over the lake.',
    image: heroGallery,
    alt: 'The Catbells ridge',
  },
  {
    name: 'Honister Pass',
    description: 'A dramatic mountain pass and slate mine at the head of the valley.',
    image: heroContact,
    alt: 'The Honister Pass',
  },
];
