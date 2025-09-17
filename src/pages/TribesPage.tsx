import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { ArrowRight, Plus, Users } from "lucide-react";
import Button from "@/components/ui/Button";
import ImageWithFallback from "@/components/ui/ImageWithFallback";
import type { Tribe } from "@/services/data/types";
import { fetchTribes } from "@/services/data/dataService";

function TribeCard({ tribe }: { tribe: Tribe }) {
  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      <ImageWithFallback
        src={tribe.cover_img || "/images/outfit-fallback.jpg"}
        alt={tribe.name}
        ratio="wide"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#0D1B2A]">{tribe.name}</h3>
        {tribe.description ? <p className="text-sm text-gray-600 mt-1">{tribe.description}</p> : null}
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
          <span className="inline-flex items-center gap-1"><Users size={16} />{tribe.member_count ?? 0}</span>
          {tribe.user_role ? <span>• {tribe.user_role}</span> : null}
        </div>
        <div className="mt-4 flex gap-2">
          <Button icon={<ArrowRight size={16} />} iconPosition="right" variant="secondary">Bekijk tribe</Button>
          <Button icon={<Plus size={16} />}>Join</Button>
        </div>
      </div>
    </div>
  );
}

export default function TribesPage() {
  const [tribes, setTribes] = useState<Tribe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await fetchTribes();
      setTribes(data || []);
      setLoading(false);
    })();
  }, []);

  return (
    <main id="main" className="min-h-screen bg-[#F6F6F6]">
      <Helmet>
        <title>Style Tribes | FitFi</title>
        <meta name="description" content="Word lid van Style Tribes en deel je look met gelijkgestemden." />
      </Helmet>

      <div className="mx-auto max-w-6xl p-6">
        <div className="flex items-end justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#0D1B2A]">Style Tribes</h1>
            <p className="text-gray-600 mt-1">Community's voor stijlliefhebbers.</p>
          </div>
          <Button icon={<Plus size={20} />}>Maak een tribe</Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl bg-white shadow-sm animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tribes.map((t) => <TribeCard key={t.id} tribe={t} />)}
          </div>
        )}
      </div>
    </main>
  );
}