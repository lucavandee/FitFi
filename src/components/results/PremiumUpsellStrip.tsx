import React from "react";
import { useNavigate } from "react-router-dom";

type Props = {
  onCta?: () => void;           // optioneel analytics hook
  className?: string;
};

const PremiumUpsellStrip: React.FC<Props> = ({ onCta, className }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    onCta?.();
    navigate("/pricing#premium"); // of jouw upgrade route
  };

  return (
    <section
      className={`res-upsell ${className ?? ""}`}
      aria-labelledby="upsell-heading"
    >
      <div className="res-upsell__copy">
        <p className="eyebrow">Upgrade</p>
        <h3 id="upsell-heading" className="res-upsell__title">
          Ontgrendel <span>9+ extra outfits</span> per silhouet
        </h3>
        <p className="res-upsell__sub">
          Inclusief seizoensvarianten, materiaal-tips en pro-shoppinglinks — privacy-first.
        </p>

        <ul className="res-upsell__benefits" aria-label="Wat je erbij krijgt">
          <li>Meer varianten per silhouet & seizoen</li>
          <li>Heldere onderbouwing per outfit</li>
          <li>Exclusieve shopfilters (materiaal, fit, kleurtemperatuur)</li>
        </ul>

        <div className="res-upsell__ctas">
          <button
            className="btn btn--primary"
            onClick={handleClick}
            aria-label="Ontgrendel premium outfits"
          >
            Ontgrendel premium outfits
          </button>

          <a className="btn btn--ghost" href="/pricing">
            Bekijk pakketten
          </a>
        </div>
      </div>

      {/* Teasers (blurred) — bewijzen de waarde zonder echte assets */}
      <div className="res-upsell__teasers" aria-hidden="true">
        <div className="teaser">
          <div className="teaser__tile" data-arch="smart" />
          <div className="teaser__tile" data-arch="smart" />
          <div className="teaser__tile" data-arch="smart" />
          <div className="teaser__tile" data-arch="smart" />
          <div className="teaser__lock">🔒</div>
        </div>
        <div className="teaser">
          <div className="teaser__tile" data-arch="mono" />
          <div className="teaser__tile" data-arch="mono" />
          <div className="teaser__tile" data-arch="mono" />
          <div className="teaser__tile" data-arch="mono" />
          <div className="teaser__lock">🔒</div>
        </div>
        <div className="teaser">
          <div className="teaser__tile" data-arch="ath" />
          <div className="teaser__tile" data-arch="ath" />
          <div className="teaser__tile" data-arch="ath" />
          <div className="teaser__tile" data-arch="ath" />
          <div className="teaser__lock">🔒</div>
        </div>
      </div>
    </section>
  );
};

export default PremiumUpsellStrip;