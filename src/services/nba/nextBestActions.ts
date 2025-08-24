export type NextAction = {
  id: string;
  title: string;
  subtitle?: string;
  cta: string;
  route: string;
  score: number; // computed
  icon?: string; // lucide icon name
  badge?: string; // e.g. "+20 XP"
};

type Ctx = {
  hasQuiz: boolean;
  hasTribe: boolean;
  hasPost: boolean;
  hasSubmission: boolean;
  referrals: number;
  streak: number;
  level: number;
};

export function computeNextActions(ctx: Ctx): NextAction[] {
  const actions: NextAction[] = [];
  const push = (na: Omit<NextAction, "score"> & { score: number }) =>
    actions.push(na as NextAction);

  if (!ctx.hasQuiz)
    push({
      id: "quiz",
      title: "Maak je Style Scan",
      subtitle: "Ontgrendel persoonlijke outfits",
      cta: "Start quiz",
      route: "/quiz",
      score: 100,
      icon: "Scan",
      badge: "+30 XP",
    });
  if (!ctx.hasTribe)
    push({
      id: "tribe-join",
      title: "Join je eerste Tribe",
      subtitle: "Vind je stijlcrew",
      cta: "Ontdek tribes",
      route: "/tribes",
      score: 90,
      icon: "Users",
      badge: "+10 XP",
    });
  if (!ctx.hasSubmission)
    push({
      id: "challenge",
      title: "Doe mee aan de challenge",
      subtitle: "Verdien bonuspunten",
      cta: "Open challenge",
      route: "/tribes",
      score: 85,
      icon: "Trophy",
      badge: "+20 XP",
    });
  if (!ctx.hasPost)
    push({
      id: "post",
      title: "Post je outfit",
      subtitle: "Krijg feedback van Nova",
      cta: "Post nu",
      route: "/feed?compose=1",
      score: 70,
      icon: "Camera",
      badge: "+10 XP",
    });

  if (ctx.referrals < 3)
    push({
      id: "invite",
      title: "Nodig 1 vriend uit",
      subtitle: "Word Founding Member",
      cta: "Deel invite",
      route: "/dashboard?ref",
      score: 75 + ctx.referrals * 5,
      icon: "Share2",
      badge: "+50 XP",
    });
  if (ctx.streak < 7)
    push({
      id: "streak",
      title: "Houd je streak vol",
      subtitle: `Dag ${ctx.streak + 1}/7`,
      cta: "Claim daily",
      route: "/dashboard?daily",
      score: 60 + ctx.streak * 3,
      icon: "Flame",
      badge: "+5 XP",
    });

  actions.sort((a, b) => b.score - a.score);
  return actions.slice(0, 5);
}
