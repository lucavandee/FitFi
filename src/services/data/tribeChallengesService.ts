import type { TribeChallenge, TribeChallengeSubmission, TribeRanking } from "./types";

export async function getTribeChallenges(_tribeId?: string): Promise<TribeChallenge[]> {
  return [
    { 
      id: "c-1", 
      title: "Monochrome Week", 
      description: "Zwart-wit looks 7 dagen lang",
      tribe_id: _tribeId || "t-1",
      created_by: "u-1",
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: "active" as const,
      submission_count: 0
    },
    {
      id: "c-2",
      title: "Sustainable Style",
      description: "Outfits met alleen duurzame merken",
      tribe_id: _tribeId || "t-1", 
      created_by: "u-1",
      start_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: "upcoming" as const,
      submission_count: 0
    }
  ];
}

export async function getChallengeSubmissions(_challengeId: string): Promise<TribeChallengeSubmission[]> {
  return [
    {
      id: "s-1",
      challenge_id: _challengeId,
      user_id: "u-1",
      image_url: "/images/fallbacks/default.jpg",
      description: "Mijn monochrome look voor vandaag",
      created_at: new Date().toISOString(),
      likes_count: 3,
      comments_count: 1
    }
  ];
}

export async function getTribeRanking(_tribeId: string): Promise<TribeRanking[]> {
  return [
    {
      id: "r-1",
      tribe_id: _tribeId,
      user_id: "u-1",
      username: "StyleMaven",
      points: 150,
      rank: 1,
      challenges_completed: 3,
      submissions_count: 5
    },
    {
      id: "r-2", 
      tribe_id: _tribeId,
      user_id: "u-2",
      username: "MinimalChic",
      points: 120,
      rank: 2,
      challenges_completed: 2,
      submissions_count: 4
    }
  ];
}