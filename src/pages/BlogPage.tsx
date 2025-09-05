import { Helmet } from "react-helmet-async";

export default function Blog() {
  return (
    <div className="ff-card">
      <Helmet><title>Blog — FitFi</title></Helmet>
      <h1 className="ff-hero-title mb-3">Blog</h1>
      <p className="text-midnight/70">Deze pagina is klaar voor integratie van de volledige functionaliteit. De codebase is opgeschoond zodat de build stabiel draait.</p>
    </div>
  );
}