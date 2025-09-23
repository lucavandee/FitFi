import React from "react";
import { Link, useNavigate } from "react-router-dom";

type Props = {
  onCta?: () => void;
  className?: string;
};

const PremiumUpsellStrip: React.FC<Props> = ({ onCta, className }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    onCta?.();
    navigate("/prijzen#premium");
  };

  return (
    <header className={className ?? ""}>
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-xl">Upgrade naar Pro</h3>
        <div className="flex items-center gap-2">
          <button onClick={handleClick} className="ff-btn ff-btn-primary h-10">Ontgrendel premium</button>
          <Link to="/prijzen" className="ff-btn ff-btn-secondary h-10">Bekijk plannen</Link>
        </div>
      </div>
    </header>
  );
};

export default PremiumUpsellStrip;