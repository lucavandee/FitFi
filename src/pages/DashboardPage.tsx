import React, { useEffect, useState } from "react";
import supabase from "@/lib/supabase";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const sb = supabase; // object (niet aanroepen)
      const { data: { session } } = await sb.auth.getSession();
      if (!mounted) return;
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-surface px-4 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-heading font-bold text-ink">
            {loading ? "Dashboard" : `Welkom${email ? `, ${email}` : ""}`}
          </h1>
          <p className="text-muted mt-1">Jouw persoonlijke stijl-overzicht</p>
        </header>

        <section className="grid gap-6 md:grid-cols-3">
          <div className="ff-card p-6">
            <div className="text-sm text-muted">Matchscore</div>
            <div className="mt-2 text-4xl font-bold">95%</div>
          </div>
          <div className="ff-card p-6">
            <div className="text-sm text-muted">Outfits bekeken</div>
            <div className="mt-2 text-4xl font-bold">24</div>
          </div>
          <div className="ff-card p-6">
            <div className="text-sm text-muted">Badges</div>
            <div className="mt-2 text-4xl font-bold">3</div>
          </div>
        </section>

        <section className="ff-card p-6">
          <h2 className="text-lg font-semibold mb-2">Aan de slag</h2>
          <p className="text-sm text-muted">
            Doe de stijlscan en ontvang een uitleg + outfits op maat.
          </p>
          <div className="mt-4">
            <a href="/onboarding" className="btn btn-primary">Start stijltest</a>
          </div>
        </section>
      </div>
    </div>
  );
}