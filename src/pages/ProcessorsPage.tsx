// /src/pages/ProcessorsPage.tsx
import React from "react";

type Proc = { name: string; purpose: string; region: string };

const PROCESSORS: Proc[] = [
  { name: "Hosting & database", purpose: "Hosting, opslag en back-ups", region: "EU" },
  { name: "E-mail (transactioneel)", purpose: "Berichten en verificaties", region: "EU/EEA" },
  { name: "Analytics (privacy-vriendelijk)", purpose: "Gebruiksinzichten zonder tracking", region: "EU" },
];

export default function ProcessorsPage() {
  return (
    <main id="main" className="bg-bg text-text">
      <section className="ff-container ff-stack-lg py-12 sm:py-14">
        <header className="ff-stack">
          <p className="text-sm text-text/70">Overzicht verwerkers</p>
          <h1 className="font-heading text-2xl sm:text-3xl">Verwerkers</h1>
          <p className="text-text/80 max-w-2xl">
            Met iedere verwerker hebben we een verwerkersovereenkomst; we kiezen standaard voor EU-hosting.
          </p>
        </header>

        <div className="ff-card p-0 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead className="bg-surface">
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-sm font-semibold text-text">Partij</th>
                <th className="px-4 py-3 text-sm font-semibold text-text">Doel</th>
                <th className="px-4 py-3 text-sm font-semibold text-text">Regio</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSORS.map((p) => (
                <tr key={p.name} className="border-b border-border">
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-text/90">{p.purpose}</td>
                  <td className="px-4 py-3 text-text/70">{p.region}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm text-text/70">
          Laatste update: {new Date().toISOString().slice(0, 10)} — wijzigingen communiceren we via deze pagina.
        </p>
      </section>
    </main>
  );
}