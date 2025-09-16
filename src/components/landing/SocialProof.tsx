import React from "react";
import { Quote, Star, Users } from "lucide-react";
import SmartImage from "@/components/media/SmartImage";
import { track } from "@/utils/analytics";

const TESTIMONIALS = [
  { 
    quote: "Ik snap nu waarom bepaalde fits mij wel en niet staan. De uitleg per outfit is zo helder!", 
    author: "Sanne, 29", 
    avatar: "/images/avatars/a1.jpg", 
    rating: 5,
    location: "Amsterdam"
  },
  { 
    quote: "De uitleg per outfit geeft direct vertrouwen bij het shoppen. Geen twijfel meer!", 
    author: "Jeroen, 34", 
    avatar: "/images/avatars/a2.jpg", 
    rating: 5,
    location: "Rotterdam"
  },
  { 
    quote: "Eindelijk een AI die begrijpt wat bij mijn lichaam past. Game changer!", 
    author: "Lisa, 27", 
    avatar: "/images/avatars/a3.jpg", 
    rating: 5,
    location: "Utrecht"
  },
];

const STATS = [
  { value: "10.000+", label: "Tevreden gebruikers" },
  { value: "4.8/5", label: "Gemiddelde beoordeling" },
  { value: "95%", label: "Zou FitFi aanbevelen" },
];

const SocialProof: React.FC<{ className?: string }> = ({ className = "" }) => {
  const handleTestimonialClick = (author: string, index: number) => {
    track('social_proof_testimonial_click', {
      author,
      position: index + 1,
      section: 'landing_social_proof'
    });
  };

  const handleStatsClick = (stat: string, value: string) => {
    track('social_proof_stat_click', {
      stat,
      value,
      section: 'landing_social_proof'
    });
  };

  return (
    <section className={`section bg-gradient-to-b from-[color:var(--color-bg)] to-[color:var(--color-surface)] ${className}`} aria-labelledby="sp-title">
      <div className="container">
        {/* Header */}
        <header className="max-w-3xl text-center mx-auto">
          <div className="inline-flex items-center gap-2 chip mb-4">
            <Users className="w-4 h-4" />
            <span>Wat anderen zeggen</span>
          </div>
          <h2 id="sp-title" className="hero__title">
            Duizenden mensen vonden hun perfecte stijl
          </h2>
          <p className="lead mt-4">
            Ontdek waarom FitFi de #1 AI styling assistent is in Nederland
          </p>
        </header>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {STATS.map((stat, i) => (
            <button
              key={i}
              onClick={() => handleStatsClick(stat.label, stat.value)}
              className="metric text-center p-4 rounded-xl bg-[color:var(--color-surface)] border border-[color:var(--color-border)] hover:border-[color:var(--color-primary)] transition-all duration-300 hover:scale-105"
              aria-label={`${stat.value} ${stat.label}`}
            >
              <div className="metric__value text-[color:var(--color-primary)]">{stat.value}</div>
              <div className="metric__label text-xs">{stat.label}</div>
            </button>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial, i) => (
            <article 
              key={i} 
              className="card interactive-elevate cursor-pointer group"
              onClick={() => handleTestimonialClick(testimonial.author, i)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTestimonialClick(testimonial.author, i);
                }
              }}
              aria-label={`Testimonial van ${testimonial.author}`}
            >
              <div className="card__inner">
                {/* Quote Icon */}
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-[color:var(--color-primary)] to-[color:var(--color-accent)] mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Quote className="w-4 h-4 text-white" />
                </div>

                {/* Quote */}
                <blockquote className="text-[color:var(--color-text)] leading-relaxed mb-4 group-hover:text-[color:var(--color-primary)] transition-colors duration-300">
                  "{testimonial.quote}"
                </blockquote>

                {/* Author Info */}
                <div className="flex items-center gap-3">
                  <SmartImage 
                    src={testimonial.avatar} 
                    alt={`Profielfoto van ${testimonial.author}`}
                    className="h-10 w-10 rounded-full object-cover border-2 border-[color:var(--color-border)] group-hover:border-[color:var(--color-primary)] transition-colors duration-300" 
                  />
                  <div className="flex-1">
                    <div className="font-medium text-[color:var(--color-text)] text-sm">
                      {testimonial.author}
                    </div>
                    <div className="text-xs text-[color:var(--color-muted)]">
                      {testimonial.location}
                    </div>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center gap-1" aria-label={`${testimonial.rating} van 5 sterren`}>
                    {Array.from({ length: testimonial.rating }).map((_, k) => (
                      <Star 
                        key={k} 
                        className="w-4 h-4 fill-[color:var(--color-success)] text-[color:var(--color-success)] group-hover:scale-110 transition-transform duration-300" 
                        style={{ transitionDelay: `${k * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-[color:var(--color-muted)] mb-4">
            Klaar om jouw perfecte stijl te ontdekken?
          </p>
          <button
            onClick={() => track('social_proof_cta_click', { section: 'landing_social_proof' })}
            className="btn btn-primary btn-lg"
          >
            Start je gratis style report
          </button>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;