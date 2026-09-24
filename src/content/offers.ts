import type { ImageMetadata } from 'astro';
import offer1 from '../assets/images/v2b-offer-1.jpg';
import offer2 from '../assets/images/v2b-offer-2.jpg';
import offer3 from '../assets/images/v2b-offer-3.jpg';
import offer4 from '../assets/images/v2b-offer-4.jpg';
import offer5 from '../assets/images/v2b-offer-5.jpg';
import offer6 from '../assets/images/v2b-offer-6.jpg';

export interface Offer {
  name: string;
  description: string;
  image?: ImageMetadata;
  alt?: string;
}

/**
 * Client photography for offer cards. Prismic-sourced offers that carry no
 * image of their own rotate through these (see OfferGrid.astro).
 */
export const offerImages: ImageMetadata[] = [offer1, offer2, offer3, offer4, offer5, offer6];

/** Fallback offers — live data comes from the Prismic `offer` repeatable type. */
export const offers: Offer[] = [
  {
    name: 'Seasonal getaway packages',
    description: 'Escape to Borrowdale with stays shaped around the best of every season.',
    image: offer1,
    alt: 'Seasonal getaway packages',
  },
  {
    name: 'Midweek stay offers',
    description: 'Enjoy the quieter side of the Lakes with special midweek rates.',
    image: offer2,
    alt: 'Midweek stay offers',
  },
  {
    name: 'Walking and adventure breaks',
    description:
      'Packages made for the fells — hearty breakfasts, comfortable beds and the mountains on your doorstep.',
    image: offer3,
    alt: 'Walking and adventure breaks',
  },
  {
    name: 'Dining experiences',
    description: 'Stay and dine with seasonal menus celebrating the finest local ingredients.',
    image: offer4,
    alt: 'Dining experiences',
  },
  {
    name: 'Extended stay savings',
    description: 'The longer you stay, the more you save — ideal for a proper countryside retreat.',
    image: offer5,
    alt: 'Extended stay savings',
  },
  {
    name: 'Special occasion packages',
    description:
      'Birthdays, anniversaries and celebrations, made memorable in the heart of the Lakes.',
    image: offer6,
    alt: 'Special occasion packages',
  },
];
