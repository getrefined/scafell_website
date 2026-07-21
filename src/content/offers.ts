export interface Offer {
  name: string;
  description: string;
}

/** Fallback offers — live data comes from the Prismic `offer` repeatable type. */
export const offers: Offer[] = [
  {
    name: 'Seasonal getaway packages',
    description: 'Escape to Borrowdale with stays shaped around the best of every season.',
  },
  {
    name: 'Midweek stay offers',
    description: 'Enjoy the quieter side of the Lakes with special midweek rates.',
  },
  {
    name: 'Walking and adventure breaks',
    description:
      'Packages made for the fells — hearty breakfasts, comfortable beds and the mountains on your doorstep.',
  },
  {
    name: 'Dining experiences',
    description: 'Stay and dine with seasonal menus celebrating the finest local ingredients.',
  },
  {
    name: 'Extended stay savings',
    description: 'The longer you stay, the more you save — ideal for a proper countryside retreat.',
  },
  {
    name: 'Special occasion packages',
    description: 'Birthdays, anniversaries and celebrations, made memorable in the heart of the Lakes.',
  },
];
