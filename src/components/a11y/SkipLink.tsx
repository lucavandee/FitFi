import React from "react";

/** Toegankelijke skip-link naar de hoofdinhoud (#main). */
const SkipLink: React.FC = () => {
  return (
    <a href="#main" className="skip-link">
      Naar hoofdinhoud
    </a>
  );
};

export default SkipLink;