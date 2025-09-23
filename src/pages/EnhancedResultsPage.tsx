import React from "react";
import { Helmet } from "react-helmet-async";
import { Helmet } from 'react-helmet-async';
import ResultsHeader from '@/components/results/ResultsHeader';

/**
 * EnhancedResultsPage
 * - Syntactisch sluitende JSX (geen zwerftags of dubbele haakjes)
 * - Geen extra imports nodig (dus geen kans op import-resolutie errors)
 * - Classes afgestemd op de eerder aangeleverde polish (.res-hero, .chips, .res-grid, .res-card, etc.)
 * - Vult de grid met drie voorbeeldkaarten als er (nog) geen data is
 */

type CardItem = {
  id: string;
  title: string;
  bullets: string[];
  // voor nu placeholder tiles; vervang door echte urls wanneer beschikbaar
  tiles: string[];
};

const fallbackCardItems: CardItem[] = [
  {
    id: "smart-casual",
    title: "Smart casual (dagelijks)",
    bullets: [
      "Netter denim — rechte pijp",
      "Witte sneaker — minimal",
      "Licht overshirt — koele tint",
    ],
    tiles: ["", "", "", ""],
  },
  {
    id: "mono-workday",
    title: "Monochrome workday",
    bullets: [
      "Fijngebreide crew — off-white",
      "Wolmix pantalon — rechte pijp",
      "Leren loafer — clean buckle",
    ],
    tiles: ["", "", "", ""],
  },
  {
    id: "athflow-weekend",
    title: "Athflow weekend",
    bullets: ["Merino zip hoodie", "Tech jogger", "Minimal runner"],
    tiles: ["", "", "", ""],
  },
];

const EnhancedResultsPage: React.FC = () => {
  const cards = fallbackCardItems;
  return (
    <>
      <Helmet>
        <title>Jouw Stijlanalyse Resultaten - FashionFinder</title>
        <meta name="description" content="Ontdek jouw persoonlijke stijl en shop de perfecte outfits die bij je passen." />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <main className="ff-results">
    <>
      <Helmet>
        <title>Jouw Styling Resultaten - FitFi</title>
        <meta name="description" content="Ontdek je gepersonaliseerde outfit-aanbevelingen, perfect afgestemd op jouw stijl en voorkeuren." />
      </Helmet>
      
          <div className="res-grid">
            <article className="res-card card">
              <div className="res-card__tiles">
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
          </div>
              <div className="res-card__body">
                <h3 className="res-card__title">Casual Weekend Look</h3>
                <p className="text-muted">
                  Perfect voor ontspannen weekenden. De zachte kleuren en comfortabele pasvorm 
                  passen bij je voorkeur voor casual elegantie.
                </p>
                <div className="d-flex">
                  <button className="btn btn--primary">Shop look</button>
                  <button className="btn btn--ghost">Bekijk details</button>
                </div>
              </div>
            </article>
            <ul className="chips" aria-label="USP's">
            <article className="res-card card">
              <div className="res-card__tiles">
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="res-card__mosaic">
              <div className="res-card__body">
                <h3 className="res-card__title">Business Professional</h3>
                <p className="text-muted">
                  Strak en professioneel voor belangrijke meetings. De donkere tinten 
                  en getailleerde snit geven je de zelfverzekerde uitstraling die je zoekt.
                </p>
                <div className="d-flex">
                  <button className="btn btn--primary">Shop look</button>
                  <button className="btn btn--ghost">Bekijk details</button>
                </div>
              </div>
            </article>
                  ))}
            <article className="res-card card">
              <div className="res-card__tiles">
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />
                <div className="skel round" style={{aspectRatio:'1/1'}} />

              <div className="res-card__body">
                <h3 className="res-card__title">Evening Chic</h3>
                <p className="text-muted">
                  Elegant en verfijnd voor speciale gelegenheden. De luxe materialen 
                  en subtiele details maken deze look perfect voor avonduitjes.
                </p>
                <div className="d-flex">
                  <button className="btn btn--primary">Shop look</button>
                  <button className="btn btn--ghost">Bekijk details</button>
                </div>
              </div>
            </article>
          </div>
        </main>
      </section>
    </>
  );
};

export default EnhancedResultsPage;