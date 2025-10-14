// Minimal shims voor Tribes features (nog niet live)
export type TribePost = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

export type TribeChallenge = {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed';
};

export function useTribePosts() {
  return {
    posts: [] as TribePost[],
    loading: false,
    error: null
  };
}

export function useTribeChallenges() {
  return {
    challenges: [] as TribeChallenge[],
    loading: false,
    error: null
  };
}

export function useTribeMembership() {
  return {
    isMember: false,
    loading: false,
    join: () => Promise.resolve(),
    leave: () => Promise.resolve()
  };
}