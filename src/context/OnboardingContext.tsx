import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** Publieke API van de context */
export type OnboardingAnswers = Record<
  string,
  string | number | boolean | string[] | number[] | null
>;

export type OnboardingState = {
  /** Huidige stap in de onboarding-flow (1-based of route-gebaseerd) */
  step: number;
  /** Alle gegeven antwoorden (keyed per vraag/veldnaam) */
  answers: OnboardingAnswers;
  /** Zet expliciet de stap (begrenst op min 1) */
  setStep: (n: number) => void;
  /** Merge een subset van antwoorden (immutabel) */
  setAnswers: (patch: Partial<OnboardingAnswers>) => void;
  /** Volgende stap helper */
  next: () => void;
  /** Vorige stap helper */
  prev: () => void;
  /** Reset alle state naar begin */
  reset: () => void;
};

const OnboardingCtx = createContext<OnboardingState | null>(null);

const STORAGE_KEY = "ff_onboarding_v1";

type ProviderProps = { children: ReactNode };

/**
 * OnboardingProvider
 * - Bewaart voortgang in localStorage (client-only, PII-vrij als je key's slim kiest)
 * - Veilige defaults zodat UI nooit crasht
 */
const OnboardingProvider: React.FC<ProviderProps> = ({ children }) => {
  const [step, setStepState] = useState<number>(1);
  const [answers, setAnswersState] = useState<OnboardingAnswers>({});

  // Hydrate
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<OnboardingState>;
      if (parsed && typeof parsed === "object") {
        if (typeof parsed.step === "number") setStepState(Math.max(1, parsed.step));
        if (parsed.answers && typeof parsed.answers === "object") {
          setAnswersState(parsed.answers as OnboardingAnswers);
        }
      }
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  // Persist
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ step, answers })
      );
    } catch {
      /* ignore quota */
    }
  }, [step, answers]);

  const setStep = (n: number) => setStepState(Math.max(1, n));

  const setAnswers = (patch: Partial<OnboardingAnswers>) =>
    setAnswersState((prev) => ({ ...prev, ...patch }));

  const next = () => setStepState((s) => s + 1);
  const prev = () => setStepState((s) => Math.max(1, s - 1));
  const reset = () => {
    setStepState(1);
    setAnswersState({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const value = useMemo<OnboardingState>(
    () => ({ step, answers, setStep, setAnswers, next, prev, reset }),
    [step, answers]
  );

  return <OnboardingCtx.Provider value={value}>{children}</OnboardingCtx.Provider>;
};

/**
 * Fail-safe hook: crasht niet als de Provider (tijdelijk) ontbreekt.
 * Geeft een no-op implementatie terug zodat UI functioneel blijft in dev.
 */
export function useOnboarding(): OnboardingState {
  const ctx = useContext(OnboardingCtx);
  if (ctx) return ctx;

  // No-op fallback (dev-vriendelijk; voorkomt runtime crashes)
  return {
    step: 1,
    answers: {},
    setStep: () => {},
    setAnswers: () => {},
    next: () => {},
    prev: () => {},
    reset: () => {},
  };
}

export default OnboardingProvider;