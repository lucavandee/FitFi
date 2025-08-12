import React from "react";
import { useBestChallenge } from "@/hooks/useBestChallenge";
import { routeTo } from "@/services/navigation/NavigationService";
import { useUser } from "@/context/UserContext";
import { useTribeChallenges } from "@/hooks/useTribeChallenges";
import ImageWithFallback from "@/components/ui/ImageWithFallback";

export const ChallengeSnapshot: React.FC = () => {
  const { user } = useUser();
  const { best, loading } = useBestChallenge(user?.id);

  if (loading) {
    return <div className="bg-white rounded-2xl p-4 shadow animate-pulse h-40" />;
  }
  if (!best?.tribeId || !best?.challengeId) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow flex flex-col justify-between">
        <div className="font-semibold">Challenges Snapshot</div>
        <div className="text-sm text-gray-600">Geen open challenge gevonden. Ontdek tribes en vind jouw challenge.</div>
        <a className="mt-2 text-[#6b21a8] font-medium" href={routeTo("tribe", {})}>Naar Tribes →</a>
      </div>
    );
  }

  const { data: list } = useTribeChallenges(best.tribeId);
  const ch = (list ?? []).find(c => c.id === best.challengeId);

  if (!ch) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="font-semibold">Challenges Snapshot</div>
        <a className="mt-2 inline-block text-[#6b21a8]" href={routeTo("challenge", best)}>Open challenge →</a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden">
      {ch.image && <ImageWithFallback src={ch.image} alt={ch.title} className="w-full h-32 object-cover" />}
      <div className="p-4">
        <div className="text-xs text-gray-500 mb-1">{(ch.status ?? "open").toUpperCase()} • {ch.startAt?.slice(0,10)} → {ch.endAt?.slice(0,10)}</div>
        <div className="font-semibold">{ch.title}</div>
        <a className="mt-2 inline-block text-[#6b21a8] font-medium" href={routeTo("challenge", best)}>Doe mee →</a>
      </div>
    </div>
  );
};