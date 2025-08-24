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
    return (
      <div className="bg-white rounded-2xl p-4 shadow animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-32 mb-3"></div>
        <div className="h-20 bg-gray-200 rounded-xl mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
    );
  }

  if (!best?.tribeId || !best?.challengeId) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="font-semibold text-gray-900 mb-3">
          Challenges Snapshot
        </div>
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h4 className="font-medium text-gray-900 mb-2">
            Geen open challenges
          </h4>
          <p className="text-sm text-gray-600 mb-4">
            Ontdek tribes en vind jouw perfecte challenge.
          </p>
          <a
            className="inline-block bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-4 py-2 rounded-xl font-medium transition-colors"
            href={routeTo("tribe", {})}
          >
            Ontdek Tribes →
          </a>
        </div>
      </div>
    );
  }

  const { data: list } = useTribeChallenges(best.tribeId);
  const ch = (list ?? []).find((c) => c.id === best.challengeId);

  if (!ch) {
    return (
      <div className="bg-white rounded-2xl p-4 shadow">
        <div className="font-semibold text-gray-900 mb-3">
          Challenges Snapshot
        </div>
        <div className="text-center py-4">
          <p className="text-sm text-gray-600 mb-3">
            Challenge wordt geladen...
          </p>
          <a
            className="inline-block text-[#89CFF0] hover:text-[#89CFF0]/80 font-medium"
            href={routeTo("challenge", best)}
          >
            Open challenge →
          </a>
        </div>
      </div>
    );
  }

  // Build challenge URL with proper query params
  const challengeUrl = `/tribes/${best.tribeId}?challengeId=${best.challengeId}`;

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden hover:shadow-md transition-shadow">
      {ch.image && (
        <div className="aspect-video overflow-hidden">
          <ImageWithFallback
            src={ch.image}
            alt={ch.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            componentName="ChallengeSnapshot"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
            {(ch.status ?? "open").toUpperCase()}
          </span>
          {ch.rewardPoints && (
            <span className="px-2 py-1 bg-[#89CFF0]/10 text-[#89CFF0] rounded-full text-xs font-medium">
              +{ch.rewardPoints} XP
            </span>
          )}
        </div>

        <h4 className="font-semibold text-gray-900 mb-2 leading-tight">
          {ch.title}
        </h4>

        {ch.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {ch.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {ch.endAt && (
              <>Eindigt: {new Date(ch.endAt).toLocaleDateString("nl-NL")}</>
            )}
          </div>

          <a
            className="inline-flex items-center bg-[#89CFF0] hover:bg-[#89CFF0]/90 text-[#0D1B2A] px-3 py-2 rounded-xl font-medium transition-all hover:scale-105"
            href={challengeUrl}
          >
            Doe mee →
          </a>
        </div>
      </div>
    </div>
  );
};
