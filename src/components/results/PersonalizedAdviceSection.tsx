import React from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles, TrendingUp } from 'lucide-react';
import type { Archetype } from '@/lib/quiz/types';

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

export function PersonalizedAdviceSection({
  answers,
  archetypeName,
  colorProfile
}: PersonalizedAdviceSectionProps) {
  // Extract key user preferences
  const bodyType = answers?.bodyType || answers?.body_shape || 'gemiddeld';
  const stylePreference = answers?.style_preference || archetypeName.toLowerCase();
  const colorPreference = answers?.color_preference || colorProfile.chroma;
  const occasion = answers?.occasion || 'casual';
  const gender = answers?.gender || 'unisex';

  // Generate personalized advice based on body type with visual icons and gender
  const getBodyTypeAdvice = () => {
    const normalized = bodyType.toLowerCase();
    const isMale = gender.toLowerCase().includes('man') || gender.toLowerCase().includes('male');

    // TESTCASE 3: Gespierd / Atletisch
    if (normalized.includes('atletisch') || normalized.includes('gespierd') || normalized.includes('muscular')) {
      return {
        title: 'Jouw atletische postuur',
        subtitle: 'Toon je kracht met de juiste fit',
        advice: [
          {
            text: 'Getailleerde fits laten jouw bouw zien zonder te strak te zitten',
            icon: '💪',
            example: isMale
              ? 'Slim-fit shirts met stretch — beweegt mee, zit niet strak'
              : 'Body-con silhouetten die flatteren zonder te knellen'
          },
          {
            text: 'Stretch materialen zijn je beste vriend',
            icon: '🏃',
            example: 'Denim met elastaan, jersey blends — comfort én vorm'
          },
          {
            text: isMale ? 'V-halzen en open kragen accentueren je schouders' : 'Gestructureerde tops balanceren je silhouet',
            icon: '✨',
            example: isMale
              ? "V-neck tees, polo's met open kraag"
              : 'Peplum tops, getailleerde blazers'
          }
        ]
      };
    }

    // TESTCASE 4: Rond / Curves
    if (normalized.includes('rond') || normalized.includes('curvy') || normalized.includes('volslank') || normalized.includes('plus')) {
      return {
        title: 'Jouw vrouwelijke curves',
        subtitle: 'Vier je figuur met stijlvolle pasvormen',
        advice: [
          {
            text: 'A-lijn silhouetten flatteren je natuurlijke vorm',
            icon: '👗',
            example: 'Empire waist jurken, A-lijn rokken — elegant en comfortabel'
          },
          {
            text: 'Gedefinieerde taille creëert een prachtige zandloper',
            icon: '⌛',
            example: 'Wrap dresses, belted blazers, high-waist broeken'
          },
          {
            text: 'Verticale lijnen verlengen visueel en flatteren',
            icon: '📏',
            example: 'Lange cardigans, verticale naden, monochrome looks'
          },
          {
            text: 'Kwaliteit stoffen met structuur geven vorm én comfort',
            icon: '✨',
            example: 'Ponte knits, structured cotton, stretch wool blends'
          }
        ]
      };
    }

    // Slank / Dun
    if (normalized.includes('slank') || normalized.includes('dun') || normalized.includes('petite')) {
      return {
        title: 'Jouw slanke lichaamsbouw',
        subtitle: 'Benadrukt jouw elegante lijn',
        advice: [
          {
            text: 'Slim-fit kledingstukken tonen jouw slanke lijn perfect',
            icon: '✨',
            example: 'Tailored fits zonder extra ruimte — strak maar niet krap'
          },
          {
            text: 'Gestructureerde lagen voegen visuele diepte toe',
            icon: '🧥',
            example: 'Blazers, vesten, jackets — creëer dimensie'
          },
          {
            text: 'Horizontale lijnen en patronen brengen balans',
            icon: '📏',
            example: 'Stripes, color-blocking, textured fabrics'
          }
        ]
      };
    }

    // Default/gemiddeld
    return {
      title: 'Jouw gebalanceerde lichaamsbouw',
      subtitle: 'De vrijheid om te experimenteren',
      advice: [
        {
          text: 'Gebalanceerde proporties geven je eindeloze mogelijkheden',
          icon: '⚖️',
          example: 'Probeer verschillende stijlen — alles staat je goed'
        },
        {
          text: 'Semi-fitted silhouetten voor een moderne, strakke look',
          icon: '👔',
          example: 'Regular fit met taper, structured fits met bewegingsruimte'
        },
        {
          text: 'Experimenteer met trends zonder zorgen',
          icon: '✨',
          example: 'Oversized, slim, boxy — jij kunt het allemaal dragen'
        }
      ]
    };
  };

  // Generate color preference advice
  const getColorAdvice = () => {
    const chromaNormalized = colorPreference.toLowerCase();

    if (chromaNormalized.includes('fel') || chromaNormalized.includes('levendig') || chromaNormalized.includes('helder')) {
      return {
        title: 'Jouw voorkeur voor felle kleuren',
        advice: [
          {
            text: 'Draag één opvallend kledingstuk als statement piece',
            example: 'Kobaltblauw overhemd of fuchsia polo',
            icon: '🎨'
          },
          {
            text: 'Combineer felle accenten met neutrale basics',
            example: 'Fel shirt + donkere jeans + witte sneakers',
            icon: '✨'
          },
          {
            text: 'Experimenteer met kleurblokkering',
            example: 'Contrastrijke combinaties zoals blauw + oranje',
            icon: '🎭'
          }
        ]
      };
    }

    if (chromaNormalized.includes('zacht') || chromaNormalized.includes('gedempt') || chromaNormalized.includes('subtle')) {
      return {
        title: 'Jouw voorkeur voor zachte tinten',
        advice: [
          {
            text: 'Monochrome outfits in dezelfde kleurenfamilie',
            example: 'Beige cardigan + crème shirt + zandkleurige broek',
            icon: '🏜️'
          },
          {
            text: 'Zachte pastelkleuren die fluïde in elkaar overlopen',
            example: 'Lavendel, dusty pink, sage groen',
            icon: '🌸'
          },
          {
            text: 'Vermijd harde contrasten',
            example: 'Kies ivoor boven fel wit',
            icon: '🤍'
          }
        ]
      };
    }

    // Default
    return {
      title: 'Jouw kleurvoorkeur',
      advice: [
        {
          text: 'Gebruik je seizoensgebonden kleurpalet als basis',
          example: `${colorProfile.season} tinten passen het beste`,
          icon: '🎨'
        },
        {
          text: 'Mix warme en koele tinten voor diepte',
          example: 'Camel blazer + koele grijze broek',
          icon: '🌡️'
        }
      ]
    };
  };

  // Generate occasion-specific advice with ICONS, gender, and inspirational tone
  const getOccasionAdvice = () => {
    const isMale = gender.toLowerCase().includes('man') || gender.toLowerCase().includes('male');
    const occasionLower = occasion.toLowerCase();

    // TESTCASE 3: Edgy / Daten / Uitgaan
    if (occasionLower.includes('date') || occasionLower.includes('daten') || occasionLower.includes('uitgaan') || occasionLower.includes('avond uit')) {
      return {
        title: `Perfect voor ${occasion}`,
        icon: '🔥',
        tips: isMale ? [
          {
            text: 'Start met een strak zwart T-shirt of henley als basis',
            icon: '🖤',
            example: 'Slim-fit, stretch katoen — laat je armen zien zonder te flashy te zijn'
          },
          {
            text: 'Laagsgewijs werken: denim jacket of leren jack voor edge',
            icon: '🧥',
            example: 'Donkere wassing of zwart leer, niet te bulky'
          },
          {
            text: 'Donkere slim-fit jeans: jouw geheime wapen',
            icon: '👖',
            example: 'Zwart of deep indigo, geen rips — strak maar comfortabel'
          },
          {
            text: 'Details maken het verschil: accessoires met attitude',
            icon: '⚡',
            example: 'Zilveren ketting, lederen armband, stoere sneakers of boots'
          }
        ] : [
          {
            text: 'Begin met een strak zwart jurkje of top',
            icon: '🖤',
            example: 'Figuurvolgend, minimale details, maximal impact'
          },
          {
            text: 'Leren jacket of oversized blazer voor edge',
            icon: '🧥',
            example: 'Zwart leer of donker denim, stoer maar elegant'
          },
          {
            text: 'Statement accessoires: jouw signature move',
            icon: '💎',
            example: 'Zilveren jewelry, stoere boots of hakken, kleine clutch'
          },
          {
            text: 'Donkere kleuren met één twist: textuur of glans',
            icon: '✨',
            example: 'Satijn, leer, mesh — subtiel maar opvallend'
          }
        ]
      };
    }

    // TESTCASE 4: Vakantie / Minimalistisch / Casual
    if (occasionLower.includes('vakantie') || occasionLower.includes('holiday') || occasionLower.includes('reis') || occasionLower.includes('strand')) {
      return {
        title: `Perfect voor ${occasion}`,
        icon: '🌴',
        tips: [
          {
            text: 'Luchtige, natuurlijke stoffen zijn je beste vriend',
            icon: '🌿',
            example: 'Linnen, katoen, lyocell — ademt en voelt luxe aan'
          },
          {
            text: 'Minimalistische basisstukken in zachte tinten',
            icon: '👗',
            example: isMale
              ? 'Witte linnen overhemden, neutrale shorts, simpele tees'
              : 'A-lijn jurken, losse blouses, lichte broeken — effortless chic'
          },
          {
            text: 'Pastels en neutrale tinten: rustig maar stijlvol',
            icon: '🎨',
            example: 'Zacht blauw, beige, off-white, licht roze — combineer vrij'
          },
          {
            text: 'Praktische elegantie: comfort zonder in te leveren op stijl',
            icon: '👒',
            example: 'Oversized zonnehoed, lederen sandalen, minimal jewelry'
          }
        ]
      };
    }

    // Business / Kantoor
    if (occasionLower.includes('kantoor') || occasionLower.includes('zakelijk') || occasionLower.includes('werk') || occasionLower.includes('business')) {
      return {
        title: `Perfect voor ${occasion}`,
        icon: '💼',
        tips: isMale ? [
          {
            text: 'Investeer in een klassieke blazer die bij alles past',
            icon: '🧥',
            example: 'Marine of grijs, getailleerd voor een strakke lijn'
          },
          {
            text: 'Kwaliteit overhemden in neutrale tinten',
            icon: '👔',
            example: 'Wit, lichtblauw of grijs — altijd professioneel'
          },
          {
            text: 'Afgewerkte schoenen maken je outfit compleet',
            icon: '👞',
            example: 'Leren dress shoes of loafers in zwart of bruin'
          },
          {
            text: 'Subtiele accessoires geven persoonlijkheid',
            icon: '⌚',
            example: 'Klassiek horloge, strakke riem, simpele manchetknopen'
          }
        ] : [
          {
            text: 'Investeer in een klassieke blazer die bij alles past',
            icon: '🧥',
            example: 'Marine of zwart, getailleerd voor een strakke lijn'
          },
          {
            text: 'Kies kwaliteit blouses in neutrale tinten',
            icon: '👔',
            example: 'Wit, crème of lichtblauw – altijd professioneel'
          },
          {
            text: 'Afgewerkte schoenen maken je outfit compleet',
            icon: '👠',
            example: 'Pumps met lage hak of nette loafers'
          },
          {
            text: 'Subtiele accessoires geven persoonlijkheid',
            icon: '💍',
            example: 'Kleine oorbellen, strakke riem, minimalistische horloge'
          }
        ]
      };
    }

    // Casual / Vrije tijd
    if (occasionLower.includes('casual') || occasionLower.includes('vrije tijd')) {
      return {
        title: `Perfect voor ${occasion}`,
        icon: '🌿',
        tips: [
          { text: 'Comfort staat voorop: kies ademende, flexibele materialen', icon: '👕' },
          { text: 'Nette sneakers of loafers houden het verzorgd', icon: '👟' },
          { text: 'Een strak T-shirt of polo is veelzijdiger dan een overhemd', icon: '✨' }
        ]
      };
    }

    // Default
    return {
      title: 'Voor alle gelegenheden',
      icon: '🌟',
      tips: [
        { text: 'Bouw een capsule wardrobe met veelzijdige basics', icon: '📦' },
        { text: 'Investeer in kwaliteit boven kwantiteit', icon: '💎' },
        { text: 'Pas accessoires aan per gelegenheid', icon: '👜' }
      ]
    };
  };

  const bodyAdvice = getBodyTypeAdvice();
  const colorAdvice = getColorAdvice();
  const occasionAdvice = getOccasionAdvice();

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-24 bg-gradient-to-b from-white to-[var(--ff-color-primary-25)]">
      <div className="ff-container max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--ff-color-primary-100)] text-[var(--ff-color-primary-700)] rounded-full text-sm font-bold mb-6">
            <Sparkles className="w-4 h-4" />
            Aanbevolen voor jou
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 tracking-tight text-text">
            Jouw persoonlijke stijlgids
          </h2>
          <p className="text-lg sm:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            Op basis van jouw lichaamsbouw, kleurvoorkeuren en gelegenheden
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
          {/* Body Type Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[32px] border-2 border-[var(--color-border)] p-8 md:p-10 shadow-soft hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500"
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] flex items-center justify-center shadow-md">
                  <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-text">{bodyAdvice.title}</h3>
              </div>
              {bodyAdvice.subtitle && (
                <p className="text-base text-muted ml-[60px] font-medium italic">
                  {bodyAdvice.subtitle}
                </p>
              )}
            </div>

            <ul className="space-y-5">
              {bodyAdvice.advice.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-5 bg-[var(--ff-color-primary-25)] rounded-2xl hover:bg-[var(--ff-color-primary-50)] hover:scale-[1.02] transition-all"
                >
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="flex-1 pt-1">
                    <p className="text-base font-semibold text-text leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Color Preference Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[32px] border-2 border-[var(--color-border)] p-8 md:p-10 shadow-soft hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-all duration-500"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-accent-600)] to-[var(--ff-color-accent-700)] flex items-center justify-center shadow-md">
                <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-text">{colorAdvice.title}</h3>
            </div>

            <ul className="space-y-5">
              {colorAdvice.advice.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="p-4 bg-[var(--ff-color-accent-25)] rounded-2xl hover:bg-[var(--ff-color-accent-50)] transition-colors"
                >
                  <div className="flex items-start gap-3 mb-2">
                    <span className="text-2xl flex-shrink-0">{item.icon}</span>
                    <div className="flex-1">
                      <p className="text-base font-medium text-text leading-relaxed mb-2">
                        {item.text}
                      </p>
                      {item.example && (
                        <p className="text-sm text-muted bg-white/60 px-3 py-2 rounded-lg border border-[var(--color-border)]/30">
                          <strong className="text-text">Voorbeeld:</strong> {item.example}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Occasion Tips - Full Width with ICONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[32px] border-2 border-[var(--ff-color-primary-200)] p-8 md:p-12 shadow-soft"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--ff-color-success-500)] to-[var(--ff-color-success-600)] flex items-center justify-center shadow-md">
              <span className="text-3xl">{occasionAdvice.icon}</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-text">{occasionAdvice.title}</h3>
          </div>

          <ul className="grid sm:grid-cols-2 gap-6">
            {occasionAdvice.tips.map((tip, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="p-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className="flex items-start gap-4 mb-3">
                  <span className="text-3xl flex-shrink-0">{typeof tip === 'object' ? tip.icon : '✓'}</span>
                  <div className="flex-1">
                    <p className="text-base font-semibold text-text leading-relaxed mb-2">
                      {typeof tip === 'object' ? tip.text : tip}
                    </p>
                    {typeof tip === 'object' && tip.example && (
                      <p className="text-sm text-muted bg-[var(--ff-color-primary-25)] px-4 py-2 rounded-lg border border-[var(--color-border)]/30">
                        <strong className="text-text">💡 Tip:</strong> {tip.example}
                      </p>
                    )}
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Pro Tip Callout - Personalized for occasion */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 bg-gradient-to-br from-[var(--ff-color-accent-50)] to-[var(--ff-color-primary-50)] border-2 border-[var(--ff-color-accent-200)] rounded-3xl p-10 text-center shadow-soft"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--ff-color-accent-500)] to-[var(--ff-color-primary-600)] flex items-center justify-center mx-auto mb-5 shadow-lg">
            <span className="text-4xl">💡</span>
          </div>
          <h4 className="text-2xl font-bold text-text mb-4">Jouw Stijl Samengevat</h4>
          <p className="text-lg text-text max-w-2xl mx-auto leading-relaxed font-medium">
            {(() => {
              const occasionLower = occasion.toLowerCase();
              const bodyLower = bodyType.toLowerCase();
              const isMale = gender.toLowerCase().includes('man') || gender.toLowerCase().includes('male');

              // Edgy / Daten
              if (occasionLower.includes('date') || occasionLower.includes('daten') || occasionLower.includes('uitgaan')) {
                return (
                  <>
                    <strong className="font-bold">Kortom:</strong> Jij maakt indruk met een strakke, edgy look in donkere tinten.
                    {bodyLower.includes('gespierd') || bodyLower.includes('atletisch')
                      ? ' Laat je atletische bouw subtiel zien met slim-fit basics'
                      : ' Combineer getailleerde basics'}
                    {' '}met één statement piece — leren jack, stoere boots, of opvallende accessoires.
                    Confidence is jouw beste accessoire. 🔥
                  </>
                );
              }

              // Vakantie / Minimalistisch
              if (occasionLower.includes('vakantie') || occasionLower.includes('holiday') || occasionLower.includes('reis')) {
                return (
                  <>
                    <strong className="font-bold">Kortom:</strong> Jouw vakantie-stijl is effortless chic — minimalistisch, luchtig en tijdloos.
                    {bodyLower.includes('rond') || bodyLower.includes('curvy')
                      ? ' A-lijn silhouetten en gedefinieerde tailles flatteren je curves'
                      : ' Losse, natuurlijke stoffen'}
                    {' '}in pastels en neutrale tinten zorgen voor comfort zonder concessies aan stijl.
                    Pack light, look luxe. 🌴
                  </>
                );
              }

              // Business / Kantoor
              if (occasionLower.includes('business') || occasionLower.includes('kantoor') || occasionLower.includes('werk')) {
                return (
                  <>
                    <strong className="font-bold">Kortom:</strong> Jij maakt indruk met een klassiek, tijdloos {isMale ? 'pak' : 'ensemble'} in neutrale tinten.
                    Combineer een {bodyLower.includes('slank') ? 'getailleerde' : 'goed passende'} blazer met een kwaliteit {isMale ? 'overhemd' : 'blouse'}
                    {' '}en afgewerkte schoenen. Houd het simpel, strak en professioneel — zo straal je betrouwbaarheid uit. 💼
                  </>
                );
              }

              // Default / Casual
              return (
                <>
                  <strong className="font-bold">Kortom:</strong> Combineer {bodyLower.includes('slank') ? 'slim-fit' : 'goed passende'} kledingstukken met één opvallend
                  element in jouw seizoensgebonden kleurpalet. Houd de rest neutraal voor een gebalanceerde,
                  stijlvolle look die bij élke gelegenheid werkt. ✨
                </>
              );
            })()}
          </p>

          {/* Inspirational tagline - context-aware */}
          <div className="mt-6 pt-6 border-t border-[var(--color-border)]/30">
            <p className="text-base text-muted italic">
              {(() => {
                const occasionLower = occasion.toLowerCase();
                if (occasionLower.includes('date') || occasionLower.includes('daten') || occasionLower.includes('uitgaan')) {
                  return '"Confidence is het enige wat je écht nodig hebt."';
                }
                if (occasionLower.includes('vakantie') || occasionLower.includes('holiday')) {
                  return '"De beste outfits voelen als een tweede huid."';
                }
                if (occasionLower.includes('business') || occasionLower.includes('kantoor')) {
                  return '"Goed gekleed is goed voorbereid."';
                }
                return '"Stijl is niet wat je draagt, maar hoe je het draagt."';
              })()}
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
