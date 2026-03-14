interface PersonalizedAdviceSectionProps {
  answers: Record<string, any>;
  archetypeName: string;
  colorProfile: {
    temperature: string;
    season: string;
    contrast: string;
    chroma: string;
  };
}

function getBodyAdvice(bodyType: string, gender: string): Array<{ label: string; detail: string }> {
  const b = bodyType.toLowerCase();
  const isMale = gender.toLowerCase().includes('man') || gender.toLowerCase().includes('male');

  if (b.includes('atletisch') || b.includes('gespierd') || b.includes('muscular')) {
    return [
      { label: 'Getailleerde fit', detail: 'Slim-fit met stretch — beweegt mee, zit niet strak' },
      { label: 'Stretch materialen', detail: 'Denim met elastaan, jersey blends — comfort én vorm' },
      { label: isMale ? 'V-halzen en open kragen' : 'Gestructureerde tops', detail: isMale ? "V-neck, polo's — accentueren je schouders" : 'Peplum tops, getailleerde blazers' },
    ];
  }

  if (b.includes('rond') || b.includes('curvy') || b.includes('volslank') || b.includes('plus')) {
    return [
      { label: 'A-lijn silhouetten', detail: 'Empire waist, A-lijn rokken — elegant en comfortabel' },
      { label: 'Gedefinieerde taille', detail: 'Wrap dresses, belted blazers, high-waist broeken' },
      { label: 'Verticale lijnen', detail: 'Lange cardigans, verticale naden, monochrome looks' },
    ];
  }

  if (b.includes('slank') || b.includes('dun') || b.includes('petite')) {
    return [
      { label: 'Slim-fit coupe', detail: 'Tailored fits zonder extra ruimte — strak maar niet krap' },
      { label: 'Gestructureerde lagen', detail: 'Blazers, vesten, jackets — creëer dimensie' },
      { label: 'Horizontale lijnen', detail: 'Stripes, color-blocking, textured fabrics' },
    ];
  }

  return [
    { label: 'Gebalanceerde proporties', detail: 'Veelzijdige silhouetten voor elke stijl en gelegenheid' },
    { label: 'Semi-fitted silhouetten', detail: 'Regular fit met taper, structured fits met bewegingsruimte' },
    { label: 'Vrij te experimenteren', detail: 'Oversized, slim, boxy — jij kunt het allemaal dragen' },
  ];
}

function getColorTips(colorProfile: PersonalizedAdviceSectionProps['colorProfile']): Array<{ label: string; detail: string }> {
  const season = colorProfile.season?.toLowerCase() || '';

  if (colorProfile.temperature === 'warm') {
    return [
      { label: 'Warme tinten als basis', detail: 'Camel, terracotta en mosterd zijn jouw best-wearers' },
      { label: 'Crèmewit boven zuiver wit', detail: 'Ivoor, off-white en beige sluiten beter aan bij je huidtoon' },
      { label: 'Goud en koper als metaal', detail: 'Warme metalen flatteren je meer dan zilver of platinum' },
    ];
  }

  if (colorProfile.temperature === 'cool' || colorProfile.temperature === 'koel') {
    return [
      { label: 'Koele tinten als basis', detail: 'Navy, grijs en rozige tinten sluiten aan bij je huidtoon' },
      { label: 'Zuiver wit boven crème', detail: 'Bright white staat je beter dan ivoor of beige' },
      { label: 'Zilver en witgoud als metaal', detail: 'Koele metalen completeren je look' },
    ];
  }

  return [
    { label: 'Warme én koele kleuren dragen', detail: 'Je neutrale ondertoon geeft je meer keuzevrijheid' },
    { label: 'Focus op intensiteit', detail: `${season ? season.charAt(0).toUpperCase() + season.slice(1) + '-tinten' : 'Gedempte tinten'} passen het best bij jou` },
    { label: 'Test in natuurlijk licht', detail: 'Houd kleur bij je gezicht voor je koopt' },
  ];
}

function getOccasionTips(occasion: string, gender: string): Array<{ label: string; detail: string }> {
  const o = occasion.toLowerCase();
  const isMale = gender.toLowerCase().includes('man') || gender.toLowerCase().includes('male');

  if (o.includes('date') || o.includes('daten') || o.includes('uitgaan') || o.includes('avond')) {
    return isMale ? [
      { label: 'Strak zwart T-shirt of henley', detail: 'Slim-fit stretch katoen als basis' },
      { label: 'Denim jacket of leren jack', detail: 'Donkere wassing of zwart leer voor edge' },
      { label: 'Donkere slim-fit jeans', detail: 'Zwart of deep indigo — strak maar comfortabel' },
    ] : [
      { label: 'Strak jurkje of top als basis', detail: 'Figuurvolgend, minimale details, maximale impact' },
      { label: 'Leder of oversized blazer', detail: 'Zwart leer of donker denim — stoer maar elegant' },
      { label: 'Statement accessoires', detail: 'Zilveren jewelry, stoere boots, kleine clutch' },
    ];
  }

  if (o.includes('kantoor') || o.includes('zakelijk') || o.includes('werk') || o.includes('business')) {
    return isMale ? [
      { label: 'Klassieke blazer', detail: 'Marine of grijs, getailleerd voor een strakke lijn' },
      { label: 'Kwaliteit overhemden', detail: 'Wit, lichtblauw of grijs — altijd professioneel' },
      { label: 'Afgewerkte schoenen', detail: 'Leren dress shoes of loafers in zwart of bruin' },
    ] : [
      { label: 'Klassieke blazer', detail: 'Marine of zwart, getailleerd voor een strakke lijn' },
      { label: 'Kwaliteit blouses', detail: 'Wit, crème of lichtblauw — altijd professioneel' },
      { label: 'Afgewerkte schoenen', detail: 'Pumps met lage hak of nette loafers' },
    ];
  }

  if (o.includes('vakantie') || o.includes('holiday') || o.includes('strand') || o.includes('reis')) {
    return [
      { label: 'Luchtige, natuurlijke stoffen', detail: 'Linnen, katoen, lyocell — ademt en voelt luxe aan' },
      { label: 'Minimale basisstukken', detail: isMale ? 'Witte linnen overhemden, neutrale shorts' : 'A-lijn jurken, losse blouses, lichte broeken' },
      { label: 'Pastelkleurige tinten', detail: 'Zacht blauw, beige, off-white — combineer vrij' },
    ];
  }

  return [
    { label: 'Capsule wardrobe', detail: 'Veelzijdige basics die met alles combineren' },
    { label: 'Kwaliteit boven kwantiteit', detail: 'Investeer in stukken die jaren meegaan' },
    { label: 'Accessoires per gelegenheid', detail: 'Pas details aan zonder de outfit te wisselen' },
  ];
}

export function PersonalizedAdviceSection({
  answers,
  archetypeName,
  colorProfile,
}: PersonalizedAdviceSectionProps) {
  const bodyType = answers?.bodyType || answers?.body_shape || 'gemiddeld';
  const occasion = answers?.occasion || 'casual';
  const gender = answers?.gender || 'unisex';

  const bodyAdvice = getBodyAdvice(bodyType, gender);
  const colorTips = getColorTips(colorProfile);
  const occasionTips = getOccasionTips(occasion, gender);

  const sections = [
    { kicker: 'Lichaamsbouw', title: 'Pasvorm & silhouet', items: bodyAdvice },
    { kicker: 'Kleuradvies', title: 'Kleuren & tinten', items: colorTips },
    { kicker: 'Gelegenheid', title: occasion.charAt(0).toUpperCase() + occasion.slice(1), items: occasionTips },
  ];

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <div
          key={section.kicker}
          className="bg-[#F5F0EB] py-12 px-8 md:px-16 border-l-4 border-[#C2654A] rounded-r-2xl"
        >
          <p className="text-xs font-semibold tracking-[1.5px] uppercase text-[#C2654A] mb-2">{section.kicker}</p>
          <h3 className="text-xl font-bold text-[#1A1A1A] mb-6">{section.title}</h3>
          <div className="space-y-5">
            {section.items.map((item, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-[#C2654A]" aria-hidden="true" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{item.label}</p>
                  <p className="text-sm text-[#4A4A4A] mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
