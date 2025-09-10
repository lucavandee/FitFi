import type {
  TribeChallenge,
  TribeChallengeSubmission,
  TribeRanking,
  ID,
} from "./types";

/* ----------------------------- helpers & store ----------------------------- */

const LS_CHALLENGES = "fitfi.tc.challenges"; // Record<string(tribeId|_) , TribeChallenge[]>
const LS_SUBS       = "fitfi.tc.submissions"; // Record<string(challengeId), TribeChallengeSubmission[]>

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
    /* ignore */
  }
}

function bucketKey(tribeId?: ID) { return tribeId || "_"; }

/* --------------------------------- seeds ---------------------------------- */

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

// Eén open + één closed als basis; tribe_id wordt bij injectie gezet.
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

function seedWithIds(tribeId?: ID): TribeChallenge[] {
  return BASE_CHALLENGES.map((c, i) => ({
    id: `c-${i + 1}`,
    tribe_id: tribeId,
    ...c,
  }));
}

/* --------------------------------- reads ---------------------------------- */

export async function getTribeChallenges(tribeId?: ID): Promise<TribeChallenge[]> {
  const key = bucketKey(tribeId);
  const store = safeRead<Record<string, TribeChallenge[]>>(LS_CHALLENGES, {});
  const list = store[key];
  if (Array.isArray(list) && list.length) return list;

  // seed en persist
  const seeded = seedWithIds(tribeId);
  store[key] = seeded;
  safeWrite(LS_CHALLENGES, store);
  return seeded;
}

/** Alias die door andere modules geëist wordt. */
export async function fetchTribeChallenges(tribeId?: ID): Promise<TribeChallenge[]> {
  return getTribeChallenges(tribeId);
}

/* --------------------------------- creates -------------------------------- */

export async function createTribeChallenge(input: Omit<TribeChallenge, "id">): Promise<TribeChallenge> {
  const id = crypto.randomUUID();
  const item: TribeChallenge = {
    id,
    status: "open",
    ...input,
  };
  const key = bucketKey(item.tribe_id);
  const store = safeRead<Record<string, TribeChallenge[]>>(LS_CHALLENGES, {});
  const cur = store[key] ?? [];
  store[key] = [item, ...cur];
  safeWrite(LS_CHALLENGES, store);
  return item;
}

/* --------------------------- submissions & ranking ------------------------- */

export async function getChallengeSubmissions(challengeId: ID): Promise<TribeChallengeSubmission[]> {
  const all = safeRead<Record<string, TribeChallengeSubmission[]>>(LS_SUBS, {});
  return all[challengeId] ?? [];
}

/** Gevraagde export door useTribeChallenges.ts */
export async function createChallengeSubmission(
  input: Omit<TribeChallengeSubmission, "id" | "createdAt">
): Promise<TribeChallengeSubmission> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const submission: TribeChallengeSubmission = { id, createdAt, ...input };
  const store = safeRead<Record<string, TribeChallengeSubmission[]>>(LS_SUBS, {});
  const key = input.challenge_id || input.challengeId || "";
  const cur = store[key] ?? [];
  store[key] = [submission, ...cur];
  safeWrite(LS_SUBS, store);
  return submission;
}

export async function getTribeRanking(tribeId: ID): Promise<TribeRanking[]> {
  // Ranking op basis van #submissions per user binnen challenges van deze tribe.
  const challenges = await getTribeChallenges(tribeId);
  const subStore = safeRead<Record<string, TribeChallengeSubmission[]>>(LS_SUBS, {});
  const counts = new Map<string, number>();

  for (const ch of challenges) {
    const cid = ch.id;
    const subs = subStore[cid] ?? [];
    for (const s of subs) {
      const uid = s.user_id || s.userId || "anon";
      counts.set(uid, (counts.get(uid) ?? 0) + 1);
    }
  }

  const result: TribeRanking[] = Array.from(counts.entries())
    .map(([user_id, score]) => ({ user_id, score, tribe_id: tribeId }))
    .sort((a, b) => b.score - a.score);

  return result;
}

/* ------------------------------ fetch aliases ------------------------------ */

export async function fetchChallengeSubmissions(challengeId: ID): Promise<TribeChallengeSubmission[]> {
  return getChallengeSubmissions(challengeId);
}
export async function fetchTribeRanking(tribeId: ID): Promise<TribeRanking[]> {
  return getTribeRanking(tribeId);
}

/* ------------------------------ default export ----------------------------- */

export default {
  getTribeChallenges,
  fetchTribeChallenges,
  createTribeChallenge,
  getChallengeSubmissions,
  fetchChallengeSubmissions,
  createChallengeSubmission,
  getTribeRanking,
  fetchTribeRanking,
};