import type {
  TribeChallenge,
  TribeChallengeSubmission,
  TribeRanking,
  ID,
} from "./types";

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// Slanke, consistente fallbacks met één gegarandeerd "open" item
const BASE_CHALLENGES: Omit<TribeChallenge, "id">[] = [
  {
    title: "Monochrome Week",
    description: "Zwart-wit looks 7 dagen lang.",
    starts_at: isoPlusDays(-2),
    ends_at: isoPlusDays(5),
    status: "open",
  },
  {
    title: "Sneaker Sunday",
    description: "Jouw beste sneaker-fit.",
    starts_at: isoPlusDays(-10),
    ends_at: isoPlusDays(-3),
    status: "closed",
  },
];

function withIds(tribeId?: ID): TribeChallenge[] {
  return BASE_CHALLENGES.map((c, i) => ({
    id: `c-${i + 1}`,
    tribe_id: tribeId,
    ...c,
  }));
}

/** Voor bestaande imports in je codebase */
export async function getTribeChallenges(tribeId?: ID): Promise<TribeChallenge[]> {
  return withIds(tribeId);
}

/** Gevraagde named export door challengeDiscovery.ts */
export async function fetchTribeChallenges(tribeId?: ID): Promise<TribeChallenge[]> {
  return getTribeChallenges(tribeId);
}

export async function getChallengeSubmissions(_challengeId: ID): Promise<TribeChallengeSubmission[]> {
  return [];
}
export async function fetchChallengeSubmissions(challengeId: ID): Promise<TribeChallengeSubmission[]> {
  return getChallengeSubmissions(challengeId);
}

export async function getTribeRanking(_tribeId: ID): Promise<TribeRanking[]> {
  return [];
}
export async function fetchTribeRanking(tribeId: ID): Promise<TribeRanking[]> {
  return getTribeRanking(tribeId);
}

/** Optionele default voor brede compatibiliteit */
export default {
  getTribeChallenges,
  fetchTribeChallenges,
  getChallengeSubmissions,
  fetchChallengeSubmissions,
  getTribeRanking,
  fetchTribeRanking,
};