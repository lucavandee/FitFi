export type ChallengeCardProps = {
  c: TribeChallenge | Partial<TribeChallenge>;
};

function ChallengeCard({ c }: ChallengeCardProps) {
  return (
    <div className="rounded-xl border border-surface p-3">
      <div className="font-medium">{c?.title || "Challenge"}</div>
      <div className="text-sm opacity-70">{c?.status || "open"}</div>
    </div>
  );
}

export default ChallengeCard;