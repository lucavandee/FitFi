// /src/pages/StyleQuizPage.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Seo from "@/components/seo/Seo";
import PageHero from "@/components/marketing/PageHero";
import Button from "@/components/ui/Button";
import QuestionCard from "@/components/quiz/QuestionCard";
import PhotoUpload from "@/components/quiz/PhotoUpload";
import QuizStepper from "@/components/quiz/QuizStepper";
import { computeResult } from "@/lib/quiz/logic";
import type { AnswerMap, QuizStep } from "@/lib/quiz/types";
import { LS_KEYS } from "@/lib/quiz/types";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

const STEPS: QuizStep[] = [
  "gender","goals","fit","bodytype","sizes","budget","comfort","jewelry","neutrals","lightness","contrast","prints","materials","occasions","brands","photo","review",
];

export default function StyleQuizPage() {
  const nav = useNavigate();
  const [stepIdx, setStepIdx] = React.useState(0);
  const [answers, setAnswers] = React.useState<AnswerMap>(() => {
    try { const raw = localStorage.getItem(LS_KEYS.QUIZ_ANSWERS); return raw ? JSON.parse(raw) as AnswerMap : {}; } catch { return {}; }
  });

  React.useEffect(() => { try { localStorage.setItem(LS_KEYS.QUIZ_ANSWERS, JSON.stringify(answers)); } catch {} }, [answers]);

  function next() { setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)); }
  function prev() { setStepIdx((i) => Math.max(i - 1, 0)); }

  async function finish() {
    const result = computeResult(answers);

    // Save to localStorage (for immediate access)
    try {
      localStorage.setItem(LS_KEYS.COLOR_PROFILE, JSON.stringify(result.color));
      localStorage.setItem(LS_KEYS.ARCHETYPE, JSON.stringify(result.archetype));
      localStorage.setItem(LS_KEYS.RESULTS_TS, Date.now().toString());
      localStorage.setItem(LS_KEYS.QUIZ_COMPLETED, "1");
    } catch {}

    // Save to Supabase (for Nova to use!)
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Prepare data for Supabase
        const profileData = {
          user_id: user.id,
          gender: answers.gender,
          archetype: result.archetype,
          body_type: answers.bodytype,
          quiz_answers: answers,
          color_advice: result.color,
          color_analysis: answers.colorAnalysis || null,
          preferred_occasions: answers.goals || [],
          sizes: answers.sizes,
          budget_range: answers.budget,
          completed_at: new Date().toISOString(),
        };

        // Insert or update style_profiles
        const { error } = await supabase
          .from("style_profiles")
          .upsert(profileData, { onConflict: "user_id" });

        if (error) {
          console.error("Failed to save quiz to Supabase:", error);
          toast.error("Quiz opgeslagen lokaal, maar niet gesynced met Nova");
        } else {
          console.log("✅ Quiz saved to Supabase for Nova!");
        }
      } else {
        console.warn("No user logged in - quiz only saved locally");
      }
    } catch (err) {
      console.error("Error saving to Supabase:", err);
    }

    nav("/results", { replace: true });
  }

  const current = STEPS[stepIdx];

  return (
    <main className="bg-[var(--color-bg)] text-[var(--color-text)]">
      <Seo title="Stijlquiz — FitFi" description="Beantwoord enkele vragen en ontvang je kleurprofiel en stijl-archetype." path="/stijlquiz" />
      <PageHero
        eyebrow="STIJLQUIZ"
        title="Snel en rustig — zoals het hoort"
        subtitle="6–10 korte vragen. Privacy-first. Resultaat: kleurprofiel + stijl-archetype."
        align="left"
        size="sm"
        ctas={[]}
        note={<QuizStepper total={STEPS.length} current={stepIdx} />}
      />

      <section className="ff-container pt-10 pb-16 space-y-6">
        {current === "gender" && (
          <QuestionCard title="Voor wie is deze stijlanalyse?"
            help="Dit helpt ons om passende kleding te adviseren."
            name="gender" value={answers.gender}
            choices={[
              { value: "male", label: "Heren" },
              { value: "female", label: "Dames" },
              { value: "non-binary", label: "Non-binair" },
              { value: "prefer-not-to-say", label: "Zeg ik liever niet" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, gender: v as any }))}
          />
        )}

        {current === "goals" && (
          <QuestionCard multiple title="Waar ga je je outfits vooral voor gebruiken?"
            help="Je kunt meer dan één optie kiezen."
            name="goals" value={answers.goals}
            choices={[
              { value: "werk", label: "Werk / Office" },
              { value: "casual", label: "Casual / Weekend" },
              { value: "avond", label: "Avond / Diner" },
              { value: "sport", label: "Sportief-net" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, goals: v as any }))}
          />
        )}

        {current === "fit" && (
          <QuestionCard title="Welke silhouet-balans past het meest bij jou?"
            name="fit" value={answers.fit}
            choices={[
              { value: "slim", label: "Getailleerd / Slim" },
              { value: "straight", label: "Recht / Regular" },
              { value: "relaxed", label: "Relaxed / Losser" },
              { value: "oversizedTop_slimBottom", label: "Ruime top + slanke broek" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, fit: v as any }))}
          />
        )}

        {current === "bodytype" && (
          <QuestionCard title="Welke lichaamsvorm past het beste bij jou?"
            help="Dit helpt ons om kleding te adviseren die jouw vorm flatteert."
            name="bodytype" value={answers.bodytype}
            choices={
              answers.gender === "female" ? [
                { value: "hourglass", label: "Zandloper", help: "Schouders en heupen even breed, smalle taille" },
                { value: "pear", label: "Peer", help: "Bredere heupen dan schouders" },
                { value: "apple", label: "Appel", help: "Bredere schouders, gewicht rond middel" },
                { value: "rectangle", label: "Rechthoek", help: "Rechte lijnen, weinig taille" },
                { value: "inverted_triangle", label: "Omgekeerde driehoek", help: "Brede schouders" },
              ] : [
                { value: "rectangle", label: "Rechthoek", help: "Schouders en heupen ongeveer even breed" },
                { value: "triangle", label: "Driehoek", help: "Bredere heupen dan schouders" },
                { value: "inverted_triangle", label: "Omgekeerde driehoek", help: "Bredere schouders dan heupen" },
                { value: "oval", label: "Ovaal", help: "Gewicht rond middel" },
              ]
            }
            onChange={(v) => setAnswers((s) => ({ ...s, bodytype: v as any }))}
          />
        )}

        {current === "sizes" && (
          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] pt-7 pb-6 px-5 sm:px-6 space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Wat zijn je maten?</h2>
              <p className="mt-1 text-sm text-[var(--color-text)]/70">
                Dit helpt ons om producten in jouw maat te vinden.
              </p>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-2">Tops (T-shirts, shirts)</label>
                <select
                  className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]"
                  value={answers.sizes?.tops || ""}
                  onChange={(e) => setAnswers((s) => ({ ...s, sizes: { ...s.sizes, tops: e.target.value } }))}
                >
                  <option value="">Kies maat</option>
                  {["XS", "S", "M", "L", "XL", "XXL"].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Broeken (waist)</label>
                <select
                  className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]"
                  value={answers.sizes?.bottoms || ""}
                  onChange={(e) => setAnswers((s) => ({ ...s, sizes: { ...s.sizes, bottoms: e.target.value } }))}
                >
                  <option value="">Kies maat</option>
                  {["28", "30", "31", "32", "33", "34", "36", "38", "40"].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Schoenen (EU)</label>
                <select
                  className="w-full px-3 py-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-bg)]"
                  value={answers.sizes?.shoes || ""}
                  onChange={(e) => setAnswers((s) => ({ ...s, sizes: { ...s.sizes, shoes: e.target.value } }))}
                >
                  <option value="">Kies maat</option>
                  {["39", "40", "41", "42", "43", "44", "45", "46"].map(size => <option key={size} value={size}>{size}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {current === "budget" && (
          <QuestionCard title="Wat is je budget per item?"
            help="We filteren producten binnen jouw bereik."
            name="budget" value={answers.budget ? `${answers.budget.min}-${answers.budget.max}` : undefined}
            choices={[
              { value: "0-50", label: "Budget (€0-50)" },
              { value: "50-150", label: "Betaalbaar (€50-150)" },
              { value: "150-300", label: "Premium (€150-300)" },
              { value: "300-999", label: "Luxe (€300+)" },
            ]}
            onChange={(v) => {
              const [min, max] = (v as string).split('-').map(Number);
              setAnswers((s) => ({ ...s, budget: { min, max } }));
            }}
          />
        )}

        {current === "comfort" && (
          <QuestionCard title="Hoe gestructureerd wil je dat je kleding voelt?"
            name="comfort" value={answers.comfort}
            choices={[
              { value: "structured", label: "Gestructureerd", help: "Strakke lijnen, nette look." },
              { value: "balanced", label: "Gebalanceerd", help: "Mix tussen netjes en comfy." },
              { value: "relaxed", label: "Relaxed", help: "Zacht, beweeglijk, cozy." },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, comfort: v as any }))}
          />
        )}

        {current === "jewelry" && (
          <QuestionCard title="Welke sieraden flatteren je vaak het meest?"
            name="jewelry" value={answers.jewelry}
            choices={[
              { value: "goud", label: "Goud" },
              { value: "zilver", label: "Zilver" },
              { value: "beide", label: "Beide ongeveer gelijk" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, jewelry: v as any }))}
          />
        )}

        {current === "neutrals" && (
          <QuestionCard title="Welke neutrale basiskleuren trekken je aan?"
            name="neutrals" value={answers.neutrals}
            choices={[
              { value: "warm", label: "Warm (zand, camel, klei)" },
              { value: "koel", label: "Koel (grijs, navy, steenkleur)" },
              { value: "neutraal", label: "Neutraal (beide oké)" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, neutrals: v as any }))}
          />
        )}

        {current === "lightness" && (
          <QuestionCard title="Voel je je het best in lichte of donkere outfits?"
            name="lightness" value={answers.lightness}
            choices={[
              { value: "licht", label: "Licht" },
              { value: "medium", label: "Tussenin" },
              { value: "donker", label: "Donker" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, lightness: v as any }))}
          />
        )}

        {current === "contrast" && (
          <QuestionCard title="Hoeveel contrast wil je meestal in je look?"
            name="contrast" value={answers.contrast}
            choices={[
              { value: "laag", label: "Laag (tonal, zacht)" },
              { value: "medium", label: "Gemiddeld" },
              { value: "hoog", label: "Hoog (licht vs. donker)" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, contrast: v as any }))}
          />
        )}

        {current === "prints" && (
          <QuestionCard title="Wat vind je van prints?"
            name="prints" value={answers.prints}
            choices={[
              { value: "geen", label: "Liever geen prints" },
              { value: "effen", label: "Overwegend effen" },
              { value: "subtiel", label: "Subtiele patronen / textuur" },
              { value: "statement", label: "Statement af en toe" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, prints: v as any }))}
          />
        )}

        {current === "materials" && (
          <QuestionCard title="Welke materialen spreken je aan?"
            name="materials" value={answers.materials}
            choices={[
              { value: "mat", label: "Mat" },
              { value: "textuur", label: "Zachte textuur (wol, brei)" },
              { value: "glans", label: "Lichte glans (satijn, nylon)" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, materials: v as any }))}
          />
        )}

        {current === "occasions" && (
          <QuestionCard multiple title="Welke setting beschrijft je week het beste?"
            help="Meerdere keuzes mogelijk."
            name="occasions" value={answers.occasions}
            choices={[
              { value: "office", label: "Office / Meeting" },
              { value: "smartcasual", label: "Smart-casual" },
              { value: "leisure", label: "Leisure / Weekend" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, occasions: v as any }))}
          />
        )}

        {current === "brands" && (
          <QuestionCard multiple title="Heb je favoriete merken? (optioneel)"
            help="We geven dit mee aan Nova voor gepersonaliseerde aanbevelingen."
            name="brands" value={answers.brands}
            choices={[
              { value: "nike", label: "Nike" },
              { value: "adidas", label: "Adidas" },
              { value: "uniqlo", label: "Uniqlo" },
              { value: "cos", label: "COS" },
              { value: "zara", label: "Zara" },
              { value: "hm", label: "H&M" },
              { value: "arket", label: "Arket" },
              { value: "weekday", label: "Weekday" },
              { value: "mango", label: "Mango" },
              { value: "other", label: "Andere" },
            ]}
            onChange={(v) => setAnswers((s) => ({ ...s, brands: v as any }))}
          />
        )}

        {current === "photo" && (
          <PhotoUpload
            value={answers.photoDataUrl}
            onChange={(v) => setAnswers((s) => ({ ...s, photoDataUrl: v }))}
            onAnalysisComplete={(analysis) => {
              console.log("AI Color Analysis:", analysis);
              setAnswers((s) => ({ ...s, colorAnalysis: analysis }));
            }}
          />
        )}

        {current === "review" && (
          <div className="rounded-[var(--radius-2xl)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-soft)] pt-7 pb-6 px-5 sm:px-6">
            <h2 className="text-lg font-semibold">Bijna klaar</h2>
            <p className="mt-1 text-sm text-[var(--color-text)]/80">
              We genereren je kleurprofiel en stijl-archetype op basis van je antwoorden.
            </p>
            <div className="mt-4 grid gap-2 text-sm">
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Silhouet:</strong> {answers.fit ?? "—"} • <strong>Comfort:</strong> {answers.comfort ?? "—"}
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Kleur:</strong> {answers.neutrals ?? "—"} • <strong>Contrast:</strong> {answers.contrast ?? "—"} • <strong>Lichtheid:</strong> {answers.lightness ?? "—"}
              </div>
              <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-bg)] px-3 py-2">
                <strong>Situaties:</strong> {(answers.goals || []).join(", ") || "—"}
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={prev} disabled={stepIdx === 0}>Terug</Button>
          {current !== "review"
            ? <Button variant="primary" onClick={next}>Volgende</Button>
            : <Button variant="primary" onClick={finish}>Toon mijn resultaten</Button>}
        </div>
      </section>
    </main>
  );
}