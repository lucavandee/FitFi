import { SwipeOption } from '../components/quiz/SwipeQuestion';

export interface SwipeQuestionData {
  id: string;
  question: string;
  description: string;
  options: SwipeOption[];
  multiSelect: boolean;
  category: 'style' | 'color' | 'occasion' | 'fit' | 'lifestyle';
}

export const swipeQuestions: SwipeQuestionData[] = [
  {
    id: 'style_inspiration_1',
    question: 'Welke stijl spreekt je aan?',
    description: 'Swipe rechts voor stijlen die je leuk vindt',
    multiSelect: true,
    category: 'style',
    options: [
      {
        id: 'minimalist',
        label: 'Minimalistisch',
        imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Clean lijnen, neutrale kleuren'
      },
      {
        id: 'bohemian',
        label: 'Bohemian',
        imageUrl: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Vrije, artistieke stijl'
      },
      {
        id: 'classic',
        label: 'Klassiek',
        imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Tijdloze elegantie'
      },
      {
        id: 'streetwear',
        label: 'Streetwear',
        imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Urban, trendy, casual'
      },
      {
        id: 'romantic',
        label: 'Romantisch',
        imageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Zachte stoffen, feminine details'
      }
    ]
  },
  {
    id: 'color_preferences',
    question: 'Welke kleuren trekken je aan?',
    description: 'Kies kleuren die je energie geven',
    multiSelect: true,
    category: 'color',
    options: [
      {
        id: 'neutral_tones',
        label: 'Neutrale Tinten',
        imageUrl: 'https://images.pexels.com/photos/5935748/pexels-photo-5935748.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Beige, wit, grijs, navy'
      },
      {
        id: 'earth_tones',
        label: 'Aardse Tinten',
        imageUrl: 'https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Bruin, camel, khaki'
      },
      {
        id: 'jewel_tones',
        label: 'Juweel Tinten',
        imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Smaragd, saffier, robijn'
      },
      {
        id: 'pastels',
        label: 'Pastel Tinten',
        imageUrl: 'https://images.pexels.com/photos/1021693/pexels-photo-1021693.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Zacht roze, lichtblauw'
      },
      {
        id: 'bold_colors',
        label: 'Felle Kleuren',
        imageUrl: 'https://images.pexels.com/photos/2043590/pexels-photo-2043590.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Felrood, elektrisch blauw'
      }
    ]
  },
  {
    id: 'occasion_priority',
    question: 'Voor welke gelegenheden zoek je stijladvies?',
    description: 'Selecteer je belangrijkste gelegenheden',
    multiSelect: true,
    category: 'occasion',
    options: [
      {
        id: 'work',
        label: 'Werk & Zakelijk',
        imageUrl: 'https://images.pexels.com/photos/1043474/pexels-photo-1043474.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Kantoor, meetings, professioneel'
      },
      {
        id: 'casual',
        label: 'Casual & Dagelijks',
        imageUrl: 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Weekend, vrienden, ontspannen'
      },
      {
        id: 'formal',
        label: 'Formeel & Gala',
        imageUrl: 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Bruiloften, gala, chique events'
      },
      {
        id: 'date',
        label: 'Date & Uitgaan',
        imageUrl: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Romantisch, uitgaan, sociale events'
      },
      {
        id: 'travel',
        label: 'Reizen & Vakantie',
        imageUrl: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg?auto=compress&cs=tinysrgb&w=400&h=600&dpr=2',
        description: 'Vakantie, city trips, comfort'
      }
    ]
  }
];