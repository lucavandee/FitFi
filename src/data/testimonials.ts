export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role?: string;
  avatar?: string; // optional
};

export const TESTIMONIALS_FALLBACK: Testimonial[] = [
  {
    id: 't1',
    quote: 'De stijltest voelde spot-on en gaf meteen outfits waar ik mij goed in voel.',
    author: 'Sanne',
    role: 'Marketing',
    avatar: '/avatars/f1.webp'
  },
  {
    id: 't2',
    quote: 'Lekker duidelijk: ik snap nu waarom combinaties werken. Scheelt tijd in de ochtend.',
    author: 'Milan',
    role: 'Product',
    avatar: '/avatars/m1.webp'
  }
];