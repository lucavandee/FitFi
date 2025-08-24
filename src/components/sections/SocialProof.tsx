import React from "react";
import { ShieldCheck, Lock, Sparkles, Quote } from "lucide-react";
import { TESTIMONIALS_FALLBACK } from "@/data/testimonials";

function Badge({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <li className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200 px-3 py-2 text-sm text-slate-700 shadow-[0_8px_30px_rgba(13,27,42,0.06)]">
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span>{text}</span>
    </li>
  );
}

function TestimonialCard({
  q,
  a,
  r,
  av,
}: {
  q: string;
  a: string;
  r?: string;
  av?: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(13,27,42,0.06)]">
      <Quote className="w-5 h-5 text-slate-400" aria-hidden="true" />
      <blockquote className="mt-2 text-slate-700 leading-relaxed">
        "{q}"
      </blockquote>
      <div className="mt-4 flex items-center gap-3">
        {av && (
          <img
            src={av}
            alt=""
            onError={(e: any) => {
              e.currentTarget.style.display = "none";
            }}
            className="w-9 h-9 rounded-full object-cover"
          />
        )}
        <div className="text-sm">
          <div className="font-semibold text-[#0D1B2A]">{a}</div>
          {r && <div className="text-slate-500">{r}</div>}
        </div>
      </div>
    </article>
  );
}

export default function SocialProof() {
  const testimonials = TESTIMONIALS_FALLBACK.slice(0, 2);

  return (
    <section
      aria-labelledby="social-proof-heading"
      className="mx-auto max-w-7xl px-4 sm:px-6 my-16"
    >
      <div className="mb-6">
        <p className="text-sm font-medium text-[#89CFF0]">Vertrouwen</p>
        <h2
          id="social-proof-heading"
          className="text-2xl md:text-3xl font-light text-[#0D1B2A]"
        >
          Gebouwd op duidelijkheid en privacy
        </h2>
      </div>

      {/* Trust Badges */}
      <ul className="flex flex-wrap gap-3 mb-8" role="list">
        <Badge icon={Lock} text="Privacy-first (AVG)" />
        <Badge icon={ShieldCheck} text="Beveiligd met SSL" />
        <Badge icon={Sparkles} text="AI-uitleg bij elke outfit" />
      </ul>

      {/* Testimonials */}
      <div className="grid gap-6 md:grid-cols-2">
        {testimonials.map((t) => (
          <TestimonialCard
            key={t.id}
            q={t.quote}
            a={t.author}
            r={t.role}
            av={t.avatar}
          />
        ))}
      </div>

      {/* Trust Indicators */}
      <div className="mt-8 flex flex-wrap justify-center items-center space-x-8 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>10.000+ rapporten gegenereerd</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>4.8/5 gemiddelde beoordeling</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span>95% nauwkeurigheid</span>
        </div>
      </div>
    </section>
  );
}
