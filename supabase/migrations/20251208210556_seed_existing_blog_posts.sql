/*
  # Seed Existing Blog Posts

  ## Overview
  Migreer de bestaande hardcoded blog posts uit `src/data/blogPosts.ts` naar de database.
  
  ## Changes
  - Insert 6 bestaande blog posts als published content
  - Gebruik realistische data met Pexels images
  - Set alle posts op 'published' status met published_at timestamp
  - Mark als ai_generated = false (handmatig geschreven)
*/

-- Insert bestaande blog posts
INSERT INTO blog_posts (
  slug,
  title,
  excerpt,
  content,
  author_name,
  author_bio,
  published_at,
  category,
  tags,
  featured_image_url,
  read_time_minutes,
  status,
  ai_generated,
  featured
) VALUES
(
  'capsule-wardrobe-minder-is-meer',
  'De Perfecte Capsule Wardrobe: Minder is Meer',
  'Ontdek hoe je met slechts 30 kledingstukken eindeloze outfit combinaties kunt maken.',
  E'# De Perfecte Capsule Wardrobe: Minder is Meer\n\nEen capsule wardrobe is de sleutel tot een stressvrije ochtend en een duurzame kledingkast. Het concept is simpel maar krachtig: beperk je garderobe tot een kleine collectie veelzijdige kledingstukken die je graag draagt en die goed met elkaar combineren.\n\n## Wat is een Capsule Wardrobe?\n\nEen capsule wardrobe bestaat uit ongeveer 30-40 tijdloze kledingstukken die je het hele seizoen kunt dragen. Door bewust te kiezen voor kwaliteit boven kwantiteit, creëer je een kledingkast waarin alles met elkaar werkt.\n\n## De Voordelen\n\n- **Tijdsbesparing**: Geen eindeloos zoeken meer naar wat je aan moet\n- **Duurzaamheid**: Minder maar betere kwaliteit betekent minder afval\n- **Stijlzekerheid**: Alles past bij elkaar, dus geen fashion fails\n- **Financiële vrijheid**: Investeer in tijdloze stukken in plaats van fast fashion\n\n## Hoe Begin Je?\n\n1. **Inventariseer je huidige kledingkast**: Haal alles eruit en maak drie stapels: houden, twijfel, weggeven\n2. **Kies je kleurenpalet**: Selecteer 3-4 basiskleuren die goed bij elkaar passen\n3. **Identificeer je essentials**: Denk aan een perfecte spijkerbroek, wit overhemd, zwarte blazer\n4. **Vul aan met statement pieces**: 2-3 items die je persoonlijkheid laten zien\n\n## Essential Items voor een Capsule Wardrobe\n\n- 2-3 perfecte jeans (donker, licht, zwart)\n- 5-7 tops (wit overhemd, neutrale t-shirts, elegant blouse)\n- 2-3 blazers of cardigans\n- 1 little black dress\n- 2 paar schoenen (sneakers, hakken/loafers)\n- 1 perfecte winterjas\n\n## Tips voor Succes\n\n**Denk in outfits, niet in items**: Wanneer je iets nieuws koopt, vraag jezelf af: "Kan ik hier minstens 3 outfits mee maken met wat ik al heb?"\n\n**Kies voor kwaliteit**: Eén goed basic t-shirt van €40 gaat 5x langer mee dan 5 fast fashion shirts van €8.\n\n**Pas het aan per seizoen**: Je hoeft niet het hele jaar met dezelfde 30 items te doen. Roteer 20% van je kledingkast per seizoen.\n\n## Ontdek Jouw Perfecte Capsule\n\nWil je weten welke items perfect bij jouw stijl passen? Doe onze gratis stijlquiz en ontvang een gepersonaliseerd advies voor jouw ideale capsule wardrobe.',
  'Emma van der Berg',
  'Stijlexpert gespecialiseerd in minimalistische mode en duurzame garderobes.',
  '2024-01-15 10:00:00+00',
  'Stijltips',
  ARRAY['capsule wardrobe', 'minimalisme', 'duurzaamheid', 'garderobe', 'basics'],
  'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=1200',
  5,
  'published',
  false,
  true
),
(
  'kleurencombinaties-die-altijd-werken',
  'Kleurencombinaties die Altijd Werken',
  'Leer welke kleuren perfect bij elkaar passen en hoe je ze kunt combineren voor een stijlvolle look.',
  E'# Kleurencombinaties die Altijd Werken\n\nKleur is een van de krachtigste tools in mode. Met de juiste combinaties kun je je humeur uitdrukken, je teint laten stralen en een blijvende indruk maken.\n\n## De Kleurentheorie Basis\n\nVoordat we in specifieke combinaties duiken, is het handig om de basis van kleurtheorie te begrijpen:\n\n- **Complementaire kleuren**: Staan tegenover elkaar op de kleurencirkel (bijv. blauw en oranje)\n- **Analoge kleuren**: Liggen naast elkaar op de kleurencirkel (bijv. blauw, blauwgroen, groen)\n- **Triadische kleuren**: Drie kleuren op gelijke afstand op de kleurencirkel\n\n## Tijdloze Kleurencombinaties\n\n### 1. Navy & Camel\nDeze klassieke combinatie straalt elegantie uit. Perfect voor zakelijke settings of een chique dagelijkse look.\n\n### 2. Zwart & Wit\nDe ultieme tijdloze combinatie. Voeg een pop kleur toe via accessoires voor extra impact.\n\n### 3. Grijs & Roze\nZacht, modern en vrouwelijk zonder overdreven sweet te zijn. Kies voor dusty rose voor een mature look.\n\n### 4. Beige & Burgundy\nWarm, rijk en perfect voor herfst/winter. Deze combinatie werkt zowel casual als dressy.\n\n### 5. Wit & Denim\nFris, schoon en moeiteloos cool. De go-to voor een relaxed weekend look.\n\n## Kleuren voor Jouw Huidskleur\n\n### Koele Ondertoon\nBest: blauw, groen, paars, roze, zilvergrijs\nVermijd: warme oranje, goudgeel\n\n### Warme Ondertoon\nBest: oranje, rood, geel, goud, olijfgroen, warm bruin\nVermijd: ijzige pastels, felle neon\n\n### Neutrale Ondertoon\nGeluksvogel! Bijna alles staat je goed. Experimenteer vrijuit.\n\n## De 60-30-10 Regel\n\nEen professionele stylingtruc:\n- **60%** Dominant kleur (bijv. je broek en blouse)\n- **30%** Secundaire kleur (bijv. je blazer)\n- **10%** Accent kleur (bijv. je tas of sieraden)\n\n## Kleurpsychologie\n\n- **Rood**: Kracht, passie, zelfvertrouwen\n- **Blauw**: Trust, rust, professionaliteit\n- **Geel**: Energie, creativiteit, optimisme\n- **Groen**: Balans, groei, harmonie\n- **Zwart**: Elegantie, autoriteit, mysterie\n- **Wit**: Zuiverheid, eenvoud, frisheid\n\n## Ontdek Jouw Perfecte Kleuren\n\nWil je weten welke kleuren jouw natuurlijke schoonheid het beste laten uitkomen? Onze AI stijlanalyse helpt je jouw persoonlijke kleurenpalet te ontdekken.',
  'Lisa Janssen',
  'Kleurconsultant met 10 jaar ervaring in personal styling en fashion design.',
  '2024-01-12 14:30:00+00',
  'Kleuradvies',
  ARRAY['kleuren', 'combinaties', 'stijl', 'kleurtheorie', 'mode'],
  'https://images.pexels.com/photos/1536619/pexels-photo-1536619.jpeg?auto=compress&cs=tinysrgb&w=1200',
  4,
  'published',
  false,
  false
),
(
  'seizoenstrends-2024',
  'Seizoenstrends 2024: Wat is Hot?',
  'De belangrijkste trends voor dit seizoen en hoe je ze draagt zonder je stijl te verliezen.',
  E'# Seizoenstrends 2024: Wat is Hot?\n\nDit seizoen draait alles om comfort en expressie. Van oversized blazers tot maximalist accessoires, hier zijn de trends die je moet kennen.\n\n## Top 10 Trends voor 2024\n\n### 1. Oversized Blazers\nDe powersuit krijgt een relaxed update. Draag hem oversize met cycling shorts of over een maxi dress.\n\n### 2. Dopamine Dressing\nFelle, vrolijke kleuren die je humeur boosten. Denk aan kobaltblauw, zonnig geel en energiek oranje.\n\n### 3. Cut-Out Details\nStrategische cut-outs op onverwachte plekken. Subtiel maar impactvol.\n\n### 4. Maxi Everything\nVan rokken tot jassen, langer is beter dit seizoen. Creëert een elegant silhouet.\n\n### 5. Metallic Accents\nZilver en goud voor dag én avond. Mix metalen vrijuit.\n\n### 6. Cargo Revival\nUtility pockets zijn terug, maar dan chic. Cargo broeken in luxe fabricaten.\n\n### 7. Sheer Layers\nTransparante lagen voor een romantische, ethereal look. Layer over slips of bodysuits.\n\n### 8. Statement Collars\nVan peter pan tot oversized, de focus ligt op de hals.\n\n### 9. Monochrome Sets\nMatching sets in één kleur. Moeiteloos chic en altijd geslaagd.\n\n### 10. Sustainable Luxury\nVintage en tweedehands is het nieuwe premium. Bewuste keuzes zijn trendy.\n\n## Hoe Draag Je Trends Zonder Je Stijl te Verliezen?\n\n### Regel 1: Kies Selectief\nJe hoeft niet elke trend te volgen. Kies 2-3 trends die bij je passen.\n\n### Regel 2: Mix met Basics\nEen trendy piece + tijdloze basics = gebalanceerde look.\n\n### Regel 3: Pas Aan Naar Jouw Comfort\nAls je niet comfortabel bent in crop tops, probeer dan cut-outs in plaats daarvan.\n\n## Tijdloze Alternatieven\n\nNiet elke trend is voor altijd. Investeer in tijdloze varianten:\n\n- **In plaats van**: Ultra low-rise jeans\n- **Kies**: Mid-rise met rechte pijp\n\n- **In plaats van**: Extreme oversized\n- **Kies**: Relaxed fit met structuur\n\n- **In plaats van**: Alle neon tegelijk\n- **Kies**: Eén statement neon piece\n\n## Trends die Blijven\n\nSommige "trends" evolueren tot staples:\n- Sneakers met alles\n- Athleisure elementen\n- Gender-neutrale mode\n- Duurzaamheid als prioriteit\n\n## Ontdek Welke Trends Bij Jou Passen\n\nDoe onze stijlquiz om te ontdekken welke 2024 trends perfect aansluiten bij jouw persoonlijke stijl en lifestyle.',
  'Sophie de Wit',
  'Trend forecaster en fashion journalist met focus op wearable trends.',
  '2024-01-10 09:00:00+00',
  'Trends',
  ARRAY['trends', '2024', 'seizoen', 'mode', 'styling'],
  'https://images.pexels.com/photos/1926769/pexels-photo-1926769.jpeg?auto=compress&cs=tinysrgb&w=1200',
  6,
  'published',
  false,
  false
),
(
  'duurzame-mode-bewuste-keuzes',
  'Duurzame Mode: Bewuste Keuzes Maken',
  'Hoe je stijlvol kunt zijn terwijl je de planeet beschermt en ethische keuzes maakt.',
  E'# Duurzame Mode: Bewuste Keuzes Maken\n\nDuurzame mode gaat verder dan alleen biologische materialen. Het gaat om bewustzijn, kwaliteit en respect voor mensen en planeet.\n\n## Waarom Duurzame Mode Belangrijk Is\n\nDe mode-industrie is verantwoordelijk voor:\n- 10% van wereldwijde CO2-uitstoot\n- 20% van industrieel afvalwater\n- Slechte arbeidsomstandigheden in veel productielanden\n- Enorme hoeveelheden textielafval\n\n## De 5 R\'s van Duurzame Mode\n\n### 1. Refuse (Weiger)\nWeiger fast fashion en impulsaankopen. Vraag jezelf af: "Heb ik dit echt nodig?"\n\n### 2. Reduce (Verminder)\nKoop minder, kies beter. Kwaliteit boven kwantiteit.\n\n### 3. Reuse (Hergebruik)\nKoop tweedehands, ruil met vrienden, bezoek vintage shops.\n\n### 4. Repair (Repareer)\nLeer basis naaiwerk. Een losse knoop of klein gaatje is geen reden om weg te gooien.\n\n### 5. Recycle (Recycle)\nBreng onbruikbare kleding naar textielinzameling. Maak er iets nieuws van.\n\n## Duurzame Materialen\n\n### De Goede\n- **Organic Cotton**: Geteeld zonder pesticides\n- **Linen (Linnen)**: Biologisch afbreekbaar, weinig water nodig\n- **Tencel/Lyocell**: Van eucalyptus, duurzaam geproduceerd\n- **Gerecycled Polyester**: Van plastic flessen\n- **Hemp (Hennep)**: Super sterk, groeit snel, geen pesticides\n\n### De Slechte\n- **Conventionele Katoen**: Veel water en pesticides\n- **Polyester**: Van olie, microplastics\n- **Rayon/Viscose**: Vaak niet duurzaam geproduceerd\n\n### De Lelijke\n- **Leather van onbekende herkomst**: Milieubelasting en dierenwelzijn\n- **Fur**: Ethische bezwaren\n- **Nep-duurzame claims** (greenwashing)\n\n## Duurzame Merken Herkennen\n\nLet op certificeringen:\n- **GOTS** (Global Organic Textile Standard)\n- **Fair Trade** Certified\n- **B Corp** Certification\n- **OEKO-TEX** Standard 100\n- **Bluesign** System\n\n## De Cost Per Wear Formule\n\nIn plaats van alleen naar de aankoopprijs te kijken:\n\n**Cost Per Wear = Prijs / Aantal keer gedragen**\n\nEen €200 jas die je 200x draagt = €1 per gebruik\nEen €30 jas die je 5x draagt = €6 per gebruik\n\nKwaliteit is vaak goedkoper op lange termijn!\n\n## Praktische Tips\n\n### Bij het Winkelen\n1. Slaap er een nacht over\n2. Check het label (samenstelling, herkomst)\n3. Feel the fabric (kwaliteit is voelbaar)\n4. Vraag: "Kan ik hier 5 outfits mee maken?"\n5. Check reviews online\n\n### Care & Maintenance\n1. Was minder vaak (luchten is vaak genoeg)\n2. Koud wassen (spaart energie en stof)\n3. Air dry (droger is energieslurper)\n4. Stoom in plaats van strijken\n5. Professioneel reinigen alleen als nodig\n\n## Tweedehands is het Nieuwe Premium\n\nDe beste vintage/tweedehands tips:\n- **Marktplaats/Vinted**: Voor basics en designer steals\n- **Vintage beurzen**: Voor unieke vondsten\n- **Consignment stores**: Voor designer items\n- **Kledingbibliotheek**: Huur speciale gelegenheidskleding\n\n## Start Vandaag\n\nJe hoeft niet perfect te zijn om impact te maken:\n\n**Week 1**: Doe een kledingkast audit\n**Week 2**: Leer 3 basis reparaties\n**Week 3**: Bezoek een tweedehands winkel\n**Week 4**: Plan je volgende aankoop bewust\n\n## Ontdek Jouw Duurzame Stijl\n\nOnze AI helpt je een capsule wardrobe samenstellen met kledingstukken die je écht gaat dragen en koesteren.',
  'Anna Bakker',
  'Duurzaamheidsadviseur in de mode-industrie en slow fashion advocate.',
  '2024-01-08 11:00:00+00',
  'Duurzaamheid',
  ARRAY['duurzaamheid', 'ethisch', 'bewust', 'slow fashion', 'vintage'],
  'https://images.pexels.com/photos/1040945/pexels-photo-1040945.jpeg?auto=compress&cs=tinysrgb&w=1200',
  7,
  'published',
  false,
  false
),
(
  'van-dag-naar-avond-transitie-outfits',
  'Van Dag naar Avond: Transitie Outfits',
  'Simpele trucs om je dag-outfit om te toveren tot een avondlook zonder volledig om te kleden.',
  E'# Van Dag naar Avond: Transitie Outfits\n\nMet een paar slimme aanpassingen transformeer je elke dag-outfit naar een avondlook. Perfect voor wanneer je rechtstreeks van werk naar een etentje gaat.\n\n## De Basis van Transitie Styling\n\nHet geheim zit in veelzijdige basisstukken en strategische accessoires. Denk in layers en impact pieces.\n\n## De 5-Minuten Transformatie\n\n### Scenario 1: Van Kantoor naar Borrel\n\n**Start (Dag)**:\n- Witte blouse\n- Pantalon\n- Pumps\n- Minimale sieraden\n\n**Transformatie**:\n- Knoop blouse anders (iets losser, show decolleté)\n- Add: statement oorbellen\n- Add: rode lippenstift\n- Swap: crossbody bag voor clutch\n\n**Resultaat**: Professional maar party-ready!\n\n### Scenario 2: Van Casual naar Chic\n\n**Start (Dag)**:\n- T-shirt\n- Jeans\n- Sneakers\n- Denim jacket\n\n**Transformatie**:\n- Swap: sneakers voor hakken/loafers\n- Add: statement ketting\n- Add: leren jasje (vervang denim)\n- Tuck t-shirt in (structuur)\n\n**Resultaat**: Casual elegance!\n\n## De Essentials Voor Transitie Styling\n\n### In Je Tas\n1. **Statement sieraden**: Grote oorbellen of opvallende ketting\n2. **Rode lippenstift**: Instant glam\n3. **Hakken/Fancy flats**: In een stoffentas\n4. **Klein parfumflesje**: Fresh up\n5. **Bobby pins**: Voor quick hair fix\n\n### Op Kantoor (In je Locker)\n1. **Leren jasje**: Instant edgy\n2. **Mooie clutch/kleine tas**: Swap je werk bag\n3. **Extra top**: Voor complete outfit change\n4. **Deodorant & touch-up makeup**: Basis hygiëne\n\n## Kledingstukken die Perfect Transitionen\n\n### Tops\n- **Zijden blouse**: Kan zakelijk of romantisch\n- **Turtleneck**: Met statement ketting wordt het chic\n- **Klassiek wit overhemd**: Knoop verschillend voor effect\n\n### Bottoms\n- **Donkere jeans**: Dress up met hakken\n- **Leather pants**: Al impact, minimal styling needed\n- **Midi rok**: Versatile length\n\n### Dresses\n- **Shirt dress**: Met riem = zakelijk, zonder = relaxed\n- **Midi wrap dress**: Altijd geschikt\n- **Little black dress**: De klassieker\n\n### Outerwear\n- **Blazer**: Structure = professioneel, sleeves rolled = casual\n- **Leren jasje**: Instant edge\n- **Trenchcoat**: Timeless sophistication\n\n## Styling Tricks\n\n### Trick 1: De French Tuck\nStop alleen de voorkant van je shirt in je broek. Casual maar put-together.\n\n### Trick 2: Layer Wisely\nDraag een cami onder je werk blouse. Verwijder de blouse \'s avonds voor een sexier look.\n\n### Trick 3: Belt It\nEen riem kan alles transformeren. Add structuur en definition.\n\n### Trick 4: Roll Those Sleeves\nOpgerolde mouwen = instant casual elegance\n\n### Trick 5: Hair Switch\nVan strak knotje naar losse golven = soft evening look\n\n## De Kleur Strategie\n\n### Neutrale Basis\nStart met neutrale kleuren (zwart, navy, grijs, beige). Easy to dress up or down.\n\n### Statement Accessoires\nVoeg kleur toe via accessoires. Easy to add or remove.\n\n### Metallic Accents\nGoud/zilver werkt dag én avond. Verhoog de hoeveelheid \'s avonds.\n\n## Makeup Transitie\n\n**Dag naar Avond in 5 Minuten**:\n1. Add een sterkere lip (van nude naar rood)\n2. Intensify eyes (extra mascara, eyeliner)\n3. Bronze up (contouring voor definitie)\n4. Blot & powder (fresh start)\n5. Highlighter (glow up!)\n\n## Hair Quick Fixes\n\n**Van Neat naar Fun**:\n- Strak knotje → losse lage staart\n- Strak knotje → losse golven (bobby pins eruit)\n- Midden scheiding → side part (instant volume)\n- Add: statement haarclip\n\n## The Ultimate Transitie Outfit\n\n**One outfit, three looks**:\n\n**9 AM (Work)**:\nBlack turtleneck + midi rok + flats + crossbody bag\n\n**6 PM (Drinks)**:\nTuck turtleneck, swap naar hakken, add statement oorbellen, swap bag naar clutch\n\n**10 PM (Dinner)**:\nRol sleeves half op, add rode lip, losse hair, add layer (leren jasje)\n\n## Planning is Key\n\nWanneer je weet dat je een transitie moet maken:\n- Check het weer\n- Plan je outfit strategisch\n- Pack je transitie items de avond ervoor\n- Kies schoenen die je een paar uur kunt dragen\n\n## Ontdek Jouw Transitie Stijl\n\nWil je een gepersonaliseerde garderobe met veelzijdige pieces die moeiteloos transitionen? Onze AI analyseert je lifestyle en stijl.',
  'Mara Visser',
  'Personal stylist gespecialiseerd in busy professionals en versatile wardrobes.',
  '2024-01-05 15:00:00+00',
  'Stijltips',
  ARRAY['transitie', 'dag naar avond', 'praktisch', 'versatile', 'styling'],
  'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=1200',
  5,
  'published',
  false,
  false
),
(
  'accessoires-finishing-touch',
  'Accessoires: De Finishing Touch',
  'Hoe accessoires je outfit naar een hoger niveau tillen en je persoonlijkheid laten zien.',
  E'# Accessoires: De Finishing Touch\n\nAccessoires zijn de geheime wapens van elke stijlvolle persoon. Ze hebben de kracht om een basic outfit te transformeren en je persoonlijkheid te laten zien.\n\n## Waarom Accessoires Belangrijk Zijn\n\nEen simpel zwart jurkje kan 10 verschillende looks krijgen met de juiste accessoires:\n- Statement ketting → Glamorous\n- Denim jasje + sneakers → Casual cool\n- Blazer + pumps → Professional\n- Leren jasje + boots → Edgy\n- Cardigan + flats → Cozy chic\n\n## De Essential Accessoires\n\nElke garderobe heeft deze nodig:\n\n### 1. Tassen\n- **Crossbody bag**: Daily essential\n- **Tote bag**: Voor werk/laptop\n- **Clutch**: Evening elegance\n- **Backpack**: Casual & practical\n\n### 2. Sieraden\n- **Horloge**: Timeless essential\n- **Statement oorbellen**: Instant glam\n- **Delicate ketting**: Everyday wear\n- **Statement ketting**: Voor special occasions\n- **Stapelbare ringen**: Personal touch\n\n### 3. Riemen\n- **Zwarte leren riem**: Classic\n- **Bruine leren riem**: Warm tone\n- **Statement riem**: Add interesse\n\n### 4. Sjaals\n- **Zijden sjaal**: Elegant & versatile\n- **Cozy knit sjaal**: Winter essential\n- **Lichte sjaal**: Zomer accent\n\n### 5. Hoeden & Petten\n- **Baseballcap**: Casual cool\n- **Fedora**: Chic statement\n- **Beanie**: Winter cozy\n\n### 6. Zonnebrillen\n- **Cat-eye**: Feminine & retro\n- **Aviator**: Cool & classic\n- **Round**: Bohemian vibe\n\n## De Gouden Regels\n\n### Regel 1: Less is More\nKies 1-2 statement pieces. Als je statement oorbellen draagt, houd de ketting subtiel.\n\n### Regel 2: Match Metals (of Niet)\nKlassiek: match goud met goud. Modern: mix metals vrijuit!\n\n### Regel 3: Balanceer Proporties\nGrote oorbellen + delicate ketting ✓\nGrote oorbellen + statement ketting ✗\n\n### Regel 4: Consider Your Neckline\nV-neck → delicate ketting die de V volgt\nBoat neck → statement oorbellen\nTurtleneck → lange ketting\n\n## Sieraden Styling Guide\n\n### Face Shape Earring Guide\n\n**Round Face**:\nLange, dangly oorbellen die verlengen\n\n**Oval Face** (Lucky you!):\nAlles staat je goed, ga wild\n\n**Square Face**:\nRonde, hoops, teardrop shapes\n\n**Heart Face**:\nChandelier, teardrop styles\n\n### Necklace Layering\n\nDe perfecte stack:\n1. **Choker/korte ketting** (35-40cm)\n2. **Midi length** (45-50cm)\n3. **Long pendant** (60-70cm)\n\nTip: Varieer de dikte en styles\n\n### Ring Styling\n\nMix & match tips:\n- Wissel diktes af\n- Balanceer statement met delicate\n- Max 3-4 ringen per hand\n- Laat sommige vingers vrij\n\n## Tas Styling Strategie\n\n### De 3-Tas Garderobe\n\n**Dag (Werk/School)**:\nStructured tote of grote crossbody\nKleur: Neutraal (zwart, navy, tan)\n\n**Avond (Dinner/Event)**:\nClutch of kleine shoulder bag\nKan statement zijn (metallic, bold color)\n\n**Weekend (Casual)**:\nBackpack of slouchy hobo\nComfort is key\n\n### What\'s In Your Bag?\n\nOrganisatie is key:\n- Wallet\n- Phone\n- Keys (op keychain/finder)\n- Small makeup pouch\n- Mints\n- Hand cream\n- Sunglasses case\n\n## Sjaal Styling\n\n### 5 Ways to Tie a Scarf\n\n1. **The Classic Loop**: Vouw dubbel, steek einde door loop\n2. **The Parisian**: Om nek, beide einden voor\n3. **The Infinity**: Knoop einden, dubbel om nek\n4. **The Belted**: Als belt door lussen van je jeans\n5. **The Headband**: Gevouwen als haarband\n\n## Sunglasses als Statement\n\n### Find Your Perfect Shape\n\n**Small Face**: Delicate frames, avoid oversized\n**Large Face**: Bold, oversized frames\n**Round Face**: Angular shapes (square, cat-eye)\n**Square Face**: Round, oval shapes\n**Oval Face**: Alles werkt!\n\n### Color Strategy\n\n**Classic**: Zwart, schildpad\n**Fun**: Transparant, gekleurde frames\n**Trendy**: Tiny 90s frames, colored lenses\n\n## Seizoensgebonden Accessoires\n\n### Lente/Zomer\n- Lichte sjaals\n- Straw tassen\n- Delicate sieraden\n- Zonnebrillen\n- Sandals with statement details\n\n### Herfst/Winter\n- Cozy sjaals\n- Structured leren tassen\n- Layered sieraden\n- Hoeden & beanies\n- Statement laarzen\n\n## Investment Pieces\n\nWaar je in moet investeren:\n\n**High Investment**:\n- Designer bag (one good quality)\n- Real gold/silver jewelry\n- Quality sunglasses\n- Leren riem\n\n**Save Money**:\n- Trendy costume jewelry\n- Fashion scarves\n- Statement pieces (gaan toch uit)\n\n## Care & Maintenance\n\n### Sieraden\n- Bewaar per piece (prevent scratching)\n- Polish zilver regelmatig\n- Vermijd water/parfum contact\n\n### Tassen\n- Stuff with paper (keep shape)\n- Clean leather met speciale producten\n- Rotate gebruik (prevent wear)\n\n### Zonnebrillen\n- Bewaar in case\n- Clean met microfiber doek\n- Vermijd op je hoofd (rekt uit)\n\n## Accessorize for Your Style\n\n**Minimalist**: Focus op 1 statement piece\n**Maximalist**: Layer, mix, have fun!\n**Classic**: Tijdloze, kwaliteit pieces\n**Trendy**: Experimenteer met nieuwe styles\n**Bohemian**: Layers, natuurlijke materialen\n**Edgy**: Leather, studs, bold pieces\n\n## Ontdek Jouw Accessoire Stijl\n\nWil je weten welke accessoires perfect bij jouw persoonlijkheid en garderobe passen? Onze AI analyseert je stijl en geeft gepersonaliseerd advies.',
  'Julia Smit',
  'Accessoire specialist en visual merchandiser met passie voor details.',
  '2024-01-03 13:00:00+00',
  'Accessoires',
  ARRAY['accessoires', 'sieraden', 'tassen', 'styling', 'details'],
  'https://images.pexels.com/photos/1927259/pexels-photo-1927259.jpeg?auto=compress&cs=tinysrgb&w=1200',
  4,
  'published',
  false,
  false
)
ON CONFLICT (slug) DO NOTHING;
