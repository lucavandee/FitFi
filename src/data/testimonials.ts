export interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  text: string;
  rating: number;
  location?: string;
  verified?: boolean;
  sentiment?: 'positive' | 'neutral' | 'negative';
  category?: 'style' | 'service' | 'results' | 'experience';
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: 'Jordi',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    text: 'Alsof deze AI recht door mij heen keek, superwaardevol!',
    rating: 5,
    location: 'Amsterdam',
    verified: true,
    sentiment: 'positive',
    category: 'results'
  },
  {
    id: 2,
    name: 'Emma',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    text: 'Verbazingwekkend nauwkeurig! Ik begrijp mezelf ineens veel beter.',
    rating: 5,
    location: 'Utrecht',
    verified: true,
    sentiment: 'positive',
    category: 'style'
  },
  {
    id: 3,
    name: 'Lisa',
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    text: 'Nova begrijpt precies wie ik ben. Geweldig!',
    rating: 5,
    location: 'Rotterdam',
    verified: true,
    sentiment: 'positive',
    category: 'experience'
  },
  {
    id: 4,
    name: 'Thomas',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    text: 'Voor het eerst weet ik écht wat bij mij past!',
    rating: 5,
    location: 'Den Haag',
    verified: true,
    sentiment: 'positive',
    category: 'style'
  },
  {
    id: 5,
    name: 'Sophie',
    avatar: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
    text: 'De inzichten zijn zo accuraat, ik ben onder de indruk!',
    rating: 5,
    location: 'Eindhoven',
    verified: true,
    sentiment: 'positive',
    category: 'results'
  }
];

// API endpoint voor real-time testimonials
export const fetchLiveTestimonials = async (): Promise<Testimonial[]> => {
  try {
    const response = await fetch('/api/testimonials/live');
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.warn('Live testimonials unavailable, using static data');
    return TESTIMONIALS;
  }
};

export default TESTIMONIALS;