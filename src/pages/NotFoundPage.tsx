import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage: React.FC = () => {
  return (
    <main className="ff-container ff-section" aria-labelledby="notfound-heading">
      <h1 id="notfound-heading" className="ff-h1">Pagina niet gevonden</h1>
      <p className="ff-body">
        De pagina die je zocht bestaat niet (404). Ga terug naar de{" "}
        <Link to="/" className="ff-link">homepage</Link> of bekijk{" "}
        <Link to="/results" className="ff-link">je resultaten</Link>.
      </p>
    </main>
  );
};

export default NotFoundPage;