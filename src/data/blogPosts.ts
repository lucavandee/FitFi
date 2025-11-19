export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  category: string;
  tags: string[];
  image: string;
  readTime: number;
  featured?: boolean;
}

export const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'De Perfecte Capsule Wardrobe: Minder is Meer',
    excerpt: 'Ontdek hoe je met slechts 30 kledingstukken eindeloze outfit combinaties kunt maken.',
    content: 'Een capsule wardrobe is de sleutel tot een stressvrije ochtend en een duurzame kledingkast...',
    author: 'Emma van der Berg',
    date: '2024-01-15',
    category: 'Stijltips',
    tags: ['capsule wardrobe', 'minimalisme', 'duurzaamheid'],
    image: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg',
    readTime: 5,
    featured: true
  },
  {
    id: '2',
    title: 'Kleurencombinaties die Altijd Werken',
    excerpt: 'Leer welke kleuren perfect bij elkaar passen en hoe je ze kunt combineren.',
    content: 'Kleur is een van de krachtigste tools in mode. Met de juiste combinaties...',
    author: 'Lisa Janssen',
    date: '2024-01-12',
    category: 'Kleuradvies',
    tags: ['kleuren', 'combinaties', 'stijl'],
    image: 'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg',
    readTime: 4
  },
  {
    id: '3',
    title: 'Seizoenstrends 2024: Wat is Hot?',
    excerpt: 'De belangrijkste trends voor dit seizoen en hoe je ze draagt.',
    content: 'Dit seizoen draait alles om comfort en expressie. Van oversized blazers...',
    author: 'Sophie de Wit',
    date: '2024-01-10',
    category: 'Trends',
    tags: ['trends', '2024', 'seizoen'],
    image: 'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg',
    readTime: 6
  },
  {
    id: '4',
    title: 'Duurzame Mode: Bewuste Keuzes Maken',
    excerpt: 'Hoe je stijlvol kunt zijn terwijl je de planeet beschermt.',
    content: 'Duurzame mode gaat verder dan alleen biologische materialen...',
    author: 'Anna Bakker',
    date: '2024-01-08',
    category: 'Duurzaamheid',
    tags: ['duurzaamheid', 'ethisch', 'bewust'],
    image: 'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg',
    readTime: 7
  },
  {
    id: '5',
    title: 'Van Dag naar Avond: Transitie Outfits',
    excerpt: 'Simpele trucs om je dag-outfit om te toveren tot een avondlook.',
    content: 'Met een paar slimme aanpassingen verbeter je elke dag-outfit...',
    author: 'Mara Visser',
    date: '2024-01-05',
    category: 'Stijltips',
    tags: ['transitie', 'dag naar avond', 'praktisch'],
    image: 'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg',
    readTime: 5
  },
  {
    id: '6',
    title: 'Accessoires: De Finishing Touch',
    excerpt: 'Hoe accessoires je outfit naar een hoger niveau tillen.',
    content: 'Accessoires zijn de geheime wapens van elke stijlvolle vrouw...',
    author: 'Julia Smit',
    date: '2024-01-03',
    category: 'Accessoires',
    tags: ['accessoires', 'sieraden', 'tassen'],
    image: 'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg',
    readTime: 4
  }
];

export const categories = [
  'Alle',
  'Stijltips',
  'Kleuradvies', 
  'Trends',
  'Duurzaamheid',
  'Accessoires'
];