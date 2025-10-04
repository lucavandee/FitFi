import React from "react";
import { Quote, Star } from "lucide-react";
import SmartImage from "@/components/media/SmartImage";

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  avatar: string;
  rating: number;
}

import Container from '../layout/Container';

interface SocialProofProps {
  className?: string;
}

const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote:
      "Verbazingwekkend hoe accuraat het rapport mijn stijl en persoonlijkheid samenvat. De outfits kloppen echt.",
    author: "Sanne, Amsterdam",
    avatar: "/images/avatars/sanne.jpg",
    rating: 5,
  },
  {
    id: "t2",
    quote:
      "Binnen twee minuten had ik een plan én items die ik direct kon shoppen. Scheelt tijd en miskopen.",
    author: "Milan, Utrecht",
    avatar: "/images/avatars/milan.jpg",
    rating: 5,
  },
];

const SocialProof: React.FC<SocialProofProps> = ({ className = "" }) => {
  return (
    <section className={`py-16 bg-white ${className}`} aria-labelledby="social-proof-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 id="social-proof-heading" className="text-2xl md:text-3xl font-semibold text-[color:var(--color-text)]">
            Wat anderen zeggen over hun AI Style Report
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="bg-[color:var(--color-surface)] rounded-2xl p-8 premium-shadow border border-[color:var(--color-border)]"
            >
              <div className="flex items-center mb-6">
                <Quote className="text-[color:var(--ff-color-primary-600)] mr-3" size={24} aria-hidden="true" />
                <div className="flex" aria-label={`${t.rating} van 5 sterren`}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="text-[color:var(--ff-color-primary-600)]" size={16} aria-hidden="true" />
                  ))}
                </div>
              </div>

              <blockquote className="text-lg text-[color:var(--color-text)] leading-relaxed mb-6 italic">
                "{t.quote}"
              </blockquote>

              <div className="flex items-center gap-3">
                <SmartImage
                  id={`avatar-${t.id}`}
                  kind="avatar"
                  src={t.avatar}
                  alt={`Avatar van ${t.author}`}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="text-sm font-medium text-[color:var(--color-text)]">{t.author}</div>
                  <div className="text-xs text-[color:var(--color-muted)]">Geverifieerde gebruiker</div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-2 text-sm text-[color:var(--color-muted)]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[color:var(--color-success)]" />
              <span>10.000+ rapporten gegenereerd</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[color:var(--ff-color-primary-600)]" />
              <span>4.8/5 gemiddelde beoordeling</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[color:var(--color-accent)]" />
              <span>95% nauwkeurigheid (interne survey)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;