import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { QuizKopbalk, QuizVraag } from "./QuizKader";
import { bewaarSwipeUitkomst } from "@/services/visualPreferences/swipeOpslag";
import {
  aantalBeoordeeld,
  patroonUitKeuzes,
  rondesVoor,
  type Keuze,
  type QuizGeslacht,
} from "@/services/visualPreferences/dezeOfDeze";
import type { Look } from "@/data/dezeOfDeze";

interface DezeOfDezeProps {
  geslacht: QuizGeslacht;
  /** Na de laatste ronde of na overslaan; de uitkomst staat dan al in localStorage. */
  onKlaar: () => void;
  /** Terug vanaf de eerste ronde: naar de laatste quizvraag. */
  onTerugNaarVragen: () => void;
}

/** Hoe lang de gekozen look oplicht voor de volgende ronde komt. */
const OPLICHTEN_MS = 250;

function bron(look: Look, breedte: 480 | 960) {
  return `${look.beeld}-${breedte}.webp`;
}

function bewaar(rondes: Array<[Look, Look]>, keuzes: Keuze[]) {
  try {
    bewaarSwipeUitkomst(localStorage, aantalBeoordeeld(keuzes), patroonUitKeuzes(rondes, keuzes));
  } catch {
    // Zonder localStorage (privévenster op iOS) gaat de quiz door zonder stijlbeelden.
  }
}

/**
 * Quizstap "Deze of deze?" (designsysteem v2, CLAUDE.md deel 18): zeven keer
 * twee looks, je tikt op de look die je zelf zou dragen. Vervangt de swipes
 * met moodfoto's. De uitkomst gaat via bewaarSwipeUitkomst naar dezelfde
 * sleutels die de engine al las, dus de rest van de keten blijft gelijk.
 *
 * Geen swipe-gebaar: twee knoppen naast elkaar werken met een vinger, een muis
 * en een toetsenbord, en een schermlezer leest het alt van beide looks voor.
 */
export function DezeOfDeze({ geslacht, onKlaar, onTerugNaarVragen }: DezeOfDezeProps) {
  const rondes = React.useMemo(() => rondesVoor(geslacht), [geslacht]);
  const [keuzes, setKeuzes] = React.useState<Keuze[]>([]);
  const [gekozen, setGekozen] = React.useState<Keuze | undefined>(undefined);
  const timer = React.useRef<ReturnType<typeof setTimeout>>();
  const ronde = keuzes.length;
  const paar = rondes[ronde];

  React.useEffect(() => () => clearTimeout(timer.current), []);

  // De volgende ronde alvast laden, zodat het wisselen niet op het net wacht.
  React.useEffect(() => {
    const volgende = rondes[ronde + 1];
    if (!volgende || typeof Image === "undefined") return;
    for (const look of volgende) {
      const img = new Image();
      img.srcset = `${bron(look, 480)} 480w, ${bron(look, 960)} 960w`;
      img.sizes = "(min-width: 640px) 360px, 50vw";
      img.src = bron(look, 960);
    }
  }, [rondes, ronde]);

  const kies = (keuze: Keuze) => {
    if (gekozen !== undefined || !paar) return;
    setGekozen(keuze);
    timer.current = setTimeout(() => {
      const nieuw = [...keuzes, keuze];
      setGekozen(undefined);
      if (nieuw.length >= rondes.length) {
        bewaar(rondes, nieuw);
        onKlaar();
        return;
      }
      setKeuzes(nieuw);
    }, keuze === null ? 0 : OPLICHTEN_MS);
  };

  const terug = () => {
    if (gekozen !== undefined) return;
    if (ronde === 0) onTerugNaarVragen();
    else setKeuzes((k) => k.slice(0, -1));
  };

  const overslaan = () => {
    clearTimeout(timer.current);
    bewaar(rondes, keuzes);
    onKlaar();
  };

  if (!paar) return null;

  return (
    <div className="flex flex-col bg-[#FAFAF8] text-[#1A1A1A]" style={{ height: "100dvh" }}>
      <QuizKopbalk
        label={`Deze of deze? ${ronde + 1} van ${rondes.length}`}
        voortgang={(ronde / rondes.length) * 100}
      />

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center px-4 py-6 sm:px-6">
          <QuizVraag titel="Deze of deze?" toelichting="Tik op de look die je zelf het liefst zou dragen." />

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={ronde}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="-mx-4 grid grid-cols-2 gap-1 sm:mx-auto sm:gap-6"
              // Op een telefoon randloos, als een spread: met marges werd elke
              // look 173 px breed op 390. Vanaf sm passen twee beelden van 3:4
              // samen in de hoogte naast kop, vraag en onderbalk (ongeveer 400 px).
              style={{ maxWidth: "min(100vw, calc((100dvh - 400px) * 1.5 + 24px))" }}
              role="group"
              aria-label={`Ronde ${ronde + 1} van ${rondes.length}`}
            >
              {paar.map((look, i) => {
                const deze = gekozen === i;
                return (
                  <button
                    key={look.id}
                    type="button"
                    onClick={() => kies(i as 0 | 1)}
                    aria-label={`${i === 0 ? "Linker" : "Rechter"} look: ${look.alt}`}
                    className={`group relative block bg-[#F5F0EB] outline-none transition-opacity duration-200 ${
                      gekozen !== undefined && !deze ? "opacity-60" : ""
                    }`}
                  >
                    <img
                      src={bron(look, 960)}
                      srcSet={`${bron(look, 480)} 480w, ${bron(look, 960)} 960w`}
                      sizes="(min-width: 640px) 360px, 50vw"
                      alt=""
                      width={960}
                      height={1280}
                      className="block aspect-[3/4] w-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    {/* De rand ligt binnen het beeld: randloos op een telefoon
                        viel een rand erbuiten van het scherm af. */}
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute inset-0 ring-inset transition-shadow duration-200 ${
                        deze ? "ring-4 ring-[#A85740]" : "group-focus-visible:ring-4 group-focus-visible:ring-[#A85740]/60"
                      }`}
                    />
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>

          <p className="mt-3 text-center text-sm text-[#6E6E6E]">
            Beelden gemaakt met AI. De personen zijn modellen.
          </p>
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-[#E5E5E5] bg-white" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <div className="mx-auto max-w-3xl px-4 pt-3 pb-2 sm:px-6">
          <div className="flex items-stretch gap-2">
            <button
              type="button"
              onClick={terug}
              aria-label={ronde === 0 ? "Terug naar de vragen" : "Vorige ronde"}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#E5E5E5] bg-white text-[#1A1A1A] transition-colors duration-200 hover:border-[#A85740]"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => kies(null)}
              className="flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl border border-[#E5E5E5] bg-white text-base font-medium text-[#1A1A1A] transition-colors duration-200 hover:border-[#A85740]"
            >
              Geen van beide
            </button>
          </div>
          <div className="mt-1 flex justify-center">
            <button
              type="button"
              onClick={overslaan}
              className="inline-flex min-h-[44px] items-center px-3 text-sm text-[#4A4A4A] underline-offset-2 hover:underline"
            >
              Sla deze stap over
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
