import type { QuizAnswers, QuizSubmission } from "@/types/quiz";

/**
 * Kleine, vaste quiz-steps; uitbreidbaar zonder breuk.
 */
export type QuizStep = { id: string; title: string; description?: string };
const QUIZ_STEPS: QuizStep[] = [
  { id: "gender",  title: "Kies je stijlrichting" },
  { id: "fit",     title: "Pasvorm en voorkeur" },
  { id: "budget",  title: "Budget" },
];

/** Publieke API voor compatibiliteit met bestaande imports. */
export async function getQuizSteps(): Promise<QuizStep[]> {
  return QUIZ_STEPS;
}

const LS_ANS = (userId: string) => `fitfi.quiz.answers.${userId || "anon"}`;
const LS_SUB = (userId: string) => `fitfi.quiz.submission.${userId || "anon"}`;

function safeRead<T>(key: string, fallback: T): T {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

async function getAnswers(userId: string): Promise<QuizAnswers | null> {
  return safeRead<QuizAnswers | null>(LS_ANS(userId), null);
}

async function setAnswers(userId: string, next: QuizAnswers): Promise<QuizAnswers> {
  safeWrite(LS_ANS(userId), next);
  return next;
}

async function saveAnswers(userId: string, patch: Partial<QuizAnswers>): Promise<QuizAnswers> {
  const cur = (await getAnswers(userId)) ?? ({} as QuizAnswers);
  const next = { ...cur, ...patch };
  return setAnswers(userId, next);
}

async function clearAnswers(userId: string): Promise<void> {
  safeWrite(LS_ANS(userId), null);
}

async function submit(userId: string): Promise<QuizSubmission> {
  const answers = (await getAnswers(userId)) ?? ({} as QuizAnswers);
  const submission: QuizSubmission = {
    id: crypto.randomUUID(),
    userId,
    createdAt: new Date().toISOString(),
    answers,
    status: "submitted",
  } as QuizSubmission;
  safeWrite(LS_SUB(userId), submission);
  return submission;
}

/**
 * Compat-laag voor src/hooks/useQuizAnswers.ts. Geeft submissions terug in de
 * QuizSubmission-vorm uit src/types/quiz.ts (user_id/completed_at/...).
 */
async function getUserAnswers(userId: string): Promise<QuizSubmission | null> {
  const stored = safeRead<Record<string, any> | null>(LS_SUB(userId), null);
  if (!stored || !stored.answers) return null;
  const createdAt = stored.created_at ?? stored.createdAt ?? new Date().toISOString();
  return {
    id: stored.id ?? `local-${userId}`,
    user_id: stored.user_id ?? stored.userId ?? userId,
    answers: stored.answers as QuizAnswers,
    completed_at: stored.completed_at ?? stored.createdAt ?? createdAt,
    created_at: createdAt,
    updated_at: stored.updated_at ?? createdAt,
  };
}

async function submitAnswers(userId: string, answers: QuizAnswers): Promise<boolean> {
  await setAnswers(userId, answers);
  const now = new Date().toISOString();
  const submission: QuizSubmission = {
    id: crypto.randomUUID(),
    user_id: userId,
    answers,
    completed_at: now,
    created_at: now,
    updated_at: now,
  };
  safeWrite(LS_SUB(userId), submission);
  return true;
}

async function resetQuiz(userId: string): Promise<boolean> {
  await clearAnswers(userId);
  safeWrite(LS_SUB(userId), null);
  return true;
}

/**
 * Named export verwacht door: src/hooks/useQuizAnswers.ts
 * We bieden meerdere method-aliases om compatibel te zijn met oudere aanroepen.
 */
export const quizService = {
  // lezen/schrijven
  get: getAnswers,
  getAnswers,
  set: setAnswers,
  setAnswers,
  saveAnswers,
  patch: saveAnswers,
  clear: clearAnswers,
  reset: clearAnswers,

  // submit + steps
  submit,
  getSteps: getQuizSteps,

  // compat met useQuizAnswers
  getUserAnswers,
  submitAnswers,
  resetQuiz,
};

// (optioneel) ook default export voor bredere compatibiliteit
export default quizService;