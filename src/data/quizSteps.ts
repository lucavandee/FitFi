import { QuizStep } from '../types/quiz';

// Dynamic size options based on gender
export const getSizeFieldsForGender = (gender?: string) => {
  const isFemale = gender === 'female';
  const isMale = gender === 'male';

  return [
    {
      name: 'tops',
      label: isFemale ? 'Tops (T-shirts, blouses)' : 'Tops (T-shirts, shirts)',
      options: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    {
      name: 'bottoms',
      label: isFemale ? 'Broeken/Rokken' : 'Broeken (waist)',
      options: isFemale
        ? ['32', '34', '36', '38', '40', '42', '44', '46'] // Vrouwenmaten
        : ['28', '30', '31', '32', '33', '34', '36', '38', '40'] // Mannenmaten (waist)
    },
    {
      name: 'shoes',
      label: 'Schoenen (EU)',
      options: isFemale
        ? ['35', '36', '37', '38', '39', '40', '41', '42'] // Vrouwenmaten
        : ['39', '40', '41', '42', '43', '44', '45', '46'] // Mannenmaten
    }
  ];
};

export const quizSteps: QuizStep[] = [
  {
    id: 1,
    title: 'Voor wie is deze stijlanalyse?',
    description: 'Dit helpt ons om passende kleding te adviseren',
    field: 'gender',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'male',
        label: 'Heren',
        description: 'Mannelijke stijladvies'
      },
      {
        value: 'female',
        label: 'Dames',
        description: 'Vrouwelijke stijladvies'
      },
      {
        value: 'non-binary',
        label: 'Non-binair',
        description: 'Gender-neutrale stijladvies'
      },
      {
        value: 'prefer-not-to-say',
        label: 'Zeg ik liever niet',
        description: 'We gebruiken algemene stijladvies'
      }
    ]
  },
  {
    id: 2,
    title: 'Wat zijn jouw stijlvoorkeuren?',
    description: 'Selecteer alle stijlen die je aanspreken (meerdere keuzes mogelijk)',
    field: 'stylePreferences',
    type: 'checkbox',
    required: true,
    options: [
      {
        value: 'minimalist',
        label: 'Minimalistisch',
        description: 'Clean lijnen, neutrale kleuren, eenvoud'
      },
      {
        value: 'classic',
        label: 'Klassiek',
        description: 'Tijdloze elegantie, verfijnde stukken'
      },
      {
        value: 'bohemian',
        label: 'Bohemian',
        description: 'Vrije, artistieke stijl met natuurlijke elementen'
      },
      {
        value: 'streetwear',
        label: 'Streetwear',
        description: 'Urban, trendy, casual met attitude'
      },
      {
        value: 'romantic',
        label: 'Romantisch',
        description: 'Zachte stoffen, feminine details, pasteltinten'
      },
      {
        value: 'edgy',
        label: 'Edgy',
        description: 'Stoer, rock-inspired, statement pieces'
      }
    ]
  },
  {
    id: 2,
    title: 'Welke basiskleuren draag je het liefst?',
    description: 'Kies de kleurencombinatie die het beste bij je past',
    field: 'baseColors',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'neutral',
        label: 'Neutrale tinten',
        description: 'Zwart, wit, grijs, beige, navy'
      },
      {
        value: 'earth',
        label: 'Aardse tinten',
        description: 'Bruin, camel, khaki, olijfgroen'
      },
      {
        value: 'jewel',
        label: 'Juweel tinten',
        description: 'Smaragdgroen, saffierblauw, robijnrood'
      },
      {
        value: 'pastel',
        label: 'Pastel tinten',
        description: 'Zacht roze, lichtblauw, lavendel'
      },
      {
        value: 'bold',
        label: 'Felle kleuren',
        description: 'Felrood, elektrisch blauw, neon geel'
      }
    ]
  },
  {
    id: 3,
    title: 'Wat beschrijft jouw lichaamsbouw het beste?',
    description: 'Dit helpt ons de meest flatterende pasvorm voor je te vinden',
    field: 'bodyType',
    type: 'select',
    required: true,
    options: [
      {
        value: 'pear',
        label: 'Peer vorm',
        description: 'Smallere schouders, bredere heupen'
      },
      {
        value: 'apple',
        label: 'Appel vorm',
        description: 'Bredere schouders, smaller middel'
      },
      {
        value: 'hourglass',
        label: 'Zandloper vorm',
        description: 'Gebalanceerde schouders en heupen, smaller middel'
      },
      {
        value: 'rectangle',
        label: 'Rechthoek vorm',
        description: 'Rechte lijnen, weinig taille definitie'
      },
      {
        value: 'inverted_triangle',
        label: 'Omgekeerde driehoek',
        description: 'Bredere schouders, smallere heupen'
      },
      {
        value: 'athletic',
        label: 'Atletisch',
        description: 'Gespierd, gedefinieerde lijnen'
      }
    ]
  },
  {
    id: 4,
    title: 'Voor welke gelegenheden zoek je outfits?',
    description: 'Selecteer alle gelegenheden waarvoor je stijladvies wilt',
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
      }
    ]
  },
  {
    id: 5,
    title: 'Wat is jouw budget voor kledingstukken?',
    description: 'Beweeg de slider naar je gemiddelde uitgave per item',
    field: 'budgetRange',
    type: 'slider',
    required: true,
    min: 25,
    max: 500,
    step: 25
  },
  {
    id: 6,
    title: 'Wat zijn jouw maten?',
    description: 'Dit helpt ons om producten in jouw maat te vinden',
    field: 'sizes',
    type: 'sizes',
    required: false
    // sizeFields worden dynamisch gegenereerd op basis van gender
  },
  {
    id: 7,
    title: 'Upload een selfie voor kleurenanalyse',
    description: 'Voor de beste analyse: natuurlijk licht, geen filters, frontaal gezicht',
    field: 'photoUrl',
    type: 'photo',
    required: false
  },
  {
    id: 8,
    title: 'Welke pasvorm prefereer je?',
    description: 'Kies de pasvorm die het beste bij jouw stijl past',
    field: 'fit',
    type: 'radio',
    required: true,
    options: [
      {
        value: 'slim',
        label: 'Slim fit',
        description: 'Nauw aansluitend, tailored look'
      },
      {
        value: 'regular',
        label: 'Regular fit',
        description: 'Comfortabel, klassieke pasvorm'
      },
      {
        value: 'relaxed',
        label: 'Relaxed fit',
        description: 'Losse, comfortabele pasvorm'
      },
      {
        value: 'oversized',
        label: 'Oversized',
        description: 'Ruim, streetwear stijl'
      }
    ]
  },
  {
    id: 9,
    title: 'Welke materialen spreken je aan?',
    description: 'Selecteer alle materialen die je prettig vindt (meerdere keuzes mogelijk)',
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
        label: 'Tech fabrics',
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
    id: 10,
    title: 'Wat zijn jouw stijldoelen?',
    description: 'Selecteer alle doelen die belangrijk voor je zijn',
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
  }
];