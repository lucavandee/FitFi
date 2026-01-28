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

  // Generate personalized advice based on body type
  const getBodyTypeAdvice = () => {
    const normalized = bodyType.toLowerCase();

    if (normalized.includes('slank') || normalized.includes('dun')) {
      return {
        title: 'Jouw slanke lichaamsbouw',
        advice: [
          {
            text: 'Slim-fit kledingstukken benadruken jouw slanke lijn perfect',
            icon: '👔'
          },
          {
            text: 'Gestructureerde lagen voegen visuele diepte toe',
            icon: '🧥'
          },
          {
            text: 'Horizontale strepen en patronen creëren balans',
            icon: '📏'
          }
        ]
      };
    }

    if (normalized.includes('atletisch') || normalized.includes('gespierd')) {
      return {
        title: 'Jouw atletische postuur',
        advice: [
          {
            text: 'Getailleerde fits tonen jouw gespierde bouw',
            icon: '💪'
          },
          {
            text: 'Stretch materialen bieden comfort én stijl',
            icon: '👕'
          },
          {
            text: 'V-halzen accentueren je schouderpartij',
            icon: '✨'
          }
        ]
      };
    }

    // Default/gemiddeld
    return {
      title: 'Jouw lichaamsbouw',
      advice: [
        {
          text: 'Gebalanceerde proporties: je hebt veel vrijheid in stijlkeuzes',
          icon: '⚖️'
        },
        {
          text: 'Semi-fitted kledingstukken voor een strakke maar comfortabele look',
          icon: '👔'
        },
        {
          text: 'Experimenteer met verschillende silhouetten',
          icon: '✨'
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

  // Generate occasion-specific advice
  const getOccasionAdvice = () => {
    if (occasion.toLowerCase().includes('casual') || occasion.toLowerCase().includes('vrije tijd')) {
      return {
        title: `Perfect voor ${occasion}`,
        tips: [
          'Comfort staat voorop: kies ademende, flexibele materialen',
          'Nette sneakers of loafers houden het verzorgd',
          'Een strak T-shirt of polo is veelzijdiger dan een overhemd'
        ]
      };
    }

    if (occasion.toLowerCase().includes('kantoor') || occasion.toLowerCase().includes('zakelijk')) {
      return {
        title: `Perfect voor ${occasion}`,
        tips: [
          'Investeer in een goed passend blazer',
          'Kies gestreken overhemden in neutrale kleuren',
          'Leren schoenen maken je outfit compleet'
        ]
      };
    }

    // Default
    return {
      title: 'Voor alle gelegenheden',
      tips: [
        'Bouw een capsule wardrobe met veelzijdige basics',
        'Investeer in kwaliteit boven kwantiteit',
        'Pas accessoires aan per gelegenheid'
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
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-primary-600)] to-[var(--ff-color-primary-700)] flex items-center justify-center shadow-md">
                <TrendingUp className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-bold text-text">{bodyAdvice.title}</h3>
            </div>

            <ul className="space-y-5">
              {bodyAdvice.advice.map((item, idx) => (
                <motion.li
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="flex items-start gap-4 p-4 bg-[var(--ff-color-primary-25)] rounded-2xl hover:bg-[var(--ff-color-primary-50)] transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <Check className="w-5 h-5 text-[var(--ff-color-success-600)]" strokeWidth={3} />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-base font-medium text-text leading-relaxed">
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

        {/* Occasion Tips - Full Width */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-[32px] border-2 border-[var(--ff-color-primary-200)] p-8 md:p-12 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--ff-color-success-500)] to-[var(--ff-color-success-600)] flex items-center justify-center shadow-md">
              <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h3 className="text-2xl font-bold text-text">{occasionAdvice.title}</h3>
          </div>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {occasionAdvice.tips.map((tip, idx) => (
              <motion.li
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="flex items-start gap-4 p-5 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--ff-color-success-100)] flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-[var(--ff-color-success-700)]" strokeWidth={3} />
                </div>
                <p className="text-sm font-medium text-text leading-relaxed">
                  {tip}
                </p>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        {/* Pro Tip Callout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 bg-[var(--ff-color-accent-50)] border-2 border-[var(--ff-color-accent-200)] rounded-3xl p-8 text-center"
        >
          <span className="text-4xl mb-4 block">💡</span>
          <h4 className="text-xl font-bold text-text mb-3">Pro Tip</h4>
          <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed">
            <strong className="text-text">Kortom:</strong> Combineer slim-fit kledingstukken met één opvallend
            element in jouw seizoensgebonden kleurpalet. Houd de rest neutraal voor een gebalanceerde,
            professionele look die bij élke gelegenheid werkt.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
