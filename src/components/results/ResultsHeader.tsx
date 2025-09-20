import React from "react";

type Props = {
  title: string;
  subtitle?: string;
  badges?: string[];
};

const ResultsHeader: React.FC<Props> = ({ title, subtitle, badges = [] }) => {
  return (
    <header className="section-header">
      <p className="kicker">Style Report</p>
      <h1 className="section-title">{title}</h1>
      {subtitle && <p className="section-intro">{subtitle}</p>}
      {badges.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {badges.map((b) => (
            <span key={b} className="chip">{b}</span>
          ))}
        </div>
      )}
    </header>
  );
};

export default ResultsHeader;