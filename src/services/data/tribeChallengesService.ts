import type {
  TribeChallenge,
  TribeChallengeSubmission,
  TribeRanking,
  ID,
} from "./types";

/* ----------------------------- helpers & store ----------------------------- */

const LS_CHALLENGES = "fitfi.tc.challenges"; // Record<string(tribeId|_) , TribeChallenge[]>
const LS_SUBS       = "fitfi.tc.submissions"; // Record<string(challengeId), TribeChallengeSubmission[]>

type ChallengeBuckets = Record<string, TribeChallenge[]>;
type SubmissionBuckets = Record<string, TribeChallengeSubmission[]>;

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

function isoPlusDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

/* --------------------------------- seeds ---------------------------------- */

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
  const store = safeRead<ChallengeBuckets>(LS_CHALLENGES, {});
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
    status: (input as any).status ?? "open",
    ...input,
  };
  const key = bucketKey(item.tribe_id);
  const store = safeRead<ChallengeBuckets>(LS_CHALLENGES, {});
  const cur = store[key] ?? [];
  store[key] = [item, ...cur];
  safeWrite(LS_CHALLENGES, store);
  return item;
}

/* --------------------------- submissions & ranking ------------------------- */

export async function getChallengeSubmissions(challengeId: ID): Promise<TribeChallengeSubmission[]> {
  const all = safeRead<SubmissionBuckets>(LS_SUBS, {});
  return all[challengeId] ?? [];
}

/** Gevraagde export door useTribeChallenges.ts */
export async function createChallengeSubmission(
  input: Omit<TribeChallengeSubmission, "id" | "createdAt">
): Promise<TribeChallengeSubmission> {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const submission: TribeChallengeSubmission = { id, createdAt, ...input };
  const store = safeRead<SubmissionBuckets>(LS_SUBS, {});
  const key = (input as any).challenge_id || (input as any).challengeId || "";
  const cur = store[key] ?? [];
  store[key] = [submission, ...cur];
  safeWrite(LS_SUBS, store);
  return submission;
}

export async function getTribeRanking(tribeId: ID): Promise<TribeRanking[]> {
  // Ranking op basis van #submissions per user binnen challenges van deze tribe.
  const challenges = await getTribeChallenges(tribeId);
  const subStore = safeRead<SubmissionBuckets>(LS_SUBS, {});
  const counts = new Map<string, number>();

  for (const ch of challenges) {
    const cid = ch.id;
    const subs = subStore[cid] ?? [];
    for (const s of subs) {
      const uid = (s as any).user_id || (s as any).userId || "anon";
      counts.set(uid, (counts.get(uid) ?? 0) + 1);
    }
  }

  const result: TribeRanking[] = Array.from(counts.entries())
    .map(([user_id, score]) => ({ user_id, score, tribe_id: tribeId }))
    .sort((a, b) => b.score - a.score);

  return result;
}

/* ----------------------------- update status API --------------------------- */

type ChallengeStatus = "draft" | "open" | "closed" | "archived";

/**
 * Update de status van een challenge op basis van `challengeId`.
 * Zoekt in alle tribe-buckets; past `status` (en logisch `ends_at`) aan en retourneert de bijgewerkte challenge.
 */
export async function updateTribeChallengeStatus(
  challengeId: ID,
  nextStatus: ChallengeStatus
): Promise<TribeChallenge | null> {
  const store = safeRead<ChallengeBuckets>(LS_CHALLENGES, {});
  let updated: TribeChallenge | null = null;

  for (const key of Object.keys(store)) {
    const list = store[key] ?? [];
    const idx = list.findIndex(c => c.id === challengeId);
    if (idx === -1) continue;

    const prev = list[idx];
    const patch: Partial<TribeChallenge> = { status: nextStatus };

    // Logica: bij sluiten → zet ends_at = nu als die ontbreekt;
    // bij openen → verleng korte events indien al voorbij.
    const now = new Date();
    if (nextStatus === "closed") {
      if (!prev.ends_at) patch.ends_at = now.toISOString();
    } else if (nextStatus === "open") {
      const ends = prev.ends_at ? new Date(prev.ends_at) : null;
      if (ends && ends < now) {
        const extend = new Date();
        extend.setDate(extend.getDate() + 7);
        patch.ends_at = extend.toISOString();
      }
    }

    const merged: TribeChallenge = { ...prev, ...patch };
    list[idx] = merged;
    store[key] = list;
    updated = merged;
    break;
  }

  if (updated) safeWrite(LS_CHALLENGES, store);
  return updated;
}

/** Eventuele alias die elders kan voorkomen. */
export async function updateChallengeStatus(
  challengeId: ID,
  nextStatus: ChallengeStatus
): Promise<TribeChallenge | null> {
  return updateTribeChallengeStatus(challengeId, nextStatus);
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
  updateTribeChallengeStatus,
  updateChallengeStatus,
};