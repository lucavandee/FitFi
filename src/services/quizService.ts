export type QuizStep = { id: string; title: string; description?: string };

const QUIZ_STEPS: QuizStep[] = [
  { id: "gender", title: "Kies je stijlrichting" },
  { id: "fit", title: "Pasvorm en voorkeur" },
  { id: "budget", title: "Budget" },
];

export async function getQuizSteps(): Promise<QuizStep[]> {
  return QUIZ_STEPS;
}