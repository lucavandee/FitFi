import { QuizStep } from '../types/quiz';

export const quizSteps: QuizStep[] = [
  {
    id: 1,
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
  }
];