import React from "react";
import { useTribeRanking } from "@/hooks/useTribeChallenges";
import { Clock } from "lucide-react";

export const RankingBoard: React.FC = () => {
  const { data, isLoading, error } = useTribeRanking();

  if (isLoading) return <p className="text-center py-6">Laden...</p>;
  if (error) return <p className="text-center text-red-500 py-6">Ranking kon niet geladen worden.</p>;
  if (!data || !Array.isArray(data) || data.length === 0) {
    return <p className="text-center text-gray-500 py-6">Nog geen ranking.</p>;
  }

  const updatedAt = data[0]?.updatedAt ? new Date(data[0].updatedAt).toLocaleString() : null;

  return (
    <div className="bg-white rounded-2xl p-4 shadow">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Tribe Ranking</h3>
        {updatedAt && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Clock className="w-4 h-4" aria-hidden />
            <span>Geüpdatet: {updatedAt}</span>
          </div>
        )}
      </div>
      <ul className="divide-y">
        {data.map((r, idx) => (
          <li key={r.tribeId ?? idx} className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center font-semibold">
                {typeof r.rank === "number" ? r.rank : idx + 1}
              </span>
              <span className="font-medium">
                {r.tribeId ?? "Onbekende tribe"}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              {typeof r.points === "number" ? r.points : 0} punten
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};