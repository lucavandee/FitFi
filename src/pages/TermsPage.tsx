import React from 'react';
import { Helmet } from 'react-helmet-async';
import MarkdownPage from '../components/ui/MarkdownPage';

const TermsPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Algemene Voorwaarden - Gebruiksvoorwaarden FitFi | FitFi</title>
        <meta name="description" content="Lees onze algemene voorwaarden en gebruiksvoorwaarden voor het gebruik van FitFi's AI-powered styling platform." />
        <meta property="og:title" content="Algemene Voorwaarden - Gebruiksvoorwaarden FitFi" />
        <meta property="og:description" content="Gebruiksvoorwaarden voor FitFi's AI-powered styling platform." />
        <link rel="canonical" href="https://fitfi.app/algemene-voorwaarden" />
      </Helmet>
      
      <MarkdownPage
        title="Algemene Voorwaarden"
        description="Gebruiksvoorwaarden voor FitFi"
        markdownPath="/content/legal/algemene-voorwaarden.md"
        downloadUrl="/documents/algemene-voorwaarden.pdf"
        backLink="/"
        backLabel="Terug naar home"
      />
    </>
  );
};

export default TermsPage;