import { QuizStep } from '../types/quiz';

export const getStyleOptionsForGender = (gender?: string) => {
  const isFemale = gender === 'female';
  const isMale = gender === 'male';

  const sharedOptions = [
    {
      value: 'minimalist',
      label: 'Minimalistisch',
      description: 'Clean lijnen, neutrale kleuren, eenvoud'
    },
    {
      value: 'classic',
      label: 'Klassiek',
      description: isMale
        ? 'Tijdloze elegantie, gedegen kwaliteit, verfijnde basis'
        : 'Tijdloze elegantie, verfijnde stukken'
    },
    {
      value: 'business',
      label: 'Zakelijk / Business',
      description: 'Pakken, blazers en nette kleding voor kantoor en formele momenten'
    },
    {
      value: 'streetwear',
      label: 'Urban/Streetwear',
      description: isMale
        ? 'Moderne streetstyle met sneakers, hoodies en statement pieces'
        : 'Moderne, comfortabele stijl met sneakers en hoodies'
    }
  ];

  const femaleOptions = [
    {
      value: 'smart-casual',
      label: 'Smart Casual',
      description: 'Verzorgd en relaxed: blazers, nette broeken, loafers'
    },
    {
      value: 'casual',
      label: 'Casual / Alledaags',
      description: 'Comfortabele, ontspannen stijl voor dagelijks gebruik'
    },
    {
      value: 'bohemian',
      label: 'Bohemien',
      description: 'Vrije, artistieke stijl met natuurlijke elementen en lagen'
    },
    {
      value: 'romantic',
      label: 'Romantisch',
      description: 'Zachte stoffen, vrouwelijke details, pasteltinten'
    },
    {
      value: 'edgy',
      label: 'Stoer (Edgy)',
      description: 'Rock-geïnspireerd met leer, jeans en statement-stukken'
    }
  ];

  const maleOptions = [
    {
      value: 'smart-casual',
      label: 'Smart Casual',
      description: "Verzorgd en relaxed: chino's, polo's, loafers"
    },
    {
      value: 'athletic',
      label: 'Sportief/Athletic',
      description: 'Sportieve esthetiek, functioneel, comfortabel'
    },
    {
      value: 'rugged',
      label: 'Stoer/Rugged',
      description: 'Robuuste materialen, outdoor-geïnspireerd, mannelijk'
    },
    {
      value: 'edgy',
      label: 'Stoer (Edgy)',
      description: 'Rock-geïnspireerd met leer, denim en statement-stukken'
    },
    {
      value: 'avant-garde',
      label: 'Experimenteel / Avant-garde',
      description: 'Oversized silhouetten, donker palet, designer-merken'
    }
  ];

  const neutralOptions = [
    {
      value: 'bohemian',
      label: 'Bohemien/Vrij',
      description: 'Artistieke, vrije stijl met natuurlijke elementen'
    },
    {
      value: 'edgy',
      label: 'Stoer/Edgy',
      description: 'Statement pieces, leer, rock-geïnspireerd'
    },
    {
      value: 'androgynous',
      label: 'Androgyn',
      description: 'Gender-fluïde stijl, oversized fits, neutrale kleuren'
    }
  ];

  if (isMale) {
    return [...sharedOptions, ...maleOptions];
  } else if (isFemale) {
    return [...sharedOptions, ...femaleOptions];
  } else {
    return [...sharedOptions, ...neutralOptions];
  }
};

export const getSizeFieldsForGender = (gender?: string) => {
  const isFemale = gender === 'female';
  const isMale = gender === 'male';

  return [
    {
      name: 'tops',
      label: isFemale ? 'Tops (T-shirts, blouses)' : 'Tops (T-shirts, shirts)',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
      helperText: 'US conversie: XS=2-4, S=6-8, M=10-12, L=14-16, XL=18-20'
    },
    {
      name: 'bottoms',
      label: isFemale ? 'Broeken/Rokken' : 'Broeken (waist)',
      options: isFemale
        ? ['32', '34', '36', '38', '40', '42', '44', '46']
        : ['28', '30', '31', '32', '33', '34', '36', '38', '40'],
      helperText: isFemale
        ? 'US conversie: 32=2, 34=4, 36=6, 38=8, 40=10, 42=12'
        : 'Inch waist maat (US/EU standaard)'
    },
    {
      name: 'shoes',
      label: 'Schoenen (EU)',
      options: isFemale
        ? ['35', '36', '37', '38', '39', '40', '41', '42']
        : ['39', '40', '41', '42', '43', '44', '45', '46'],
      helperText: isFemale
        ? 'US conversie: EU 36=US 6, 37=7, 38=7.5, 39=8, 40=8.5'
        : 'US conversie: EU 41=US 8, 42=8.5, 43=9.5, 44=10'
    }
  ];
};

export const quizSteps: QuizStep[] = [
  {
    id: 1,
    title: 'Zoek je kleding voor heren of dames?',
    description: 'Kies wat jij graag draagt. Dit is geen kleuranalyse.',
    field: 'gender',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'female',
        label: 'Dames',
        description: 'Ik zoek dameskleding en stijladvies'
      },
      {
        value: 'male',
        label: 'Heren',
        description: 'Ik zoek herenkleding en stijladvies'
      },
      {
        value: 'non-binary',
        label: 'Beide/Anders',
        description: 'Toon me gender-neutrale opties'
      },
      {
        value: 'prefer-not-to-say',
        label: 'Liever niet specificeren',
        description: 'Toon algemene stijlopties'
      }
    ]
  },
  {
    id: 2,
    title: 'Welke stijlen spreken jou aan?',
    description: 'Kies wat jij graag draagt. Meerdere keuzes zijn prima.',
    field: 'stylePreferences',
    type: 'checkbox',
    required: true,
    options: []
  },
  {
    id: 3,
    title: 'Welke kleuren draag jij het liefst?',
    description: 'Dit gaat over wat jij graag draagt — niet over je huidskleur of ondertoon.',
    field: 'neutrals',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'warm',
        label: 'Warme tinten',
        description: 'Beige, camel, olijfgroen, terracotta, bruin'
      },
      {
        value: 'koel',
        label: 'Koele tinten',
        description: 'Grijs, navy, ijsblauw, donkergroen, wit'
      },
      {
        value: 'neutraal',
        label: 'Neutraal / Mix',
        description: 'Zwart, wit, grijs — of een combinatie van warm en koel'
      }
    ]
  },
  {
    id: 4,
    title: 'Hoe licht of donker kleed je je?',
    description: 'We gebruiken je antwoorden om combinaties te maken die logisch zijn.',
    field: 'lightness',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'licht',
        label: 'Licht',
        description: 'Cremewit, ivoor, lichtgrijs, pasteltinten'
      },
      {
        value: 'medium',
        label: 'Middenweg',
        description: 'Mix van licht en donker, veel "echte" kleuren'
      },
      {
        value: 'donker',
        label: 'Donker',
        description: 'Zwart, donkerblauw, bordeaux, donkerbruin'
      }
    ]
  },
  {
    id: 5,
    title: 'Hoe combineer je kleur en contrast?',
    description: 'We gebruiken je antwoorden om combinaties te maken die logisch zijn.',
    field: 'contrast',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'laag',
        label: 'Tonal — alles in dezelfde tint',
        description: 'Bijv. beige top + crème broek + camel schoenen'
      },
      {
        value: 'medium',
        label: 'Licht tot medium contrast',
        description: 'Lichte top met iets donkerdere broek'
      },
      {
        value: 'hoog',
        label: 'Sterk contrast',
        description: 'Bijv. zwarte jas op wit overhemd'
      }
    ]
  },
  {
    id: 6,
    title: 'Welke pasvorm prefereer je?',
    description: 'We gebruiken je antwoorden om combinaties te maken die logisch zijn.',
    field: 'fit',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'slim',
        label: 'Nauwsluitend',
        description: 'Tailored, strak op maat (slim fit)'
      },
      {
        value: 'regular',
        label: 'Normaal',
        description: 'Comfortabel, klassieke pasvorm (regular fit)'
      },
      {
        value: 'relaxed',
        label: 'Losser',
        description: 'Ruime, comfortabele pasvorm (relaxed fit)'
      },
      {
        value: 'oversized',
        label: 'Oversized',
        description: 'Extra ruim, moderne stijl'
      }
    ]
  },
  {
    id: 7,
    title: 'Voor welke gelegenheden zoek je outfits?',
    description: 'We gebruiken je antwoorden om combinaties te maken die logisch zijn.',
    field: 'occasions',
    type: 'multiselect',
    required: true,
    options: [
      {
        value: 'work',
        label: 'Werk',
        description: 'Kantoor, meetings, professionele events'
      },
      {
        value: 'casual',
        label: 'Casual',
        description: 'Dagelijks, weekend, vrienden ontmoeten'
      },
      {
        value: 'formal',
        label: 'Formeel',
        description: 'Gala, bruiloften, chique evenementen'
      },
      {
        value: 'date',
        label: 'Date night',
        description: 'Romantische diners, uitgaan met partner'
      },
      {
        value: 'travel',
        label: 'Reizen',
        description: 'Vakantie, city trips, comfortabel onderweg'
      },
      {
        value: 'sport',
        label: 'Sport & Actief',
        description: 'Gym, yoga, outdoor activiteiten'
      },
      {
        value: 'party',
        label: 'Uitgaan / Feest',
        description: 'Stappen, festivals, feestjes'
      }
    ]
  },
  {
    id: 8,
    title: 'Wat zijn jouw stijldoelen?',
    description: 'Kies wat jij graag draagt. Je kunt straks altijd terug en aanpassen.',
    field: 'goals',
    type: 'multiselect',
    required: true,
    options: [
      {
        value: 'timeless',
        label: 'Tijdloze garderobe',
        description: 'Klassieke stukken die jaren meegaan'
      },
      {
        value: 'trendy',
        label: 'On-trend blijven',
        description: 'Laatste fashion trends volgen'
      },
      {
        value: 'minimal',
        label: 'Minimalistisch',
        description: 'Minder is meer, clean aesthetic'
      },
      {
        value: 'express',
        label: 'Mezelf uitdrukken',
        description: 'Unieke statement pieces, persoonlijke stijl'
      },
      {
        value: 'professional',
        label: 'Professioneel ogen',
        description: 'Werk en carrière focus'
      },
      {
        value: 'comfort',
        label: 'Comfort prioriteit',
        description: 'Prettig dragen boven alles'
      }
    ]
  },
  {
    id: 9,
    title: 'Welke prints en patronen prefereer je?',
    description: 'Je kunt straks altijd terug en aanpassen.',
    field: 'prints',
    type: 'radio',
    required: false,
    options: [
      {
        value: 'effen',
        label: 'Effen/Uni',
        description: 'Geen prints, clean en minimaal'
      },
      {
        value: 'subtiel',
        label: 'Subtiele prints',
        description: 'Kleine patronen, strepen, dots'
      },
      {
        value: 'statement',
        label: 'Statement prints',
        description: 'Opvallende patronen, bold designs'
      },
      {
        value: 'gemengd',
        label: 'Mix van alles',
        description: 'Variatie in prints en patronen'
      }
    ]
  },
  {
    id: 10,
    title: 'Welke materialen spreken je aan?',
    description: 'Kies wat jij graag draagt. Meerdere keuzes zijn prima.',
    field: 'materials',
    type: 'checkbox',
    required: false,
    options: [
      {
        value: 'katoen',
        label: 'Katoen',
        description: 'Natuurlijk, ademend, comfortabel'
      },
      {
        value: 'wol',
        label: 'Wol',
        description: 'Warm, luxe, duurzaam'
      },
      {
        value: 'denim',
        label: 'Denim',
        description: 'Casual, robuust, tijdloos'
      },
      {
        value: 'fleece',
        label: 'Fleece',
        description: 'Zacht, sportief, warm'
      },
      {
        value: 'tech',
        label: 'Technische stoffen',
        description: 'Performance, waterafstotend, modern'
      },
      {
        value: 'linnen',
        label: 'Linnen',
        description: 'Luchtig, zomers, natuurlijk'
      }
    ]
  },
  {
    id: 11,
    title: 'Welke merken spreken jou aan?',
    description: 'Optioneel — kies merken die je leuk vindt. Dit helpt ons relevantere aanbevelingen te tonen.',
    field: 'brandPreferences',
    type: 'multiselect',
    required: false,
    options: [
      { value: '& other stories', label: '& Other Stories' },
      { value: 'acne studios', label: 'Acne Studios' },
      { value: 'adidas', label: 'Adidas' },
      { value: 'arket', label: 'Arket' },
      { value: 'asics', label: 'Asics' },
      { value: 'brooks brothers', label: 'Brooks Brothers' },
      { value: 'carhartt wip', label: 'Carhartt WIP' },
      { value: 'cos', label: 'COS' },
      { value: 'filippa k', label: 'Filippa K' },
      { value: 'gant', label: 'Gant' },
      { value: 'h&m', label: 'H&M' },
      { value: 'hugo boss', label: 'Hugo Boss' },
      { value: 'lemaire', label: 'Lemaire' },
      { value: 'maison margiela', label: 'Maison Margiela' },
      { value: 'massimo dutti', label: 'Massimo Dutti' },
      { value: 'new balance', label: 'New Balance' },
      { value: 'nike', label: 'Nike' },
      { value: 'our legacy', label: 'Our Legacy' },
      { value: 'ralph lauren', label: 'Ralph Lauren' },
      { value: 'reiss', label: 'Reiss' },
      { value: 'rick owens', label: 'Rick Owens' },
      { value: 'sandro', label: 'Sandro' },
      { value: 'scotch & soda', label: 'Scotch & Soda' },
      { value: 'stone island', label: 'Stone Island' },
      { value: 'stüssy', label: 'Stüssy' },
      { value: 'suitsupply', label: 'Suitsupply' },
      { value: 'ted baker', label: 'Ted Baker' },
      { value: 'the north face', label: 'The North Face' },
      { value: 'tommy hilfiger', label: 'Tommy Hilfiger' },
      { value: 'under armour', label: 'Under Armour' },
      { value: 'zara', label: 'Zara' }
    ],
    helperText: 'Je kunt deze stap overslaan als je geen voorkeur hebt'
  },
  {
    id: 12,
    title: 'Wat is jouw budget per kledingstuk?',
    description: 'Geef aan binnen welke prijsklasse je zoekt. We tonen producten die passen bij jouw range.',
    field: 'budget',
    type: 'budget-range',
    required: true,
    min: 0,
    max: 500,
    step: 25,
    helperText: '€25-75: Budget | €75-150: Middensegment | €150+: Premium'
  },
  {
    id: 13,
    title: 'Wat zijn jouw maten?',
    description: 'Je kunt straks altijd terug en aanpassen.',
    field: 'sizes',
    type: 'sizes',
    required: false,
    helperText: 'Niet zeker? Kies wat je meestal draagt — je kunt dit later aanpassen'
  },
  {
    id: 14,
    title: 'Upload een selfie voor kleurenanalyse',
    description: 'Optioneel. Foto in natuurlijk licht, geen filters. Je kunt deze stap altijd overslaan.',
    field: 'photoUrl',
    type: 'photo',
    required: false
  }
];
