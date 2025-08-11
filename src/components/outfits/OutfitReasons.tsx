export default function OutfitReasons({ match = 78, season = 'Seizoen', color }: { match?: number; season?: string; color?: string }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-500">
      <span className="rounded-full border border-gray-200 px-2 py-0.5 bg-white">
        Match {Math.round(match)}%
      </span>
      <span className="rounded-full border border-gray-200 px-2 py-0.5 bg-white">
        {season}
      </span>
      {color && (
        <span className="rounded-full border border-gray-200 px-2 py-0.5 bg-white">
          {color}
        </span>
      )}
    </div>
  );
}