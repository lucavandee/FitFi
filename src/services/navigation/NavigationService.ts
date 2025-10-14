// Central navigation mapping
export type NavTarget =
  | "results"
  | "outfits"
  | "quiz"
  | "feedCompose"
  | "referral";

export function resolvePath(target: NavTarget, payload?: any): string {
  switch (target) {
    case "results": return "/results";
    case "outfits": return "/outfits";
    case "quiz": return "/quiz";
    case "feedCompose": return "/feed?compose=1";
    // NOTE: eerder stond hier '?ref=1' (plugin-warning). We gebruiken nu een neutralere flag.
    case "referral": return "/dashboard?invite=1";
  }
}