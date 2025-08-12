export type NavTarget = "results" | "outfits" | "quiz" | "challenge" | "tribe" | "feedCompose" | "referral";
type ChallengeRoute = { tribeId?: string; challengeId?: string };
export function routeTo(target: NavTarget, payload?: any): string {
  switch (target) {
    case "results": return "/results";
    case "outfits": return "/outfits";
    case "quiz": return "/quiz";
    case "feedCompose": return "/feed?compose=1";
    case "referral": return "/dashboard?ref=1";
    case "tribe": return payload?.tribeId ? `/tribes/${payload.tribeId}` : "/tribes";
    case "challenge": {
      const p = (payload ?? {}) as ChallengeRoute;
      if (p.tribeId && p.challengeId) return `/tribes/${p.tribeId}?challengeId=${p.challengeId}`;
      if (p.challengeId) return `/tribes?challengeId=${p.challengeId}`;
      return "/tribes?filter=open";
    }
    default: return "/";
  }
}