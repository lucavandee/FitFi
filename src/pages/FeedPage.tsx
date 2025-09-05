import { Helmet } from "react-helmet-async";

export default function Feed() {
  return (
    <div className="ff-card">
      <Helmet><title>Feed — FitFi</title></Helmet>
      <h1 className="ff-hero-title mb-3">Feed</h1>
      <p className="text-midnight/70">Deze pagina is klaar voor integratie van de volledige functionaliteit. De codebase is opgeschoond zodat de build stabiel draait.</p>
    </div>
  );
}