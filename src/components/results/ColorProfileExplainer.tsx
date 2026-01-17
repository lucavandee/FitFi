import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, HelpCircle, X, Palette, TrendingUp, CheckCircle, Contrast, Circle } from "lucide-react";
import type { ColorProfile } from "@/lib/quiz/types";

interface ColorProfileExplainerProps {
  colorProfile: ColorProfile;
  confidence: number;
  className?: string;
}

/**
 * ColorProfileExplainer - Contextual uitleg voor kleuranalyse
 *
 * Oplost UX-probleem: "Light Neutral 98%" is verwarrend zonder context
 *
 * Functionaliteit:
 * 1. Legt uit wat neutrale ondertoon betekent
 * 2. Linkt paletnaam aan seizoenstype (Light Summer/Spring)
 * 3. Verklaart confidence score (bijv. 98% match)
 * 4. Geeft praktische tips voor neutrale ondertoon
 */
export function ColorProfileExplainer({
  colorProfile,
  confidence,
  className = ""
}: ColorProfileExplainerProps) {
  const [showModal, setShowModal] = React.useState(false);

  // Detect if undertone is neutral
  const isNeutral = colorProfile.temperature === "neutraal" ||
                    colorProfile.paletteName?.toLowerCase().includes("neutral");

  // Parse palette name to extract season info
  const extractSeasonFromPalette = (paletteName: string): string | null => {
    const normalized = paletteName.toLowerCase();

    // Match "Light Summer", "Light Spring", etc.
    if (normalized.includes("light summer")) return "Light Summer";
    if (normalized.includes("light spring")) return "Light Spring";
    if (normalized.includes("light")) return "Light (Zomer of Lente)";

    if (normalized.includes("deep winter")) return "Deep Winter";
    if (normalized.includes("deep autumn")) return "Deep Autumn";
    if (normalized.includes("deep")) return "Deep (Winter of Herfst)";

    if (normalized.includes("soft summer")) return "Soft Summer";
    if (normalized.includes("soft autumn")) return "Soft Autumn";
    if (normalized.includes("soft")) return "Soft (Zomer of Herfst)";

    if (normalized.includes("clear winter")) return "Clear Winter";
    if (normalized.includes("clear spring")) return "Clear Spring";
    if (normalized.includes("clear")) return "Clear (Winter of Lente)";

    // Fallback to season
    if (normalized.includes("winter")) return "Winter";
    if (normalized.includes("summer") || normalized.includes("zomer")) return "Zomer";
    if (normalized.includes("autumn") || normalized.includes("herfst")) return "Herfst";
    if (normalized.includes("spring") || normalized.includes("lente")) return "Lente";

    return null;
  };

  const detectedSeason = extractSeasonFromPalette(colorProfile.paletteName);

  // Parse contrast level from colorProfile
  const getContrastLevel = (): 'high' | 'medium' | 'low' => {
    const contrast = colorProfile.contrast?.toLowerCase() || '';

    if (contrast.includes('high') || contrast.includes('hoog')) return 'high';
    if (contrast.includes('low') || contrast.includes('laag')) return 'low';
    return 'medium';
  };

  const contrastLevel = getContrastLevel();

  // Generate contextual explanation based on profile
  const getExplanation = () => {
    if (isNeutral) {
      return {
        title: "Neutrale Ondertoon Gedetecteerd",
        icon: <Palette className="w-6 h-6 text-[var(--ff-color-accent-600)]" />,
        description: `Je hebt een neutrale ondertoon, wat betekent dat je tussen warm en koel in zit. Dit is eigenlijk een groot voordeel!`,
        benefits: [
          "Je kunt zowel warme als koele kleuren dragen",
          "Je hebt meer flexibiliteit bij kleurkeuzes",
          "Je komt vaak het beste uit met gedempte, zachte tinten",
        ],
        seasonLink: detectedSeason
          ? `Dit komt overeen met het ${detectedSeason} type — een van de meest veelzijdige paletten.`
          : "Dit geeft je een veelzijdig kleurpalet met zowel warme als koele tinten.",
        tips: [
          "Focus op de intensiteit (chroma) en contrast in plaats van temperatuur",
          "Test kleuren bij je gezicht in natuurlijk licht",
          "Mix warme en koele tinten voor balans",
        ]
      };
    }

    // Warm undertone explanation
    if (colorProfile.temperature === "warm") {
      return {
        title: "Warme Ondertoon",
        icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
        description: "Je hebt een warme ondertoon, wat betekent dat goudachtige en aardse kleuren jou flatteren.",
        benefits: [
          "Goudkleurige sieraden staan je beter dan zilver",
          "Warme tinten brengen een gezonde gloed",
          "Aardetinten zoals camel, olijf en terracotta zijn ideaal",
        ],
        seasonLink: detectedSeason
          ? `Je seizoenstype is ${detectedSeason}.`
          : "Je palet bestaat uit warme, rijke kleuren.",
        tips: [
          "Vermijd ijskoude tinten zoals felroze of ijsblauw",
          "Kies voor crème wit in plaats van zuiver wit",
          "Goud, koper en brons zijn jouw metalen",
        ]
      };
    }

    // Cool undertone explanation
    return {
      title: "Koele Ondertoon",
      icon: <TrendingUp className="w-6 h-6 text-blue-600" />,
      description: "Je hebt een koele ondertoon, wat betekent dat blauwachtige en rozeachtige tinten jou flatteren.",
      benefits: [
        "Zilverkleurige sieraden staan je beter dan goud",
        "Koele tinten geven je een frisse, heldere uitstraling",
        "IJstinten zoals navy, felroze en ijsblauw zijn ideaal",
      ],
      seasonLink: detectedSeason
        ? `Je seizoenstype is ${detectedSeason}.`
        : "Je palet bestaat uit koele, heldere kleuren.",
      tips: [
        "Vermijd warme goudachtige tinten zoals camel of oranje",
        "Kies voor zuiver wit in plaats van crème wit",
        "Zilver, platinum en witgoud zijn jouw metalen",
      ]
    };
  };

  const explanation = getExplanation();

  // Generate contrast-specific explanation
  const getContrastExplanation = () => {
    if (contrastLevel === 'high') {
      return {
        title: "Hoog Contrast",
        description: "Je kunt sterke kleurverschillen aan, zoals zwart met wit of diepe kleuren met lichte tinten.",
        icon: <Contrast className="w-6 h-6 text-gray-900" />,
        characteristics: [
          "Opvallende kleurverschillen staan je goed",
          "Zwart-wit combinaties zijn ideaal",
          "Diepe, rijke kleuren flatteren je",
          "Je kunt bold statements maken zonder overweldigend te zijn"
        ],
        doExamples: [
          { top: "Zwart", bottom: "Wit", description: "Klassiek hoog contrast" },
          { top: "Marineblauw", bottom: "Crème", description: "Elegant en strak" },
          { top: "Donkergroen", bottom: "Beige", description: "Aards maar krachtig" }
        ],
        dontExamples: [
          "Pastel-op-pastel (te weinig definitie)",
          "Beige-op-beige (verdwijnt tegen je huid)",
          "Eén monotone look zonder accenten"
        ],
        tips: [
          "Combineer altijd licht met donker voor maximaal effect",
          "Gebruik accessoires in contrasterende kleuren",
          "Vermijd ton-sur-ton looks (bijv. all-beige)"
        ]
      };
    }

    if (contrastLevel === 'low') {
      return {
        title: "Laag Contrast",
        description: "Je komt het beste uit met kleuren die dicht bij elkaar liggen in intensiteit, zoals pastels of gedempte tinten.",
        icon: <Circle className="w-6 h-6 text-gray-400" />,
        characteristics: [
          "Zachte, subtiele kleuren staan je het best",
          "Ton-sur-ton looks zijn jouw kracht",
          "Harde contrasten kunnen je overweldigen",
          "Gedempte tinten geven een harmonieuze uitstraling"
        ],
        doExamples: [
          { top: "Zachtroze", bottom: "Beige", description: "Zachte monochrome look" },
          { top: "Lichtblauw", bottom: "Crème", description: "Subtiel en elegant" },
          { top: "Lavendel", bottom: "Grijs", description: "Gedempt en verfijnd" }
        ],
        dontExamples: [
          "Zwart-wit (te hard en overweldigend)",
          "Felle primaire kleuren (te intens)",
          "Harde kleurverschillen (zoals zwart met geel)"
        ],
        tips: [
          "Blijf binnen dezelfde kleurenfamilie (bijv. tinten blauw)",
          "Kies gedempte versies van kleuren (dusty rose i.p.v. felrood)",
          "Gebruik neutrale tinten als basis (grijs, beige, zacht wit)"
        ]
      };
    }

    // Medium contrast
    return {
      title: "Gemiddeld Contrast",
      description: "Je hebt balans tussen subtiel en opvallend. Je kunt zowel zachte als contrasterende combinaties dragen.",
      icon: <Palette className="w-6 h-6 text-[var(--ff-color-primary-600)]" />,
      characteristics: [
        "Je hebt de meeste flexibiliteit in kleurcombinaties",
        "Zowel ton-sur-ton als contrasterende looks werken",
        "Je kunt experimenteren met verschillende intensiteiten",
        "Gemiddelde kleurverschillen zijn ideaal"
      ],
      doExamples: [
        { top: "Navy", bottom: "Lichtblauw", description: "Gemiddeld contrast binnen één familie" },
        { top: "Donkergroen", bottom: "Crème", description: "Subtiel maar gedefinieerd" },
        { top: "Grijs", bottom: "Oudroze", description: "Balans tussen neutraal en kleur" }
      ],
      dontExamples: [
        "Extreem zwart-wit (te hard)",
        "Te veel pastels zonder definitie",
        "Té felle kleuren zonder neutrale balans"
      ],
      tips: [
        "Mix één neutrale kleur met één accent voor balans",
        "Vermijd extreme uitersten (te hard of te zacht)",
        "Experimenteer met mid-tones en gedempte helders"
      ]
    };
  };

  const contrastExplanation = getContrastExplanation();

  // Format confidence percentage
  const confidencePercentage = Math.round(confidence * 100);
  const getConfidenceLabel = () => {
    if (confidence >= 0.85) return "Zeer betrouwbaar";
    if (confidence >= 0.7) return "Betrouwbaar";
    if (confidence >= 0.5) return "Gemiddeld";
    return "Basis schatting";
  };

  return (
    <>
      {/* Inline Explainer Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-2xl border-2 border-[var(--ff-color-primary-200)] p-6 shadow-lg ${className}`}
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center flex-shrink-0">
              {explanation.icon}
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-bold text-[var(--color-text)] mb-1">
                {explanation.title}
              </h4>
              <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">
                {explanation.description}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="p-2 rounded-lg hover:bg-white/60 transition-colors flex-shrink-0"
            aria-label="Meer informatie"
          >
            <HelpCircle className="w-5 h-5 text-[var(--ff-color-primary-600)]" />
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">
              Seizoenstype
            </p>
            <p className="text-sm font-bold text-[var(--color-text)]">
              {detectedSeason || colorProfile.season || "Algemeen"}
            </p>
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3">
            <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">
              Contrast niveau
            </p>
            <p className="text-sm font-bold text-[var(--color-text)]">
              {contrastExplanation.title}
            </p>
          </div>
        </div>

        {/* Contrast Quick Preview */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 mb-4">
          <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-2">
            Betrouwbaarheid: {confidencePercentage}% · {getConfidenceLabel()}
          </p>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">
            {contrastExplanation.description}
          </p>
        </div>

        {/* Season Link */}
        {explanation.seasonLink && (
          <div className="p-3 bg-white rounded-lg border border-[var(--ff-color-primary-200)] mb-4">
            <p className="text-sm text-[var(--color-text)] leading-relaxed">
              <Info className="w-4 h-4 inline mr-2 text-[var(--ff-color-primary-600)]" />
              {explanation.seasonLink}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full px-4 py-2.5 bg-white hover:bg-[var(--ff-color-primary-50)] border-2 border-[var(--ff-color-primary-300)] text-[var(--ff-color-primary-700)] rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
        >
          <Info className="w-4 h-4" />
          Lees volledige uitleg
        </button>
      </motion.div>

      {/* Detailed Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[var(--ff-color-primary-500)] to-[var(--ff-color-accent-500)] p-6 rounded-t-3xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center">
                      {explanation.icon}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {explanation.title}
                      </h3>
                      <p className="text-sm text-white/90">
                        Kleuranalyse uitleg
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors"
                    aria-label="Sluit"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Description */}
                <div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {explanation.description}
                  </p>
                </div>

                {/* Confidence Score Explanation */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Wat betekent {confidencePercentage}%?
                  </h4>
                  <p className="text-sm text-blue-800 leading-relaxed">
                    Dit percentage geeft aan hoe zeker we zijn van je kleurprofiel op basis van je input.
                    {confidence >= 0.85 && " Een score boven 85% betekent dat je consistente voorkeuren hebt en je kleurpalet zeer nauwkeurig is."}
                    {confidence >= 0.7 && confidence < 0.85 && " Een score boven 70% betekent dat je duidelijke voorkeuren hebt en je kleurpalet betrouwbaar is."}
                    {confidence >= 0.5 && confidence < 0.7 && " Een score boven 50% betekent dat we een goede basis hebben, maar dat meer data je profiel nog nauwkeuriger kan maken."}
                    {confidence < 0.5 && " Een lagere score betekent dat je profiel is gebaseerd op beperkte data. Upload een foto of swipe meer moodboards voor een nauwkeuriger profiel."}
                  </p>
                </div>

                {/* Season Link */}
                {detectedSeason && (
                  <div className="p-4 bg-gradient-to-br from-[var(--ff-color-primary-50)] to-[var(--ff-color-accent-50)] rounded-xl border border-[var(--ff-color-primary-200)]">
                    <h4 className="font-bold text-[var(--ff-color-primary-800)] mb-2">
                      Jouw Seizoenstype: {detectedSeason}
                    </h4>
                    <p className="text-sm text-[var(--ff-color-primary-700)] leading-relaxed">
                      {explanation.seasonLink}
                    </p>
                  </div>
                )}

                {/* Benefits */}
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Voordelen van jouw profiel
                  </h4>
                  <ul className="space-y-2">
                    {explanation.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-700 leading-relaxed">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Practical Tips */}
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-3">
                    Praktische tips
                  </h4>
                  <ul className="space-y-2">
                    {explanation.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <span className="text-[var(--ff-color-primary-600)] font-bold mt-0.5">•</span>
                        <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contrast Level Section */}
                <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-300">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                      {contrastExplanation.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">
                        {contrastExplanation.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Jouw contrast profiel
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 leading-relaxed mb-4">
                    {contrastExplanation.description}
                  </p>

                  {/* Characteristics */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-sm text-gray-800 mb-2">
                      Kenmerken van jouw contrast
                    </h5>
                    <ul className="space-y-1.5">
                      {contrastExplanation.characteristics.map((char, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{char}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Visual Examples - DO */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-sm text-green-800 mb-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Draag deze combinaties
                    </h5>
                    <div className="space-y-2">
                      {contrastExplanation.doExamples.map((example, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex gap-1">
                            <div className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-[10px] font-bold bg-white shadow-sm">
                              {example.top.substring(0, 2)}
                            </div>
                            <div className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-[10px] font-bold bg-white shadow-sm">
                              {example.bottom.substring(0, 2)}
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-900">
                              {example.top} + {example.bottom}
                            </p>
                            <p className="text-[11px] text-gray-600">
                              {example.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visual Examples - DON'T */}
                  <div className="mb-4">
                    <h5 className="font-semibold text-sm text-red-800 mb-2 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Vermijd deze combinaties
                    </h5>
                    <ul className="space-y-1.5">
                      {contrastExplanation.dontExamples.map((example, i) => (
                        <li key={i} className="flex items-start gap-2 p-2 bg-red-50 rounded-lg border border-red-200">
                          <X className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-red-900">{example}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Contrast Tips */}
                  <div>
                    <h5 className="font-semibold text-sm text-gray-800 mb-2">
                      Praktische tips
                    </h5>
                    <ul className="space-y-1.5">
                      {contrastExplanation.tips.map((tip, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
                          <span className="text-[var(--ff-color-primary-600)] font-bold mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Additional Context */}
                <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <h4 className="font-bold text-yellow-900 mb-2">
                    💡 Wist je dat...
                  </h4>
                  <p className="text-sm text-yellow-800 leading-relaxed">
                    Je ondertoon blijft je hele leven hetzelfde, maar je kleurvoorkeuren kunnen veranderen.
                    Neem de quiz opnieuw na 6 maanden om te zien of je stijl evolueert!
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 bg-gray-50 rounded-b-3xl">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-6 py-3 bg-[var(--ff-color-primary-600)] hover:bg-[var(--ff-color-primary-700)] text-white rounded-xl font-bold transition-colors"
                >
                  Begrepen, terug naar resultaten
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
