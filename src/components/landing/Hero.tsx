// src/components/landing/Hero.tsx
import React from "react";
import { NavLink } from "react-router-dom";

/**
 * Hero sectie — opt-in polish via ff-utilities.
 * Geen gradients/overrides; we raken alleen markup/classes aan.
 */
export default function Hero() {
  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="bg-surface text-text"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm text-text/70 mb-2">GRATIS AI STYLE REPORT</p>
          <h1 id="hero-title" className="font-heading text-3xl sm:text-4xl leading-tight ff-text-balance">
            Ontdek wat jouw stijl over je zegt
          </h1>
          <p className="mt-3 text-base text-text/80">
            Beantwoord 6 korte vragen en ontvang direct een persoonlijk stijlprofiel met outfits en shoplinks — privacy-first, zonder ruis.
          </p>

          <div className="ff-hero-cta-row mt-5">
            <NavLink to="/hoe-het-werkt" className="ff-btn ff-btn-primary h-10">
              Start gratis
            </NavLink>
            <NavLink to="/prijzen" className="ff-btn ff-btn-secondary h-10">
              Bekijk voorbeeld
            </NavLink>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm text-text/70">
            <li>100% gratis</li>
            <li>Klaar in 2 min</li>
            <li>Outfits + shoplinks</li>
            <li>Privacy-first</li>
          </ul>
        </div>
      </div>
    </section>
  );
}