export default function useTribeMembership(tribeId?: string) {
  return { isMember: false, join: async () => true, leave: async () => true, tribeId };
}