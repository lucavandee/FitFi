import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <section className="ff-section bg-white">
      <div className="ff-container">
        <h1 className="ff-h1">Pagina niet gevonden</h1>
        <p className="ff-body text-[var(--color-muted)] mt-2">
          De pagina die je zocht bestaat niet (404). Ga terug naar de{" "}
          <a href="/" className="ff-link">homepage</a> of bekijk{" "}
          <a href="/results" className="ff-link">je resultaten</a>.
        </p>
      </div>
    </section>
  );
};

export default NotFoundPage;